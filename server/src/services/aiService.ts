import { db } from '../db/index.js';
import { getSummaryReport } from './reportService.js';

export interface AdvisorInsight {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'positive';
}

export interface ChatMessageInput {
  role: 'user' | 'assistant';
  content: string;
}

function currentMonthRange(): { from: string; to: string; month: string } {
  const now = new Date();
  const year = now.getUTCFullYear();
  const monthNum = now.getUTCMonth() + 1;
  const month = `${year}-${String(monthNum).padStart(2, '0')}`;
  const from = `${month}-01`;
  const to = `${month}-${String(new Date(Date.UTC(year, monthNum, 0)).getUTCDate()).padStart(2, '0')}`;
  return { from, to, month };
}

function toZmw(amountNgwee: number): string {
  return `K ${(amountNgwee / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getAdvisorInsights(userId: string, from?: string, to?: string): AdvisorInsight[] {
  const range = currentMonthRange();
  const start = from ?? range.from;
  const end = to ?? range.to;
  const summary = getSummaryReport(userId, start, end);

  const income = summary.totals.income_ngwee;
  const expense = summary.totals.expense_ngwee;
  const net = income - expense;
  const insights: AdvisorInsight[] = [];

  if (expense > income) {
    insights.push({
      id: 'cashflow-warning',
      title: 'Cashflow alert',
      message: `You spent ${toZmw(expense - income)} more than you earned in this period. Reduce one flexible category this week.`,
      severity: 'warning'
    });
  } else {
    insights.push({
      id: 'cashflow-positive',
      title: 'Positive cashflow',
      message: `You are surplus by ${toZmw(net)}. Move this amount to goals before month-end.`,
      severity: 'positive'
    });
  }

  const topCategory = summary.byCategory[0];
  if (topCategory) {
    insights.push({
      id: 'top-category',
      title: 'Top spend category',
      message: `${topCategory.categoryName} is your largest expense at ${toZmw(topCategory.expense_ngwee)}. Set a cap and track weekly.`,
      severity: 'info'
    });
  }

  const budgetRows = db
    .prepare(
      `SELECT b.amount_ngwee, COALESCE(SUM(t.amount_ngwee), 0) AS spent_ngwee
       FROM budgets b
       LEFT JOIN transactions t
         ON t.user_id = b.user_id
        AND t.category_id = b.category_id
        AND t.type = 'expense'
        AND substr(t.occurred_at, 1, 7) = b.month
       WHERE b.user_id = ? AND b.month = ?
       GROUP BY b.id, b.amount_ngwee`
    )
    .all(userId, range.month) as Array<{ amount_ngwee: number; spent_ngwee: number }>;

  if (budgetRows.length > 0) {
    const overBudgetCount = budgetRows.filter((b) => b.spent_ngwee > b.amount_ngwee).length;
    if (overBudgetCount > 0) {
      insights.push({
        id: 'budget-overrun',
        title: 'Budget overruns',
        message: `${overBudgetCount} budget ${overBudgetCount === 1 ? 'category is' : 'categories are'} over limit this month. Consider shifting discretionary spend.`,
        severity: 'warning'
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      id: 'starter',
      title: 'No activity yet',
      message: 'Add a few transactions so I can generate personalized insights.',
      severity: 'info'
    });
  }

  return insights;
}

function buildContextLine(userId: string): string {
  const { from, to } = currentMonthRange();
  const summary = getSummaryReport(userId, from, to);
  const income = summary.totals.income_ngwee;
  const expense = summary.totals.expense_ngwee;
  const net = income - expense;
  const topCategory = summary.byCategory[0]?.categoryName ?? 'N/A';
  return `Current month summary: income ${toZmw(income)}, expenses ${toZmw(expense)}, net ${toZmw(net)}, top expense category ${topCategory}.`;
}

export function getChatResponse(userId: string, message: string, history: ChatMessageInput[] = []): { reply: string; suggestions: string[] } {
  const text = message.trim().toLowerCase();
  const context = buildContextLine(userId);
  const recentUserQuestions = history.filter((item) => item.role === 'user').slice(-2).map((item) => item.content).join(' | ');

  if (!text) {
    return {
      reply: `${context} Ask me about saving, spending, budgets, goals, or monthly planning.` ,
      suggestions: ['How can I save more this month?', 'What category should I reduce?', 'Give me a weekly budget plan']
    };
  }

  if (text.includes('save') || text.includes('saving')) {
    return {
      reply: `${context} To save more, set an automatic transfer for 20% of your monthly surplus the day income arrives, then cap your top discretionary category for the next 2 weeks.`,
      suggestions: ['Set a savings goal for me', 'How much should I save weekly?', 'Show my top spend category']
    };
  }

  if (text.includes('budget') || text.includes('plan')) {
    return {
      reply: `${context} Recommended split for now: needs 50%, wants 30%, goals/debt 20%. Start by reducing your top expense category by 10% and review every Sunday.`,
      suggestions: ['How to track budget overruns?', 'What should my daily spending limit be?', 'Help me build a grocery budget']
    };
  }

  if (text.includes('spend') || text.includes('expense')) {
    return {
      reply: `${context} Your fastest win is to cut repeat small purchases in your highest expense category. Set a hard weekly limit and log every transaction daily.`,
      suggestions: ['Find subscriptions to cut', 'How do I reduce airtime costs?', 'Show me debt payoff tips']
    };
  }

  if (text.includes('goal')) {
    return {
      reply: `${context} For goals, make one primary goal and fund it first. Use a fixed weekly contribution and increase contribution when your net turns positive.`,
      suggestions: ['Create an emergency fund plan', 'How much for school fees monthly?', 'What is a realistic savings target?']
    };
  }

  return {
    reply: `${context} I can help with savings, budgets, goal plans, and reducing expenses. ${recentUserQuestions ? `I also noted your recent questions: ${recentUserQuestions}.` : ''}`.trim(),
    suggestions: ['Analyse my monthly cashflow', 'Give me a savings action plan', 'How can I spend less this week?']
  };
}
