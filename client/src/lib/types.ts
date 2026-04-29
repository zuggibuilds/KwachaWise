export interface ApiErrorShape {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  code: string;
  details?: unknown;

  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount_ngwee: number;
  category_id: string;
  category_name: string;
  occurred_at: string;
  note: string | null;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  month: string;
  category_id: string;
  category_name: string;
  amount_ngwee: number;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount_ngwee: number;
  current_amount_ngwee: number;
  deadline: string | null;
  created_at: string;
}

export interface ReportSummary {
  totals: {
    income_ngwee: number;
    expense_ngwee: number;
  };
  byCategory: Array<{ categoryId: string; categoryName: string; expense_ngwee: number }>;
  byDay: Array<{ date: string; income_ngwee: number; expense_ngwee: number }>;
}

export interface AiAdvisorInsight {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'positive';
}

export interface ChilimbaListItem {
  id: string;
  name: string;
  contribution_amount_ngwee: number;
  frequency: 'weekly' | 'monthly';
  start_date: string;
  status: 'draft' | 'active';
  member_count: number;
  current_round_number: number | null;
}
