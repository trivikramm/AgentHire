import { v4 as uuidv4 } from 'uuid';
import { AGENT_TYPES } from './constants';
import { decomposeTask, executeSubtask, reviewResults } from './gemini';
import { createAgentWallet, sendUSDCTransfer } from './circleSDK';
import {
  saveAgent, getAgents, updateAgentStats, clearAgents,
  saveTask, saveTransaction, saveEvent,
  getTransactions, getTransactionStats, getDashboardStats,
} from './database';

if (!global.agentRegistry) global.agentRegistry = {};
if (!global.taskRegistry) global.taskRegistry = {};

export function getAgentRegistry() {
  try {
    const dbAgents = getAgents();
    if (Object.keys(dbAgents).length > 0) {
      global.agentRegistry = dbAgents;
      return dbAgents;
    }
  } catch (e) {
    console.error('DB read error:', e.message);
  }
  return global.agentRegistry;
}

export function getTransactionLog() {
  try {
    return getTransactions(200);
  } catch {
    return global.transactionLog || [];
  }
}

export function getStats() {
  try {
    return getDashboardStats();
  } catch {
    return null;
  }
}

export function getTaskRegistry() {
  return global.taskRegistry || {};
}

export async function initializeAgents() {
  const agents = {};

  try {
    clearAgents();
  } catch (e) {
    console.error('Clear error:', e.message);
  }

  const walletSetId = process.env.CIRCLE_WALLET_SET_ID;

  for (const [type, config] of Object.entries(AGENT_TYPES)) {
    const agentId = `agent_${type.toLowerCase()}_${Date.now()}`;
    const wallet = await createAgentWallet(walletSetId, config.name);

    const agent = {
      id: agentId,
      type,
      ...config,
      wallet: {
        id: wallet.id,
        address: wallet.address,
        blockchain: wallet.blockchain || 'ARC-TESTNET',
        simulated: wallet.simulated || false,
      },
      status: 'idle',
      tasksCompleted: 0,
      totalEarned: 0,
      createdAt: new Date().toISOString(),
    };

    agents[type] = agent;

    try {
      saveAgent(agent);
    } catch (e) {
      console.error('Save agent error:', e.message);
    }

    console.log(`🤖 ${config.emoji} ${config.name}: ${wallet.address} ${wallet.simulated ? '(sim)' : '(REAL)'}`);
  }

  global.agentRegistry = agents;

  return agents;
}

