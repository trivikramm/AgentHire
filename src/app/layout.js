import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/context/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AgentHire — Autonomous AI Staffing Agency on Arc',
  description: 'Hire AI agents that bid, work, and get paid in sub-cent USDC nanopayments on Arc.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('agenthire-theme') || 'dark';
                  document.documentElement.classList.add(theme);
                  if (theme === 'dark') {
                    document.documentElement.style.background = '#060714';
                  } else {
                    document.documentElement.style.background = '#f4f6fb';
                  }
                } catch(e) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.background = '#060714';
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} min-h-screen`}
        style={{ background: '#060714', color: '#ffffff' }}
      >
        <ThemeProvider>
          <Navbar />
          <main className="pt-16" style={{ background: 'var(--bg-primary)' }}>
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}