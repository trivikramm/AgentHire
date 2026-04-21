export function calculateMarginAnalysis(totalCost, transactionCount) {
  const ethGasPerTx = 0.50;
  const arcGasPerTx = 0.00;
  const polygonGasPerTx = 0.01;

  const ethTotalGas = transactionCount * ethGasPerTx;
  const polygonTotalGas = transactionCount * polygonGasPerTx;
  const arcTotalGas = transactionCount * arcGasPerTx;

  const ethMargin = totalCost - ethTotalGas;
  const polygonMargin = totalCost - polygonTotalGas;
  const arcMargin = totalCost - arcTotalGas;

  return {
    arc: {
      gasCost: arcTotalGas,
      totalCost: totalCost,
      margin: arcMargin,
      marginPercent: ((arcMargin / totalCost) * 100).toFixed(1),
      viable: true,
    },
    ethereum: {
      gasCost: ethTotalGas,
      totalCost: totalCost + ethTotalGas,
      margin: ethMargin,
      marginPercent: ((ethMargin / (totalCost + ethTotalGas)) * 100).toFixed(1),
      viable: ethMargin > 0,
    },
    polygon: {
      gasCost: polygonTotalGas,
      totalCost: totalCost + polygonTotalGas,
      margin: polygonMargin,
      marginPercent: ((polygonMargin / (totalCost + polygonTotalGas)) * 100).toFixed(1),
      viable: polygonMargin > 0,
    },
    transactionCount,
    avgCostPerTx: (totalCost / transactionCount).toFixed(6),
  };
}