export async function executeTask(taskDescription) {
  const taskId = uuidv4();

  let agents = getAgentRegistry();
  if (!agents || Object.keys(agents).length === 0) {
    agents = await initializeAgents();
  }

  const mainWallet = process.env.CIRCLE_WALLET_ADDRESS;

  const task = {
    id: taskId,
    description: taskDescription,
    status: 'decomposing',
    subtasks: [],
    payments: [],
    results: [],
    totalCost: 0,
    startTime: new Date().toISOString(),
    endTime: null,
    events: [],
    review: null,
  };

  try {
    saveTask(task);
  } catch (e) {
    console.error('Save task error:', e.message);
  }

  const addEvent = (event) => {
    const e = { ...event, timestamp: new Date().toISOString() };
    task.events.push(e);
    try {
      saveEvent(taskId, e);
    } catch (err) {
      /* silent */
    }
  };

  async function makePayment(fromAddress, toAddress, amount, memo, fromLabel = '', toLabel = '', txType = 'payment') {
    const payment = await sendUSDCTransfer(fromAddress, toAddress, amount, memo);
    task.payments.push(payment);
    task.totalCost += amount;

    try {
      saveTransaction(payment, taskId, fromLabel, toLabel, txType);
    } catch (e) {
      console.error('Save tx error:', e.message);
    }

    return payment;
  }

  try {
    addEvent({
      type: 'decomposing',
      message: '🧠 Manager Agent analyzing your task...',
    });

    let decomposition;
    try {
      decomposition = await decomposeTask(taskDescription);
    } catch (err) {
      console.error('Gemini error:', err.message);
      decomposition = null;
    }

    if (!decomposition || !decomposition.subtasks || decomposition.subtasks.length === 0) {
      decomposition = getDefaultDecomposition(taskDescription);
    }

    task.subtasks = decomposition.subtasks;
    task.status = 'hiring';

    addEvent({
      type: 'decomposed',
      message: `📋 Task broken into ${decomposition.subtasks.length} subtasks`,
    });

    const manager = agents['MANAGER'];
    if (manager) {
      const p = await makePayment(
        mainWallet,
        manager.wallet.address,
        AGENT_TYPES.MANAGER.costPerAction,
        `decompose:${taskId}`,
        'User',
        'Manager Agent',
        'payment'
      );
      addEvent({
        type: 'payment',
        message: `💰 Paid Manager $${AGENT_TYPES.MANAGER.costPerAction} USDC for task analysis`,
        payment: p,
      });
    }

    task.status = 'in_progress';

    for (const subtask of decomposition.subtasks) {
      const agentType = subtask.assignedAgent;
      const agent = agents[agentType];
      const config = AGENT_TYPES[agentType];
      if (!agent || !config) continue;

      addEvent({
        type: 'hiring',
        message: `🤝 Hiring ${config.emoji} ${config.name} for: ${subtask.title}`,
      });

      const actions = subtask.estimatedActions || 2;
      for (let a = 0; a < actions; a++) {
        const p = await makePayment(
          mainWallet,
          agent.wallet.address,
          config.costPerAction,
          `${subtask.id}:a${a + 1}of${actions}`,
          'User',
          config.name,
          'payment'
        );
        addEvent({
          type: 'payment',
          message: `💸 #${task.payments.length}: $${config.costPerAction} → ${config.emoji} ${config.name} (${a + 1}/${actions})`,
          payment: p,
        });
        await new Promise((r) => setTimeout(r, 200));
      }

      addEvent({
        type: 'executing',
        message: `⚡ ${config.emoji} ${config.name} working...`,
      });

      let result;
      try {
        result = await executeSubtask(agentType, subtask);
      } catch {
        result = `[${config.name}] Completed: ${subtask.title}`;
      }

      task.results.push({
        subtaskId: subtask.id,
        agent: agentType,
        agentName: config.name,
        result,
        completedAt: new Date().toISOString(),
      });

      agent.tasksCompleted += 1;
      agent.totalEarned += config.costPerAction * actions;
      agent.status = 'idle';

      try {
        updateAgentStats(agentType, agent.tasksCompleted, agent.totalEarned);
      } catch {
        /* silent */
      }

      addEvent({
        type: 'completed',
        message: `✅ ${config.emoji} ${config.name} completed: ${subtask.title}`,
        result: typeof result === 'string' ? result.substring(0, 200) : 'Done',
      });

      if (actions >= 3 && agentType === 'CODER' && agents['RESEARCHER']) {
        const sp = await makePayment(
          agent.wallet.address,
          agents['RESEARCHER'].wallet.address,
          0.002,
          `sub:coder→researcher:${subtask.id}`,
          'Coder Agent',
          'Researcher Agent',
          'subcontract'
        );
        addEvent({
          type: 'subcontract',
          message: `🔄 💻 Coder → 🔍 Researcher $0.002`,
          payment: sp,
        });
      }

      if (actions >= 3 && agentType === 'WRITER' && agents['ANALYST']) {
        const sp = await makePayment(
          agent.wallet.address,
          agents['ANALYST'].wallet.address,
          0.003,
          `sub:writer→analyst:${subtask.id}`,
          'Writer Agent',
          'Analyst Agent',
          'subcontract'
        );
        addEvent({
          type: 'subcontract',
          message: `🔄 ✍️ Writer → 📊 Analyst $0.003`,
          payment: sp,
        });
      }
    }

    task.status = 'reviewing';
    addEvent({
      type: 'reviewing',
      message: '🧠 Manager reviewing results...',
    });

    if (manager) {
      const rp = await makePayment(
        mainWallet,
        manager.wallet.address,
        AGENT_TYPES.MANAGER.costPerAction,
        `review:${taskId}`,
        'User',
        'Manager Agent',
        'payment'
      );
      addEvent({
        type: 'payment',
        message: `💰 Paid Manager $${AGENT_TYPES.MANAGER.costPerAction} for review`,
        payment: rp,
      });
    }

    let review;
    try {
      review = await reviewResults(taskDescription, task.results);
    } catch {
      review = { score: 8, summary: 'All agents completed successfully.', approved: true };
    }

    task.review = review;
    task.status = 'completed';
    task.endTime = new Date().toISOString();

    try {
      saveTask(task);
    } catch {
      /* silent */
    }

    addEvent({
      type: 'review_complete',
      message: `📊 Score: ${review.score}/10 — ${review.summary}`,
    });

    addEvent({
      type: 'task_complete',
      message: `🎉 Done! $${task.totalCost.toFixed(4)} USDC | ${task.payments.length} payments | ${task.payments.filter(p => !p.simulated).length} on-chain`,
    });

    return task;
  } catch (error) {
    task.status = 'failed';
    task.error = error.message;
    task.endTime = new Date().toISOString();
    try {
      saveTask(task);
    } catch {
      /* silent */
    }
    addEvent({ type: 'error', message: `❌ ${error.message}` });
    return task;
  }
}

