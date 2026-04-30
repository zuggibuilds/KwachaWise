import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

type V2PageId =
  | 'dashboard'
  | 'accounts'
  | 'transactions'
  | 'budgets'
  | 'goals'
  | 'chilimba'
  | 'paye'
  | 'bills'
  | 'recurring'
  | 'debt'
  | 'networth'
  | 'currency'
  | 'invest'
  | 'ai'
  | 'calendar'
  | 'challenges'
  | 'shared'
  | 'reports';

type TxType = 'credit' | 'debit';

type Tx = {
  icon: string;
  color: string;
  name: string;
  cat: string;
  date: string;
  amount: number;
  type: TxType;
};

type Budget = {
  name: string;
  spent: number;
  total: number;
  color: string;
};

type Goal = {
  name: string;
  saved: number;
  target: number;
  color: string;
  icon: string;
  monthly: number;
};

type Chilimba = {
  name: string;
  contribution: number;
  round: number;
  total: number;
  pool: number;
  status: string;
  next: string;
};

type BillStatus = 'overdue' | 'soon' | 'ok';

type Bill = {
  name: string;
  amount: number;
  due: string;
  icon: string;
  status: BillStatus;
};

type RecurringItem = {
  icon: string;
  name: string;
  amount: number;
  freq: string;
  next: string;
  type: TxType;
};

type Debt = {
  name: string;
  lender: string;
  total: number;
  remaining: number;
  monthly: number;
  rate: number;
  color: string;
};

type Currency = {
  flag: string;
  code: string;
  name: string;
  rate: number;
  balance: number;
};

type Investment = {
  name: string;
  type: string;
  qty: number;
  price: number;
  cost: number;
};

type AiInsight = {
  text: string;
  tag: string;
  color: string;
};

type Challenge = {
  name: string;
  desc: string;
  progress: number;
  target: number;
  saved?: number;
  total?: number;
  icon: string;
  color: string;
};

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function formatK(value: number): string {
  return `K ${value.toLocaleString()}`;
}

function getInitialsFromEmail(email?: string | null): string {
  if (!email) return 'K';
  const base = email.split('@')[0] ?? 'K';
  const parts = base
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
  if (!parts.length) return 'K';
  const first = parts[0]?.[0] ?? 'K';
  const second = parts[1]?.[0] ?? '';
  return (first + second).toUpperCase();
}

function pathToPageId(pathname: string): V2PageId {
  const path = pathname.toLowerCase();
  // Remove /app prefix if present
  const cleanPath = path.replace(/^\/app/, '') || '/';
  
  if (cleanPath === '/' || cleanPath === '/dashboard') return 'dashboard';
  if (cleanPath.startsWith('/accounts')) return 'accounts';
  if (cleanPath.startsWith('/transactions')) return 'transactions';
  if (cleanPath.startsWith('/budgets')) return 'budgets';
  if (cleanPath.startsWith('/goals')) return 'goals';
  if (cleanPath.startsWith('/chilimba')) return 'chilimba';
  if (cleanPath.startsWith('/paye')) return 'paye';
  if (cleanPath.startsWith('/bills')) return 'transactions';
  if (cleanPath.startsWith('/recurring')) return 'recurring';
  if (cleanPath.startsWith('/debt')) return 'debt';
  if (cleanPath.startsWith('/networth')) return 'networth';
  if (cleanPath.startsWith('/currency')) return 'currency';
  if (cleanPath.startsWith('/invest')) return 'invest';
  if (cleanPath.startsWith('/ai')) return 'ai';
  if (cleanPath.startsWith('/calendar')) return 'calendar';
  if (cleanPath.startsWith('/challenges')) return 'challenges';
  if (cleanPath.startsWith('/shared')) return 'shared';
  if (cleanPath.startsWith('/reports')) return 'reports';
  return 'dashboard';
}

function pageIdToPath(pageId: V2PageId): string {
  switch (pageId) {
    case 'dashboard':
      return '/app/';
    case 'accounts':
      return '/app/accounts';
    case 'transactions':
      return '/app/transactions';
    case 'budgets':
      return '/app/budgets';
    case 'goals':
      return '/app/goals';
    case 'chilimba':
      return '/app/chilimba';
    case 'paye':
      return '/app/paye';
    case 'bills':
      return '/app/transactions';
    case 'recurring':
      return '/app/recurring';
    case 'debt':
      return '/app/debt';
    case 'networth':
      return '/app/networth';
    case 'currency':
      return '/app/currency';
    case 'invest':
      return '/app/invest';
    case 'ai':
      return '/app/ai';
    case 'calendar':
      return '/app/calendar';
    case 'challenges':
      return '/app/challenges';
    case 'shared':
      return '/app/shared';
    case 'reports':
      return '/app/reports';
  }
}

function BarChart({
  series,
  labels,
  height = 120
}: {
  series: Array<{ income: number; expense: number }>;
  labels: string[];
  height?: number;
}) {
  const max = Math.max(1, ...series.flatMap((d) => [d.income, d.expense]));

  return (
    <>
      <div className="chart-area" style={{ height }}>
        {series.map((d, idx) => {
          const incomeH = Math.round((d.income / max) * 100);
          const expenseH = Math.round((d.expense / max) * 100);
          return (
            <div className="bar-group" key={idx}>
              <div className="bar income-bar" style={{ height: `${incomeH}%`, flex: 1 }} />
              <div className="bar expense-bar" style={{ height: `${expenseH}%`, flex: 1 }} />
            </div>
          );
        })}
      </div>
      <div className="chart-labels">
        {labels.map((l, idx) => (
          <div key={`${l}-${idx}`} className="chart-label">
            {l}
          </div>
        ))}
      </div>
    </>
  );
}