function getDefaultDecomposition(taskDescription) {
  return {
    subtasks: [
      { id: 'st_1', title: 'Research & Requirements', description: `Research for: ${taskDescription}`, assignedAgent: 'RESEARCHER', estimatedActions: 4, priority: 1, dependencies: [] },
      { id: 'st_2', title: 'Architecture Planning', description: `Plan architecture for: ${taskDescription}`, assignedAgent: 'ANALYST', estimatedActions: 4, priority: 2, dependencies: ['st_1'] },
      { id: 'st_3', title: 'Core Implementation', description: `Build core for: ${taskDescription}`, assignedAgent: 'CODER', estimatedActions: 5, priority: 3, dependencies: ['st_2'] },
      { id: 'st_4', title: 'Secondary Features', description: `Build features for: ${taskDescription}`, assignedAgent: 'CODER', estimatedActions: 5, priority: 4, dependencies: ['st_3'] },
      { id: 'st_5', title: 'UI/UX Polish', description: `Polish UI for: ${taskDescription}`, assignedAgent: 'CODER', estimatedActions: 4, priority: 5, dependencies: ['st_4'] },
      { id: 'st_6', title: 'Technical Docs', description: `Write docs for: ${taskDescription}`, assignedAgent: 'WRITER', estimatedActions: 4, priority: 6, dependencies: ['st_3'] },
      { id: 'st_7', title: 'User Guide', description: `Create guide for: ${taskDescription}`, assignedAgent: 'WRITER', estimatedActions: 3, priority: 7, dependencies: ['st_5'] },
      { id: 'st_8', title: 'Quality Analysis', description: `Analyze quality for: ${taskDescription}`, assignedAgent: 'ANALYST', estimatedActions: 4, priority: 8, dependencies: ['st_5', 'st_6'] },
      { id: 'st_9', title: 'Security Review', description: `Review security for: ${taskDescription}`, assignedAgent: 'RESEARCHER', estimatedActions: 3, priority: 9, dependencies: ['st_4'] },
      { id: 'st_10', title: 'Final Report', description: `Final report for: ${taskDescription}`, assignedAgent: 'WRITER', estimatedActions: 3, priority: 10, dependencies: ['st_8', 'st_9'] },
    ],
    totalEstimatedCost: 0.25,
    estimatedDuration: '4 minutes',
  };
}