function TxList({ data }: { data: Tx[] }) {
  if (!data.length) {
    return (
      <div style={{ textAlign: 'center', padding: 20, color: 'var(--t3)', fontSize: 13 }}>
        No transactions found
      </div>
    );
  }

  return (
    <>
      {data.map((t) => (
        <div className="tx-item" key={`${t.name}-${t.date}-${t.amount}`}
        >
          <div className="tx-icon" style={{ background: t.color }}>
            {t.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div className="tx-name">{t.name}</div>
            <div className="tx-meta">
              {t.cat} · {t.date}
            </div>
          </div>
          <div className={`tx-amount ${t.type}`}>{t.type === 'credit' ? '+' : '-'}K {Math.abs(t.amount).toLocaleString()}</div>
        </div>
      ))}
    </>
  );
}

export function KwachawiseV2Page() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activePage = pathToPageId(location.pathname);

  const [isDark, setIsDark] = useState(true);
  const [activePeriod, setActivePeriod] = useState<'Apr' | 'Q1' | 'YTD'>('Apr');

  const [globalSearch, setGlobalSearch] = useState('');

  const [txTypeFilter, setTxTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [txCatFilter, setTxCatFilter] = useState<'All' | 'Income' | 'Groceries' | 'Dining' | 'Transport' | 'Utilities' | 'Shopping'>('All');

  const [salaryInput, setSalaryInput] = useState('8450');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const [reportsTab, setReportsTab] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');

  useEffect(() => {
    document.body.classList.add('kw-v2');
    return () => {
      document.body.classList.remove('kw-v2');
    };
  }, []);

  const demoName = useMemo(() => {
    if (user?.email) {
      const prefix = user.email.split('@')[0] || 'Knowledge';
      const pretty = prefix
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return pretty.length ? pretty : 'Knowledge C.';
    }
    return 'Knowledge C.';
  }, [user?.email]);

  const demoEmail = user?.email ?? 'demo@kwachawise.app';
  const initials = getInitialsFromEmail(demoEmail);

  const titles: Record<V2PageId, string> = {
    dashboard: 'Dashboard',
    accounts: 'Accounts',
    transactions: 'Transactions',
    budgets: 'Budgets',
    goals: 'Savings Goals',
    chilimba: 'Chilimba Tracker',
    paye: 'PAYE Calculator',
    bills: 'Transactions',
    recurring: 'Recurring Transactions',
    debt: 'Debt Tracker',
    networth: 'Net Worth',
    currency: 'Multi-Currency',
    invest: 'Investments',
    ai: 'AI Financial Advisor',
    calendar: 'Financial Calendar',
    challenges: 'Savings Challenges',
    shared: 'Shared Budgets',
    reports: 'Reports'
  };

  const subs: Record<V2PageId, string> = {
    dashboard: 'Good morning, Knowledge — April 28, 2026',
    accounts: 'All your accounts in one place',
    transactions: 'Search, filter and export your history',
    budgets: 'Track spending against your limits',
    goals: 'Your savings targets and progress',
    chilimba: 'Manage your rotating savings groups',
    paye: 'Estimate your Zambian net pay',
    bills: 'Never miss a payment again',
    recurring: 'Automated income and expenses',
    debt: 'Track and pay off what you owe',
    networth: 'Your assets minus liabilities',
    currency: 'ZMW, USD, ZAR and more',
    invest: 'LuSE stocks, unit trusts, fixed deposits',
    ai: 'Personalised financial insights',
    calendar: 'Bills, salary and events at a glance',
    challenges: 'Gamified savings goals',
    shared: 'Budgets with your household or partner',
    reports: 'Date range insights and exports'
  };

  const txData: Tx[] = useMemo(
    () => [
      {
        icon: '🛒',
        color: 'rgba(56,139,253,.15)',
        name: 'Shoprite Lusaka',
        cat: 'Groceries',
        date: 'Apr 28',
        amount: -340,
        type: 'debit'
      },
      {
        icon: '💼',
        color: 'rgba(0,200,150,.12)',
        name: 'Salary — April',
        cat: 'Income',
        date: 'Apr 25',
        amount: 8450,
        type: 'credit'
      },
      {
        icon: '⚡',
        color: 'rgba(245,166,35,.15)',
        name: 'ZESCO Prepaid',
        cat: 'Utilities',
        date: 'Apr 23',
        amount: -180,
        type: 'debit'
      },
      {
        icon: '🍽',
        color: 'rgba(226,75,74,.15)',
        name: 'Levy Junction',
        cat: 'Dining',
        date: 'Apr 22',
        amount: -95,
        type: 'debit'
      },
      {
        icon: '🚌',
        color: 'rgba(85,153,255,.15)',
        name: 'Uber',
        cat: 'Transport',
        date: 'Apr 21',
        amount: -120,
        type: 'debit'
      },
      {
        icon: '📱',
        color: 'rgba(163,94,255,.15)',
        name: 'Airtel Data',
        cat: 'Utilities',
        date: 'Apr 20',
        amount: -75,
        type: 'debit'
      },
      {
        icon: '🏥',
        color: 'rgba(0,200,150,.12)',
        name: 'Freelance Payment',
        cat: 'Income',
        date: 'Apr 18',
        amount: 1200,
        type: 'credit'
      },
      {
        icon: '👕',
        color: 'rgba(255,140,80,.15)',
        name: 'Game Stores',
        cat: 'Shopping',
        date: 'Apr 15',
        amount: -420,
        type: 'debit'
      }
    ],
    []
  );

  const budgets: Budget[] = useMemo(
    () => [
      { name: 'Groceries', spent: 1240, total: 1500, color: '#00C896' },
      { name: 'Dining Out', spent: 380, total: 300, color: '#E24B4A' },
      { name: 'Transport', spent: 280, total: 400, color: '#378ADD' },
      { name: 'Utilities', spent: 455, total: 500, color: '#F5A623' },
      { name: 'Shopping', spent: 420, total: 600, color: '#a855f7' }
    ],
    []
  );

  const goals: Goal[] = useMemo(
    () => [
      { name: 'Emergency Fund', saved: 4500, target: 10000, color: '#00C896', icon: '🛡', monthly: 500 },
      { name: 'New Laptop', saved: 2100, target: 5500, color: '#378ADD', icon: '💻', monthly: 350 },
      { name: 'Holiday Fund', saved: 800, target: 3000, color: '#F5A623', icon: '✈', monthly: 200 }
    ],
    []
  );

  const chilimbas: Chilimba[] = useMemo(
    () => [
      {
        name: 'Family Group',
        contribution: 500,
        round: 3,
        total: 10,
        pool: 5000,
        status: 'Active',
        next: 'May 2026'
      },
      {
        name: 'Work Colleagues',
        contribution: 200,
        round: 7,
        total: 8,
        pool: 1600,
        status: 'Your turn next!',
        next: 'Jun 2026'
      }
    ],
    []
  );

  const bills: Bill[] = useMemo(
    () => [
      { name: 'ZESCO Prepaid', amount: 180, due: 'Apr 30', icon: '⚡', status: 'overdue' },
      { name: 'Airtel Data', amount: 75, due: 'Apr 30', icon: '📱', status: 'soon' },
      { name: 'Rent', amount: 2500, due: 'May 1', icon: '🏠', status: 'soon' },
      { name: 'DSTV', amount: 150, due: 'May 5', icon: '📺', status: 'ok' },
      { name: 'Gym', amount: 200, due: 'May 10', icon: '🏋', status: 'ok' }
    ],
    []
  );

  const recurring: RecurringItem[] = useMemo(
    () => [
      { icon: '💼', name: 'Salary', amount: 8450, freq: 'Monthly', next: 'May 25', type: 'credit' },
      { icon: '🏠', name: 'Rent', amount: 2500, freq: 'Monthly', next: 'May 1', type: 'debit' },
      { icon: '📱', name: 'Airtel Data', amount: 75, freq: 'Monthly', next: 'Apr 30', type: 'debit' },
      { icon: '📺', name: 'DSTV', amount: 150, freq: 'Monthly', next: 'May 5', type: 'debit' },
      { icon: '🏋', name: 'Gym Membership', amount: 200, freq: 'Monthly', next: 'May 10', type: 'debit' },
      { icon: '🏥', name: 'Freelance Income', amount: 1200, freq: 'Irregular', next: 'Varies', type: 'credit' }
    ],
    []
  );

  const debts: Debt[] = useMemo(
    () => [
      {
        name: 'Personal Loan',
        lender: 'Zanaco',
        total: 5000,
        remaining: 3200,
        monthly: 600,
        rate: 18,
        color: '#E24B4A'
      },
      {
        name: 'Phone Installment',
        lender: 'Shoprite',
        total: 2000,
        remaining: 1400,
        monthly: 250,
        rate: 0,
        color: '#F5A623'
      },
      {
        name: 'Family Loan',
        lender: 'Uncle Tendai',
        total: 3000,
        remaining: 3600,
        monthly: 200,
        rate: 0,
        color: '#378ADD'
      }
    ],
    []
  );

  const currencies: Currency[] = useMemo(
    () => [
      { flag: '🇿🇲', code: 'ZMW', name: 'Zambian Kwacha', rate: 1, balance: 24350 },
      { flag: '🇺🇸', code: 'USD', name: 'US Dollar', rate: 0.037, balance: 900.95 },
      { flag: '🇿🇦', code: 'ZAR', name: 'South African Rand', rate: 0.69, balance: 16801.5 },
      { flag: '🇿🇼', code: 'ZWL', name: 'Zimbabwean Dollar', rate: 47.5, balance: 1156625 },
      { flag: '🇬🇧', code: 'GBP', name: 'British Pound', rate: 0.029, balance: 706.15 }
    ],
    []
  );

  const investments: Investment[] = useMemo(
    () => [
      { name: 'Lusaka Breweries Ltd', type: 'LuSE Stock', qty: 100, price: 14.2, cost: 1300 },
      { name: 'Madison Asset Mgmt', type: 'Unit Trust', qty: 1, price: 1800, cost: 1700 },
      { name: 'Zanaco Fixed Deposit', type: 'Fixed Deposit', qty: 1, price: 3000, cost: 3000 }
    ],
    []
  );

  const aiInsights: AiInsight[] = useMemo(
    () => [
      {
        text: 'Dining spend (K 380) exceeded budget by 27%. Cooking 2 extra days per week saves ~K 110.',
        tag: 'OVER BUDGET',
        color: 'var(--danger)'
      },
      {
        text: 'Emergency Fund on track — at K 500/month you complete it by Feb 2027. Increasing to K 700 saves 3 months.',
        tag: 'GOAL PROGRESS',
        color: 'var(--acc)'
      },
      {
        text: 'ZESCO and Airtel together cost K 255/month. Zamtel data bundles could save you K 45/month.',
        tag: 'COST SAVING TIP',
        color: 'var(--warn)'
      }
    ],
    []
  );

  const challenges: Challenge[] = useMemo(
    () => [
      {
        name: '52-Week Challenge',
        desc: 'Save K 1 in week 1, K 2 in week 2... K 52 in week 52',
        progress: 28,
        target: 52,
        saved: 406,
        total: 1378,
        icon: '📅',
        color: '#00C896'
      },
      {
        name: 'No-Spend Weekend',
        desc: 'Zero non-essential spending this weekend',
        progress: 1,
        target: 2,
        icon: '🚫',
        color: '#378ADD'
      },
      {
        name: 'K 5,000 in 90 Days',
        desc: 'Save K 5,000 by end of June 2026',
        progress: 38,
        target: 90,
        saved: 2100,
        total: 5000,
        icon: '🎯',
        color: '#F5A623'
      }
    ],
    []
  );

  const recentTx = useMemo(() => txData.slice(0, 5), [txData]);

  const filteredTx = useMemo(() => {
    let data = txData;

    if (txTypeFilter === 'income') data = data.filter((t) => t.type === 'credit');
    if (txTypeFilter === 'expense') data = data.filter((t) => t.type === 'debit');

    if (txCatFilter !== 'All') {
      if (txCatFilter === 'Income') data = data.filter((t) => t.type === 'credit');
      else data = data.filter((t) => t.cat === txCatFilter);
    }

    const q = globalSearch.trim().toLowerCase();
    if (q) {
      data = data.filter((t) => t.name.toLowerCase().includes(q) || t.cat.toLowerCase().includes(q));
    }

    return data;
  }, [txData, txTypeFilter, txCatFilter, globalSearch]);

  const billsTotal = useMemo(() => bills.reduce((a, b) => a + b.amount, 0), [bills]);

  const payeResult = useMemo(() => {
    const gross = Number.parseFloat(salaryInput) || 0;
    let tax = 0;
    if (gross > 8900) tax += (gross - 8900) * 0.375;
    if (gross > 6600) tax += (Math.min(gross, 8900) - 6600) * 0.3;
    if (gross > 4800) tax += (Math.min(gross, 6600) - 4800) * 0.2;
    const napsa = Math.min(gross * 0.05, 1221.8);
    const nhima = gross * 0.01;
    const net = gross - tax - napsa - nhima;
    return { gross, tax, napsa, nhima, net };
  }, [salaryInput]);

  function toggleTheme() {
    setIsDark((d) => !d);
  }

  function goTo(page: V2PageId) {
    navigate(pageIdToPath(page));
  }

  function exportCSV() {
    const rows = ['Name,Category,Date,Amount', ...txData.map((t) => `${t.name},${t.cat},${t.date},${t.type === 'credit' ? '+' : '−'}${t.amount}`)];
    window.alert(`Export ready!\n\n${rows.slice(0, 4).join('\n')}\n...(${txData.length} rows total)`);
  }

  function askAI() {
    const q = aiQuestion.trim();
    if (!q) return;

    const r = {
      save: 'Based on income K 8,450 and expenses K 5,230, you have K 3,220 free. Target 20-30% savings — aim K 1,690–K 2,535/month. You are currently saving 21%. Automate K 500 to Emergency Fund and K 350 to Laptop goal each payday.',
      food: 'Dining (K 380) is 27% over your K 300 budget. Groceries (K 1,240) are within budget. Combined food spending is K 1,620 — 19% of income, below the 25% Zambia average. Reduce dining by 2 visits/week to get back on track.',
      goal: 'At K 500/month, Emergency Fund (K 4,500/K 10,000) completes Feb 2027. Increase to K 700/month to finish by Nov 2026 — 3 months earlier.',
      reduce: 'Top 3 cuts: (1) Dining out — reduce K 380 to K 250 saves K 130. (2) Shopping — hold firm at K 400 budget. (3) Switch to Zamtel data — saves K 45/month vs Airtel.'
    };

    const lo = q.toLowerCase();
    let resp = r.save;
    if (lo.includes('food') || lo.includes('dining')) resp = r.food;
    else if (lo.includes('goal') || lo.includes('emergency')) resp = r.goal;
    else if (lo.includes('reduc') || lo.includes('cut')) resp = r.reduce;

    setAiResponse(resp);
  }

  function setQ(q: string) {
    setAiQuestion(q);
  }

  const months4 = ['Jan', 'Feb', 'Mar', 'Apr'];
  const data4 = [
    { income: 6200, expense: 4800 },
    { income: 7100, expense: 5200 },
    { income: 7800, expense: 4900 },
    { income: 8450, expense: 5230 }
  ];

  const months12 = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const data12 = [
    { income: 6200, expense: 4800 },
    { income: 7100, expense: 5200 },
    { income: 7800, expense: 4900 },
    { income: 8450, expense: 5230 },
    { income: 0, expense: 0 },
    { income: 0, expense: 0 },
    { income: 0, expense: 0 },
    { income: 0, expense: 0 },
    { income: 0, expense: 0 },
    { income: 0, expense: 0 },
    { income: 0, expense: 0 },
    { income: 0, expense: 0 }
  ];

  const nav = (
    <div className="nav">
      <div className="nav-section">Main</div>
      <div className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`} onClick={() => goTo('dashboard')}>
        ⬛ Dashboard
      </div>
      <div className={`nav-item ${activePage === 'accounts' ? 'active' : ''}`} onClick={() => goTo('accounts')}>
        🏦 Accounts
      </div>
      <div className={`nav-item ${activePage === 'transactions' ? 'active' : ''}`} onClick={() => goTo('transactions')}>
        ↕ Transactions
      </div>
      <div className={`nav-item ${activePage === 'budgets' ? 'active' : ''}`} onClick={() => goTo('budgets')}>
        ⏱ Budgets <span className="nav-badge warn">1</span>
      </div>
      <div className={`nav-item ${activePage === 'goals' ? 'active' : ''}`} onClick={() => goTo('goals')}>
        ★ Goals
      </div>

      <div className="nav-section">Zambia</div>
      <div className={`nav-item ${activePage === 'chilimba' ? 'active' : ''}`} onClick={() => goTo('chilimba')}>
        ◈ Chilimba <span className="nav-badge">2</span>
      </div>
      <div className={`nav-item ${activePage === 'paye' ? 'active' : ''}`} onClick={() => goTo('paye')}>
        ≡ PAYE Calculator
      </div>

      <div className="nav-section">Finance</div>
      <div className={`nav-item ${activePage === 'recurring' ? 'active' : ''}`} onClick={() => goTo('recurring')}>
        ↻ Recurring
      </div>
      <div className={`nav-item ${activePage === 'debt' ? 'active' : ''}`} onClick={() => goTo('debt')}>
        📉 Debt Tracker
      </div>
      <div className={`nav-item ${activePage === 'networth' ? 'active' : ''}`} onClick={() => goTo('networth')}>
        ◎ Net Worth
      </div>
      <div className={`nav-item ${activePage === 'currency' ? 'active' : ''}`} onClick={() => goTo('currency')}>
        💱 Multi-currency
      </div>
      <div className={`nav-item ${activePage === 'invest' ? 'active' : ''}`} onClick={() => goTo('invest')}>
        📈 Investments
      </div>

      <div className="nav-section">Insights</div>
      <div className={`nav-item ${activePage === 'ai' ? 'active' : ''}`} onClick={() => goTo('ai')}>
        ✦ AI Advisor <span className="nav-badge">3</span>
      </div>
      <div className={`nav-item ${activePage === 'calendar' ? 'active' : ''}`} onClick={() => goTo('calendar')}>
        📅 Calendar
      </div>
      <div className={`nav-item ${activePage === 'challenges' ? 'active' : ''}`} onClick={() => goTo('challenges')}>
        🏆 Challenges
      </div>
      <div className={`nav-item ${activePage === 'shared' ? 'active' : ''}`} onClick={() => goTo('shared')}>
        👥 Shared Budgets
      </div>
      <div className={`nav-item ${activePage === 'reports' ? 'active' : ''}`} onClick={() => goTo('reports')}>
        📊 Reports
      </div>
    </div>
  );

  const dashboardCats = [
    { name: 'Groceries', val: 1240, color: '#00C896' },
    { name: 'Shopping', val: 420, color: '#a855f7' },
    { name: 'Utilities', val: 455, color: '#F5A623' },
    { name: 'Dining', val: 380, color: '#E24B4A' },
    { name: 'Transport', val: 280, color: '#378ADD' }
  ];
  const dashCatsMax = Math.max(...dashboardCats.map((c) => c.val));

  const accountChartAccounts = [
    { name: 'Zanaco', val: 12450, color: '#00C896' },
    { name: 'Stanbic', val: 7800, color: '#F5A623' },
    { name: 'Airtel', val: 3200, color: '#378ADD' },
    { name: 'Cash', val: 900, color: '#a855f7' }
  ];
  const accountTotal = accountChartAccounts.reduce((a, b) => a + b.val, 0);

  const assets = [
    { name: 'Zanaco Current', val: 12450, icon: '🏦', color: 'var(--acc)' },
    { name: 'Stanbic Savings', val: 7800, icon: '💰', color: 'var(--warn)' },
    { name: 'Airtel Money', val: 3200, icon: '📱', color: 'var(--info)' },
    { name: 'Cash', val: 900, icon: '💵', color: 'var(--purple)' },
    { name: 'LuSE Investments', val: 5400, icon: '📈', color: '#06b6d4' }
  ];
  const assetsTotal = assets.reduce((a, b) => a + b.val, 0);

  const nwHistory = [8200, 9100, 10400, 11800, 12900, 14200, 15100, 16150];
  const nwHistoryMax = Math.max(...nwHistory);

  const scoreHistory = [58, 62, 65, 68, 70, 71, 73, 75];

  const calHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const calEvents: Record<number, 'income' | 'today' | 'payment' | 'chilimba'> = {
    25: 'income',
    28: 'today',
    30: 'payment',
    5: 'income',
    1: 'payment',
    15: 'chilimba'
  };

  const reportsStats = (
    <div className="stats-grid section">
      <div className="stat-card income">
        <div className="stat-label">Avg Monthly Income</div>
        <div className="stat-value">K 7,800</div>
      </div>
      <div className="stat-card expense">
        <div className="stat-label">Avg Monthly Expense</div>
        <div className="stat-value">K 5,100</div>
      </div>
      <div className="stat-card net">
        <div className="stat-label">Savings Rate</div>
        <div className="stat-value">34.6%</div>
      </div>
      <div className="stat-card saved">
        <div className="stat-label">Total Saved YTD</div>
        <div className="stat-value">K 9,400</div>
      </div>
    </div>
  );

  return (
    <div className={`kw-v2-root ${isDark ? '' : 'light-mode'}`}>
      <h2 className="sr-only">
        KwachaWise full dashboard — all 15 features including accounts, debt, calendar, challenges, investments,
        multi-currency, dark/light mode
      </h2>

      <div className="app" id="app">
        <div className="sidebar">
          <div className="logo">
            <div className="logo-mark">
              <div className="logo-icon">K</div>
              <div className="logo-text">KwachaWise</div>
            </div>
            <div
              className="theme-btn"
              onClick={toggleTheme}
              title="Toggle theme"
              id="theme-icon"
              role="button"
              aria-label="Toggle theme"
            >
              {isDark ? '🌙' : '☀'}
            </div>
          </div>

          {nav}

          <div className="sidebar-footer">
            <div className="user-card">
              <div className="user-avatar">{initials}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--t1)' }}>{demoName}</div>
                <div style={{ fontSize: 10, color: 'var(--t2)' }}>{demoEmail}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="main">
          <div className="topbar">
            <div>
              <div className="page-title" id="page-title">
                {titles[activePage]}
              </div>
              <div className="page-sub" id="page-sub">
                {subs[activePage]}
              </div>
            </div>
            <div className="topbar-right">
              <div className="search-box">
                <span style={{ fontSize: 12, color: 'var(--t3)' }}>⌕</span>
                <input
                  id="global-search"
                  placeholder="Search transactions..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                />
              </div>
              <div className="period-pills">
                {(['Apr', 'Q1', 'YTD'] as const).map((p) => (
                  <div
                    key={p}
                    className={`pill ${activePeriod === p ? 'active' : ''}`}
                    onClick={() => setActivePeriod(p)}
                  >
                    {p}
                  </div>
                ))}
              </div>
              <div className="synced-badge">
                <div className="synced-dot" />Synced
              </div>
            </div>
          </div>

          <div className="content">
            <div className={`scroll-page ${activePage === 'dashboard' ? 'active' : ''}`} id="page-dashboard">
              <div className="warning-banner">⚠ Dining budget exceeded by K 80 this week</div>
              <div className="stats-grid section">
                <div className="stat-card income">
                  <div className="stat-label">Income</div>
                  <div className="stat-value">K 8,450</div>
                  <div className="stat-change up">▲ 12%</div>
                </div>
                <div className="stat-card expense">
                  <div className="stat-label">Expenses</div>
                  <div className="stat-value">K 5,230</div>
                  <div className="stat-change down">▲ 8%</div>
                </div>
                <div className="stat-card net">
                  <div className="stat-label">Net Balance</div>
                  <div className="stat-value">K 3,220</div>
                  <div className="stat-change up">▲ 18%</div>
                </div>
                <div className="stat-card saved">
                  <div className="stat-label">Saved in Goals</div>
                  <div className="stat-value">K 1,800</div>
                  <div className="stat-change up">▲ K 300</div>
                </div>
              </div>

              <div className="quick-actions">
                <div className="quick-btn" onClick={() => goTo('transactions')}>
                  <div className="quick-btn-icon">+</div>
                  <div className="quick-btn-label">Add Transaction</div>
                </div>
                <div className="quick-btn" onClick={() => goTo('debt')}>
                  <div className="quick-btn-icon">📉</div>
                  <div className="quick-btn-label">Debt Tracker</div>
                </div>
                <div className="quick-btn" onClick={() => goTo('challenges')}>
                  <div className="quick-btn-icon">🏆</div>
                  <div className="quick-btn-label">Challenges</div>
                </div>
                <div className="quick-btn" onClick={() => goTo('paye')}>
                  <div className="quick-btn-icon">≡</div>
                  <div className="quick-btn-label">PAYE Calc</div>
                </div>
              </div>

              <div className="two-col section">
                <div className="card">
                  <div className="section-header">
                    <div>
                      <div className="card-title">Daily Trend</div>
                      <div className="card-sub">Income vs Expenses</div>
                    </div>
                    <div className="legend">
                      <div className="legend-item">
                        <div className="legend-dot" style={{ background: 'var(--acc)' }} />Income
                      </div>
                      <div className="legend-item">
                        <div className="legend-dot" style={{ background: 'var(--danger)' }} />Expense
                      </div>
                    </div>
                  </div>
                  <BarChart series={data4} labels={months4} />
                </div>

                <div className="ai-card">
                  <div className="ai-header">
                    <div className="ai-icon">✦</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)' }}>AI Advisor</div>
                      <div style={{ fontSize: 11, color: 'var(--acc)' }}>3 new insights</div>
                    </div>
                  </div>
                  <div className="ai-insight">
                    <div className="ai-insight-text">
                      Dining spend is 27% over budget. Cooking 2 extra days saves ~K 110/month.
                    </div>
                    <div className="ai-insight-tag">SPENDING PATTERN</div>
                  </div>
                  <div className="ai-insight" style={{ borderLeftColor: 'var(--warn)' }}>
                    <div className="ai-insight-text">
                      Emergency Fund on track — complete by Feb 2027 at current rate.
                    </div>
                    <div className="ai-insight-tag" style={{ color: 'var(--warn)' }}>
                      GOAL PROGRESS
                    </div>
                  </div>
                  <div className="ai-chips">
                    <div className="ai-chip" onClick={() => goTo('ai')}>
                      Analyse spending
                    </div>
                    <div className="ai-chip" onClick={() => goTo('ai')}>
                      Budget advice
                    </div>
                  </div>
                </div>
              </div>

              <div className="two-col section">
                <div className="card">
                  <div className="section-header">
                    <div className="section-title">Recent Transactions</div>
                    <div className="section-action" onClick={() => goTo('transactions')}>
                      View all
                    </div>
                  </div>
                  <TxList data={recentTx} />
                </div>
                <div className="card">
                  <div className="section-title" style={{ marginBottom: 12 }}>
                    Spending Categories
                  </div>
                  {dashboardCats.map((c) => (
                    <div key={c.name} style={{ marginBottom: 9 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--t1)' }}>{c.name}</span>
                        <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--t2)' }}>K{c.val}</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--bg4)', borderRadius: 10, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.round((c.val / dashCatsMax) * 100)}%`,
                            background: c.color,
                            borderRadius: 10
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`scroll-page ${activePage === 'accounts' ? 'active' : ''}`} id="page-accounts">
              <div className="section-header">
                <div className="section-title">All Accounts</div>
                <button className="add-btn">+ Add Account</button>
              </div>
              <div className="stats-grid section">
                <div className="stat-card income">
                  <div className="stat-label">Total Assets</div>
                  <div className="stat-value">K 24,350</div>
                </div>
                <div className="stat-card expense">
                  <div className="stat-label">Total Debt</div>
                  <div className="stat-value">K 8,200</div>
                </div>
                <div className="stat-card net">
                  <div className="stat-label">Net Worth</div>
                  <div className="stat-value">K 16,150</div>
                </div>
                <div className="stat-card saved">
                  <div className="stat-label">Accounts</div>
                  <div className="stat-value">4</div>
                </div>
              </div>

              <div className="two-col">
                <div className="card">
                  <div className="card-title" style={{ marginBottom: 12 }}>
                    My Accounts
                  </div>
                  <div className="account-card">
                    <div className="account-icon" style={{ background: 'rgba(0,200,150,.15)' }}>
                      🏦
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)' }}>Zanaco Current</div>
                      <div style={{ fontSize: 11, color: 'var(--t2)' }}>Account ending 4821</div>
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600, color: 'var(--acc)' }}>
                      K 12,450
                    </div>
                  </div>
                  <div className="account-card">
                    <div className="account-icon" style={{ background: 'rgba(55,138,221,.15)' }}>
                      📱
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)' }}>Airtel Money</div>
                      <div style={{ fontSize: 11, color: 'var(--t2)' }}>Mobile money wallet</div>
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600, color: 'var(--info)' }}>
                      K 3,200
                    </div>
                  </div>
                  <div className="account-card">
                    <div className="account-icon" style={{ background: 'rgba(245,166,35,.15)' }}>
                      💳
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)' }}>Stanbic Savings</div>
                      <div style={{ fontSize: 11, color: 'var(--t2)' }}>Savings account</div>
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600, color: 'var(--warn)' }}>
                      K 7,800
                    </div>
                  </div>
                  <div className="account-card">
                    <div className="account-icon" style={{ background: 'rgba(168,85,247,.15)' }}>
                      💵
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)' }}>Cash Wallet</div>
                      <div style={{ fontSize: 11, color: 'var(--t2)' }}>Physical cash</div>
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600, color: 'var(--purple)' }}>
                      K 900
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title" style={{ marginBottom: 12 }}>
                    Account Breakdown
                  </div>
                  <div style={{ height: 8, borderRadius: 10, overflow: 'hidden', display: 'flex', marginBottom: 10 }}>
                    {accountChartAccounts.map((a) => (
                      <div key={a.name} style={{ flex: a.val, background: a.color }} />
                    ))}
                  </div>
                  {accountChartAccounts.map((a) => (
                    <div
                      key={a.name}
                      style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}
                    >
                      <span style={{ fontSize: 12, color: 'var(--t1)' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            borderRadius: 2,
                            background: a.color,
                            marginRight: 5,
                            verticalAlign: 'middle'
                          }}
                        />
                        {a.name}
                      </span>
                      <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--t2)' }}>
                        {Math.round((a.val / accountTotal) * 100)}% · K{a.val.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`scroll-page ${activePage === 'transactions' ? 'active' : ''}`} id="page-transactions">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div className="tab-bar">
                  <div
                    className={`tab ${txTypeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setTxTypeFilter('all')}
                  >
                    All
                  </div>
                  <div
                    className={`tab ${txTypeFilter === 'income' ? 'active' : ''}`}
                    onClick={() => setTxTypeFilter('income')}
                  >
                    Income
                  </div>
                  <div
                    className={`tab ${txTypeFilter === 'expense' ? 'active' : ''}`}
                    onClick={() => setTxTypeFilter('expense')}
                  >
                    Expenses
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="export-btn" onClick={exportCSV}>
                    ⬇ Export CSV
                  </button>
                  <button className="add-btn">+ Add</button>
                </div>
              </div>

              <div className="filter-row">
                {(['All', 'Income', 'Groceries', 'Dining', 'Transport', 'Utilities', 'Shopping'] as const).map((c) => (
                  <div
                    key={c}
                    className={`filter-pill ${txCatFilter === c ? 'active' : ''}`}
                    onClick={() => setTxCatFilter(c)}
                  >
                    {c}
                  </div>
                ))}
              </div>

              <div className="card">
                <TxList data={filteredTx} />
              </div>
            </div>

            <div className={`scroll-page ${activePage === 'budgets' ? 'active' : ''}`} id="page-budgets">
              <div className="warning-banner">⚠ Dining budget exceeded by K 80 this month</div>
              <div className="three-col section">
                <div className="stat-card income">
                  <div className="stat-label">Total Budgeted</div>
                  <div className="stat-value">K 5,500</div>
                </div>
                <div className="stat-card expense">
                  <div className="stat-label">Spent</div>
                  <div className="stat-value">K 3,840</div>
                </div>
                <div className="stat-card net">
                  <div className="stat-label">Remaining</div>
                  <div className="stat-value">K 1,660</div>
                </div>
              </div>
              <div className="card">
                <div className="section-header">
                  <div className="section-title">Monthly Budgets</div>
                  <button className="add-btn">+ Add Budget</button>
                </div>
                {budgets.map((b) => {
                  const pct = Math.round((b.spent / b.total) * 100);
                  const over = b.spent > b.total;
                  return (
                    <div className="budget-item" key={b.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--t1)' }}>{b.name}</span>
                        <span
                          style={{
                            fontSize: 11,
                            fontFamily: 'var(--mono)',
                            color: over ? 'var(--danger)' : 'var(--t2)'
                          }}
                        >
                          K{b.spent} / K{b.total}
                        </span>
                      </div>
                      <div className="budget-bar-wrap">
                        <div
                          className="budget-fill"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            background: over ? 'var(--danger)' : b.color
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 10, color: over ? 'var(--danger)' : 'var(--t3)', marginTop: 3 }}>
                        {over ? 'OVER BUDGET' : `${pct}% used`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`scroll-page ${activePage === 'goals' ? 'active' : ''}`} id="page-goals">
              <div className="card">
                <div className="section-header">
                  <div className="section-title">Savings Goals</div>
                  <button className="add-btn">+ New Goal</button>
                </div>
                <div className="three-col">
                  {goals.map((g) => {
                    const pct = Math.round((g.saved / g.target) * 100);
                    const months = Math.ceil((g.target - g.saved) / g.monthly);
                    return (
                      <div className="goal-card" key={g.name}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 8
                          }}
                        >
                          <span style={{ fontSize: 18 }}>{g.icon}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--acc)', fontFamily: 'var(--mono)' }}>
                            {pct}%
                          </span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)', marginBottom: 8 }}>{g.name}</div>
                        <div
                          style={{
                            height: 5,
                            background: 'var(--bg4)',
                            borderRadius: 10,
                            overflow: 'hidden',
                            marginBottom: 6
                          }}
                        >
                          <div style={{ height: '100%', width: `${pct}%`, background: g.color, borderRadius: 10 }} />
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--t2)' }}>
                          K{g.saved.toLocaleString()} of K{g.target.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--acc)', marginTop: 4 }}>~{months} months to go</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={`scroll-page ${activePage === 'chilimba' ? 'active' : ''}`} id="page-chilimba">
              <div className="card">
                <div className="section-header">
                  <div className="section-title">My Chilimba Groups</div>
                  <button className="add-btn">+ Join Group</button>
                </div>
                {chilimbas.map((c) => (
                  <div className="chilimba-card" key={c.name}>
                    <div
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)' }}>{c.name}</span>
                      <span
                        style={{
                          fontSize: 10,
                          background: 'rgba(245,166,35,.12)',
                          color: 'var(--warn)',
                          border: '1px solid rgba(245,166,35,.25)',
                          padding: '2px 8px',
                          borderRadius: 20
                        }}
                      >
                        {c.status}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: 8,
                        textAlign: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--t1)' }}>
                          K{c.contribution}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--t2)' }}>Contribution</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--t1)' }}>
                          {c.round}/{c.total}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--t2)' }}>Round</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--t1)' }}>
                          K{c.pool.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--t2)' }}>Pool</div>
                      </div>
                    </div>

                    <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 8 }}>Next payout: {c.next}</div>
                  </div>
                ))}
              </div>

              <div className="card" style={{ marginTop: 12 }}>
                <div className="card-title" style={{ marginBottom: 8 }}>
                  What is Chilimba?
                </div>
                <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.7 }}>
                  A traditional Zambian rotating savings group where members contribute a fixed amount each round, and one
                  member receives the full pool. KwachaWise tracks your rounds, contributions, and payout schedule
                  automatically.
                </div>
              </div>
            </div>

            <div className={`scroll-page ${activePage === 'paye' ? 'active' : ''}`} id="page-paye">
              <div className="two-col">
                <div className="card">
                  <div className="card-title">PAYE Calculator</div>
                  <div className="card-sub">ZRA tax bands 2024/25 · NAPSA · NHIMA</div>

                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <input
                      className="paye-input"
                      id="salary-input"
                      type="number"
                      value={salaryInput}
                      onChange={(e) => setSalaryInput(e.target.value)}
                      placeholder="Gross monthly salary (K)"
                    />
                    <button className="calc-btn">Calculate</button>
                  </div>

                  <div>
                    <div className="paye-row">
                      <span style={{ fontSize: 12, color: 'var(--t2)' }}>Gross Salary</span>
                      <span style={{ fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--t1)' }}>{formatK(payeResult.gross)}</span>
                    </div>
                    <div className="paye-row">
                      <span style={{ fontSize: 12, color: 'var(--t2)' }}>PAYE Tax</span>
                      <span style={{ fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--danger)' }}>- K {payeResult.tax.toFixed(2)}</span>
                    </div>
                    <div className="paye-row">
                      <span style={{ fontSize: 12, color: 'var(--t2)' }}>NAPSA (5%)</span>
                      <span style={{ fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--warn)' }}>- K {payeResult.napsa.toFixed(2)}</span>
                    </div>
                    <div className="paye-row">
                      <span style={{ fontSize: 12, color: 'var(--t2)' }}>NHIMA (1%)</span>
                      <span style={{ fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--warn)' }}>- K {payeResult.nhima.toFixed(2)}</span>
                    </div>
                    <div className="paye-row" style={{ borderTop: '2px solid var(--acc)', marginTop: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)' }}>Net Take-Home</span>
                      <span
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          fontFamily: 'var(--mono)',
                          color: 'var(--acc)'
                        }}
                      >
                        K {payeResult.net.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title" style={{ marginBottom: 12 }}>
                    ZRA Tax Bands 2024/25
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--t1)', lineHeight: 2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--t2)' }}>K 0 – K 4,800</span>
                      <span style={{ color: 'var(--acc)' }}>0% — Tax Free</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--t2)' }}>K 4,801 – K 6,600</span>
                      <span style={{ color: 'var(--warn)' }}>20%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--t2)' }}>K 6,601 – K 8,900</span>
                      <span style={{ color: 'var(--warn)' }}>30%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--t2)' }}>Above K 8,900</span>
                      <span style={{ color: 'var(--danger)' }}>37.5%</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 16, padding: 12, background: 'var(--bg3)', borderRadius: 'var(--r2)' }}>
                    <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 6 }}>Other Deductions</div>
                    <div style={{ fontSize: 12, color: 'var(--t1)', lineHeight: 1.8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>NAPSA</span>
                        <span style={{ color: 'var(--warn)' }}>5% (max K 1,221.80)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>NHIMA</span>
                        <span style={{ color: 'var(--warn)' }}>1%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`scroll-page ${activePage === 'bills' ? 'active' : ''}`} id="page-bills">
              <div className="card">
                <div className="card-title">Payments are hidden</div>
                <div className="card-sub">Use transactions and recurring schedules instead.</div>
              </div>
            </div>

            <div className={`scroll-page ${activePage === 'recurring' ? 'active' : ''}`} id="page-recurring">
              <div className="section-header">
                <div className="section-title">Recurring Transactions</div>
                <button className="add-btn">+ Add Recurring</button>
              </div>
              <div className="card">
                {recurring.map((r) => (
                  <div className="tx-item" key={r.name}>
                    <div
                      className="tx-icon"
                      style={{
                        background: r.type === 'credit' ? 'rgba(0,200,150,.12)' : 'rgba(226,75,74,.1)'
                      }}
                    >
                      {r.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="tx-name">{r.name}</div>
                      <div className="tx-meta">
                        {r.freq} · Next: {r.next}
                      </div>
                    </div>
                    <div className={`tx-amount ${r.type === 'credit' ? 'credit' : 'debit'}`}>
                      {r.type === 'credit' ? '+' : '-'}K{r.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`scroll-page ${activePage === 'debt' ? 'active' : ''}`} id="page-debt">
              <div className="stats-grid section">
                <div className="stat-card expense">
                  <div className="stat-label">Total Debt</div>
                  <div className="stat-value">K 8,200</div>
                </div>
                <div className="stat-card income">
                  <div className="stat-label">Monthly Payment</div>
                  <div className="stat-value">K 1,050</div>
                </div>
                <div className="stat-card net">
                  <div className="stat-label">Debt-Free Date</div>
                  <div className="stat-value" style={{ fontSize: 14 }}>
                    Aug 2027
                  </div>
                </div>
                <div className="stat-card saved">
                  <div className="stat-label">Interest Paid</div>
                  <div className="stat-value">K 340</div>
                </div>
              </div>

              <div className="card">
                <div className="section-header">
                  <div className="section-title">My Debts</div>
                  <button className="add-btn">+ Add Debt</button>
                </div>
                {debts.map((d) => {
                  const pct = clampPercent(((d.total - d.remaining) / d.total) * 100);
                  return (
                    <div
                      className="debt-item"
                      key={d.name}
                      style={{ flexDirection: 'column', alignItems: 'stretch' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 8
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)' }}>{d.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--t2)' }}>
                            {d.lender} · {d.rate ? `${d.rate}% interest` : 'Interest-free'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--danger)' }}>
                            K{d.remaining.toLocaleString()} left
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--t2)' }}>K{d.monthly}/month</div>
                        </div>
                      </div>
                      <div style={{ height: 5, background: 'var(--bg4)', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: d.color, borderRadius: 10 }} />
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 3 }}>{Math.round(pct)}% paid off</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`scroll-page ${activePage === 'networth' ? 'active' : ''}`} id="page-networth">
              <div className="three-col section">
                <div className="stat-card income">
                  <div className="stat-label">Total Assets</div>
                  <div className="stat-value">K 24,350</div>
                </div>
                <div className="stat-card expense">
                  <div className="stat-label">Total Liabilities</div>
                  <div className="stat-value">K 8,200</div>
                </div>
                <div className="stat-card net">
                  <div className="stat-label">Net Worth</div>
                  <div className="stat-value">K 16,150</div>
                </div>
              </div>

              <div className="two-col">
                <div className="card">
                  <div className="card-title" style={{ marginBottom: 12 }}>
                    Assets Breakdown
                  </div>
                  {assets.map((a) => (
                    <div key={a.name} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--t1)' }}>
                          {a.icon} {a.name}
                        </span>
                        <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--t1)' }}>
                          K{a.val.toLocaleString()}
                        </span>
                      </div>
                      <div style={{ height: 4, background: 'var(--bg4)', borderRadius: 10, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.round((a.val / assetsTotal) * 100)}%`,
                            background: a.color,
                            borderRadius: 10
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card">
                  <div className="card-title" style={{ marginBottom: 12 }}>
                    Net Worth History
                  </div>
                  <div className="score-history-bar">
                    {nwHistory.map((v, i) => (
                      <div
                        key={i}
                        className="score-bar"
                        style={{
                          height: `${Math.round((v / nwHistoryMax) * 90)}%`,
                          background: i === nwHistory.length - 1 ? 'var(--acc)' : 'var(--info)'
                        }}
                      />
                    ))}
                  </div>
                  <div className="chart-labels">
                    {['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'].map((l) => (
                      <div key={l} className="chart-label">
                        {l}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={`scroll-page ${activePage === 'currency' ? 'active' : ''}`} id="page-currency">
              <div className="section-header">
                <div className="section-title">Multi-Currency Wallet</div>
                <button className="add-btn">+ Add Currency</button>
              </div>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 4 }}>
                  Live Exchange Rates
                </div>
                <div className="card-sub">Base currency: ZMW · Rates updated Apr 28, 2026</div>

                {currencies.map((c) => (
                  <div className="currency-row" key={c.code}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{c.flag}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)' }}>
                          {c.code} — {c.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--t2)' }}>
                          1 ZMW = {c.rate} {c.code}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--t1)' }}>
                        {c.rate === 1 ? 'K' : ''} {c.balance.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--acc)', cursor: 'pointer' }}>Convert →</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`scroll-page ${activePage === 'invest' ? 'active' : ''}`} id="page-invest">
              <div className="stats-grid section">
                <div className="stat-card income">
                  <div className="stat-label">Portfolio Value</div>
                  <div className="stat-value">K 5,400</div>
                </div>
                <div className="stat-card net">
                  <div className="stat-label">Total Return</div>
                  <div className="stat-value">+K 420</div>
                  <div className="stat-change up">▲ 8.4%</div>
                </div>
                <div className="stat-card saved">
                  <div className="stat-label">Fixed Deposits</div>
                  <div className="stat-value">K 3,000</div>
                </div>
                <div className="stat-card expense">
                  <div className="stat-label">Unrealized P&amp;L</div>
                  <div className="stat-value">+K 120</div>
                </div>
              </div>

              <div className="card">
                <div className="section-header">
                  <div className="section-title">My Investments</div>
                  <button className="add-btn">+ Add Investment</button>
                </div>

                {investments.map((i) => {
                  const gain = i.price * i.qty - i.cost;
                  const pct = Math.round((gain / i.cost) * 100);
                  return (
                    <div className="invest-item" key={i.name}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)' }}>{i.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--t2)' }}>
                          {i.type} · {i.qty} unit{i.qty > 1 ? 's' : ''}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--t1)' }}>
                          K{(i.price * i.qty).toLocaleString()}
                        </div>
                        <div style={{ fontSize: 11, color: pct >= 0 ? 'var(--acc)' : 'var(--danger)' }}>
                          {pct >= 0 ? '+' : ''}
                          {pct}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`scroll-page ${activePage === 'ai' ? 'active' : ''}`} id="page-ai">
              <div className="two-col">
                <div>
                  <div className="ai-card" style={{ marginBottom: 12 }}>
                    <div className="ai-header">
                      <div className="ai-icon">✦</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)' }}>AI Financial Advisor</div>
                        <div style={{ fontSize: 11, color: 'var(--acc)' }}>Powered by your data</div>
                      </div>
                    </div>

                    {aiInsights.map((i) => (
                      <div className="ai-insight" key={i.tag} style={{ borderLeftColor: i.color }}>
                        <div className="ai-insight-text">{i.text}</div>
                        <div className="ai-insight-tag" style={{ color: i.color }}>
                          {i.tag}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="card">
                    <div className="card-title" style={{ marginBottom: 10 }}>
                      Ask your advisor
                    </div>
                    <div style={{ display: 'flex', gap: 7, marginBottom: 8 }}>
                      <input
                        className="paye-input"
                        id="ai-question"
                        placeholder="Ask anything about your finances..."
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') askAI();
                        }}
                      />
                      <button className="calc-btn" onClick={askAI}>
                        Ask ✦
                      </button>
                    </div>

                    {aiResponse ? (
                      <div
                        style={{
                          background: 'rgba(0,200,150,.06)',
                          border: '1px solid rgba(0,200,150,.15)',
                          borderRadius: 'var(--r2)',
                          padding: 10,
                          marginTop: 8,
                          fontSize: 12.5,
                          color: 'var(--t1)',
                          lineHeight: 1.6
                        }}
                      >
                        <span style={{ color: 'var(--acc)', fontWeight: 500 }}>✦ Advisor:</span> {aiResponse}
                      </div>
                    ) : null}

                    <div className="ai-chips" style={{ marginTop: 10 }}>
                      <div className="ai-chip" onClick={() => setQ('How much should I save each month?')}>
                        Monthly savings
                      </div>
                      <div className="ai-chip" onClick={() => setQ('Am I spending too much on food?')}>
                        Food analysis
                      </div>
                      <div className="ai-chip" onClick={() => setQ('When will I reach my Emergency Fund goal?')}>
                        Goal timeline
                      </div>
                      <div className="ai-chip" onClick={() => setQ('How can I reduce my expenses?')}>
                        Cut expenses
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="card" style={{ marginBottom: 12 }}>
                    <div className="card-title" style={{ marginBottom: 12 }}>
                      Financial Health Score
                    </div>
                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                      <div style={{ fontSize: 42, fontWeight: 700, color: 'var(--acc)', fontFamily: 'var(--mono)' }}>
                        75
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--t2)' }}>Good · Better than 68% of users</div>
                    </div>

                    {[
                      { label: 'Savings rate', val: '34%', score: 80, color: 'var(--acc)' },
                      { label: 'Budget adherence', val: '78%', score: 78, color: 'var(--info)' },
                      { label: 'Goal progress', val: 'On track', score: 70, color: 'var(--acc)' },
                      { label: 'Debt level', val: 'Moderate', score: 60, color: 'var(--warn)' }
                    ].map((f) => (
                      <div key={f.label} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: 'var(--t2)' }}>{f.label}</span>
                          <span style={{ fontSize: 12, fontWeight: 500, color: f.color }}>{f.val}</span>
                        </div>
                        <div style={{ height: 4, background: 'var(--bg4)', borderRadius: 10 }}>
                          <div
                            style={{ height: '100%', width: `${f.score}%`, background: f.color, borderRadius: 10 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="card">
                    <div className="card-title" style={{ marginBottom: 10 }}>
                      Score History
                    </div>
                    <div className="score-history-bar">
                      {scoreHistory.map((s, i) => (
                        <div
                          key={i}
                          className="score-bar"
                          style={{
                            height: `${Math.round((s / 100) * 90)}%`,
                            background: i === scoreHistory.length - 1 ? 'var(--acc)' : 'rgba(0,200,150,.4)'
                          }}
                        />
                      ))}
                    </div>
                    <div className="chart-labels">
                      {['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'].map((l) => (
                        <div key={l} className="chart-label">
                          {l}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`scroll-page ${activePage === 'calendar' ? 'active' : ''}`} id="page-calendar">
              <div className="two-col">
                <div className="card">
                  <div className="section-header">
                    <div className="section-title">April 2026</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ cursor: 'pointer', color: 'var(--t2)' }}>◀</span>
                      <span style={{ cursor: 'pointer', color: 'var(--t2)' }}>▶</span>
                    </div>
                  </div>

                  <div className="cal-grid">
                    {calHeaders.map((d) => (
                      <div key={d} className="cal-day header">
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="cal-grid">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div key={`blank-${idx}`} className="cal-day" />
                    ))}
                    {Array.from({ length: 30 }).map((_, idx) => {
                      const day = idx + 1;
                      const event = calEvents[day];
                      const cls = day === 28 ? 'today' : event ? 'has-event' : '';
                      return (
                        <div key={day} className={`cal-day ${cls}`}>
                          {day}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 11, color: 'var(--t2)' }}>
                    <span>● Payment</span>
                    <span style={{ color: 'var(--acc)' }}>● Salary</span>
                    <span style={{ color: 'var(--info)' }}>● Chilimba</span>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title" style={{ marginBottom: 12 }}>
                    Events This Month
                  </div>

                  {[{ icon: '💼', date: 'Apr 25', name: 'Salary received', color: 'var(--acc)' },
                    { icon: '⚡', date: 'Apr 30', name: 'ZESCO payment', color: 'var(--danger)' },
                    { icon: '📱', date: 'Apr 30', name: 'Airtel payment', color: 'var(--warn)' },
                    { icon: '◈', date: 'May 15', name: 'Chilimba payout', color: 'var(--info)' }].map((e) => (
                    <div
                      key={e.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 10px',
                        background: 'var(--bg3)',
                        borderRadius: 'var(--r2)',
                        marginBottom: 7
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{e.icon}</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--t1)' }}>{e.name}</div>
                        <div style={{ fontSize: 11, color: e.color }}>{e.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`scroll-page ${activePage === 'challenges' ? 'active' : ''}`} id="page-challenges">
              <div className="section-header">
                <div className="section-title">Savings Challenges</div>
                <button className="add-btn">+ Join Challenge</button>
              </div>
              <div className="three-col">
                {challenges.map((c) => {
                  const pct = clampPercent((c.progress / c.target) * 100);
                  return (
                    <div className="challenge-card" key={c.name}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)', marginBottom: 4 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 8, lineHeight: 1.5 }}>{c.desc}</div>
                      <div className="challenge-progress">
                        <div className="challenge-fill" style={{ width: `${pct}%`, background: c.color }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--t2)' }}>
                        <span>
                          Day {c.progress} of {c.target}
                        </span>
                        <span style={{ color: c.color, fontWeight: 600 }}>{Math.round(pct)}%</span>
                      </div>
                      {c.saved ? (
                        <div style={{ fontSize: 11, color: 'var(--acc)', marginTop: 6 }}>
                          K{c.saved.toLocaleString()} saved of K{(c.total ?? 0).toLocaleString()}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`scroll-page ${activePage === 'shared' ? 'active' : ''}`} id="page-shared">
              <div className="section-header">
                <div className="section-title">Shared Budgets</div>
                <button className="add-btn">+ New Shared Budget</button>
              </div>

              <div className="two-col">
                <div className="card">
                  <div className="card-title" style={{ marginBottom: 12 }}>
                    Household Budget
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--t1)' }}>
                        K 6,000
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--t2)' }}>Monthly budget</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--danger)' }}>
                        K 4,200
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--t2)' }}>Spent so far</div>
                    </div>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg4)', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
                    <div style={{ height: '100%', width: '70%', background: 'var(--info)', borderRadius: 10 }} />
                  </div>
                  <div className="shared-member">
                    <div className="member-avatar" style={{ background: 'rgba(0,200,150,.15)', color: 'var(--acc)' }}>
                      K
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--t1)' }}>Knowledge (You)</div>
                      <div style={{ fontSize: 11, color: 'var(--t2)' }}>Spent K 2,800</div>
                    </div>
                    <div style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--acc)' }}>67%</div>
                  </div>
                  <div className="shared-member">
                    <div className="member-avatar" style={{ background: 'rgba(55,138,221,.15)', color: 'var(--info)' }}>
                      T
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--t1)' }}>Tendai</div>
                      <div style={{ fontSize: 11, color: 'var(--t2)' }}>Spent K 1,400</div>
                    </div>
                    <div style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--info)' }}>33%</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title" style={{ marginBottom: 12 }}>
                    Couple Budget
                  </div>
                  <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--t2)' }}>
                    Shared with partner — tracking groceries, utilities, and rent together.
                  </div>
                  <div className="shared-member">
                    <div className="member-avatar" style={{ background: 'rgba(168,85,247,.15)', color: 'var(--purple)' }}>
                      N
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--t1)' }}>Natasha</div>
                      <div style={{ fontSize: 11, color: 'var(--t2)' }}>Partner · Joined Mar 2026</div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--acc)' }}>Active</div>
                  </div>
                  <button className="add-btn" style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}>
                    + Invite Member
                  </button>
                </div>
              </div>
            </div>

            <div className={`scroll-page ${activePage === 'reports' ? 'active' : ''}`} id="page-reports">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div className="tab-bar">
                  {(['Monthly', 'Quarterly', 'Yearly'] as const).map((t) => (
                    <div
                      key={t}
                      className={`tab ${reportsTab === t ? 'active' : ''}`}
                      onClick={() => setReportsTab(t)}
                    >
                      {t}
                    </div>
                  ))}
                </div>
                <button className="export-btn" onClick={exportCSV}>
                  ⬇ Export PDF
                </button>
              </div>

              {reportsStats}

              <div className="card">
                <div className="card-title">2026 Overview</div>
                <div className="card-sub">Monthly income vs expenses</div>
                <BarChart series={data12} labels={months12} height={160} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
