import React, { useState } from 'react';
import Sheet from '../ui/Sheet';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Toast from '../ui/Toast';
import { ApiError } from '../../lib/types';

type Transaction = {
  amount: number; // in ngwee
  type: 'expense' | 'income';
  category: string;
  date: string; // ISO
  note?: string;
  recurrence?: {
    frequency: 'none' | 'daily' | 'weekly' | 'monthly';
    interval?: number;
    dayOfMonth?: number | null;
    weekday?: number | null;
  };
};

type RecurrenceErrors = Partial<Record<'interval' | 'dayOfMonth' | 'weekday', string>>;

function validateRecurrence(recurrence: Transaction['recurrence'] | undefined): RecurrenceErrors {
  const errors: RecurrenceErrors = {};
  if (!recurrence || recurrence.frequency === 'none') return errors;

  const interval = Number(recurrence.interval ?? 1);
  if (!Number.isInteger(interval) || interval < 1 || interval > 365) {
    errors.interval = 'Interval must be between 1 and 365';
  }

  if (recurrence.frequency === 'monthly') {
    if (recurrence.dayOfMonth == null) {
      errors.dayOfMonth = 'Day of month is required';
    } else if (!Number.isInteger(recurrence.dayOfMonth) || recurrence.dayOfMonth < 1 || recurrence.dayOfMonth > 28) {
      errors.dayOfMonth = 'Day of month must be 1-28';
    }
  }

  if (recurrence.frequency === 'weekly') {
    if (recurrence.weekday == null) {
      errors.weekday = 'Weekday is required';
    } else if (!Number.isInteger(recurrence.weekday) || recurrence.weekday < 0 || recurrence.weekday > 6) {
      errors.weekday = 'Weekday must be 0-6';
    }
  }

  return errors;
}

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (tx: Transaction) => Promise<void> | void;
  initial?: Partial<Transaction>;
};

export const TransactionSheet: React.FC<Props> = ({ open, onClose, onSave, initial = {} }) => {
  const [amount, setAmount] = useState<string>(initial.amount ? String(initial.amount / 100) : '');
  const [type, setType] = useState<'expense' | 'income'>(initial.type || 'expense');
  const [category, setCategory] = useState<string>(initial.category || '');
  const [date, setDate] = useState<string>(initial.date || new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState<string>(initial.note || '');
  const [recurrence, setRecurrence] = useState<Transaction['recurrence']>(() =>
    (initial as any).recurrence ?? { frequency: 'none' }
  );
  const [recurrenceErrors, setRecurrenceErrors] = useState<RecurrenceErrors>({});
  const [loading, setLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const save = async () => {
    const parsed = Math.round(parseFloat(amount || '0') * 100);
    if (!parsed || parsed <= 0) return alert('Enter a valid amount');
    if (!category) return alert('Choose a category');
    const recurrenceValidation = validateRecurrence(recurrence);
    if (Object.keys(recurrenceValidation).length > 0) {
      setRecurrenceErrors(recurrenceValidation);
      return;
    }
    const tx: Transaction = { amount: parsed, type, category, date, note };
    if (recurrence && recurrence.frequency && recurrence.frequency !== 'none') {
      tx.recurrence = recurrence;
    }
    setLoading(true);
    try {
      setRecurrenceErrors({});
      await onSave(tx);
      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
        onClose();
      }, 700);
    } catch (e) {
      // show inline error or toast
      if (e instanceof ApiError) {
        alert(e.message);
      } else {
        alert('Failed to save transaction');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Sheet open={open} onClose={onClose} aria-label="Add transaction">
        <div className="space-y-4">
          <div>
            <div className="text-sm text-[var(--color-muted)]">Amount</div>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              startAdornment={<span className="text-sm">ZMW</span>}
              placeholder="0.00"
              aria-label="Amount"
            />
          </div>

          <div className="flex gap-2">
            <Button variant={type === 'expense' ? 'primary' : 'ghost'} onClick={() => setType('expense')} className="flex-1">
              Expense
            </Button>
            <Button variant={type === 'income' ? 'primary' : 'ghost'} onClick={() => setType('income')} className="flex-1">
              Income
            </Button>
          </div>

          <div>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (e.g., Food)" label="Category" />
          </div>

          <div>
            <Input value={date} onChange={(e) => setDate(e.target.value)} type="date" label="Date" />
          </div>

          <div>
            <label className="text-sm text-[var(--color-muted)]">Repeat</label>
            <div className="mt-2 flex items-center gap-2">
              <select value={recurrence?.frequency ?? 'none'} onChange={(e) => setRecurrence((prev) => ({ ...(prev ?? { frequency: 'none' }), frequency: e.target.value as any }))} className="rounded-xl border border-brand-100 px-3 py-2 text-sm">
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <input
                type="number"
                min={1}
                value={recurrence?.interval ?? 1}
                onChange={(e) => setRecurrence((prev) => ({ ...(prev ?? { frequency: 'none' }), interval: Number(e.target.value) || 1 }))}
                className="w-20 rounded-xl border border-brand-100 px-3 py-2 text-sm"
                title="Interval"
              />
            </div>
            {recurrenceErrors.interval ? <div className="mt-1 text-xs text-[var(--color-danger)]">{recurrenceErrors.interval}</div> : null}

            {recurrence?.frequency === 'monthly' ? (
              <div className="mt-2">
                <Input value={recurrence.dayOfMonth ? String(recurrence.dayOfMonth) : ''} onChange={(e) => setRecurrence((prev) => ({ ...(prev ?? { frequency: 'monthly' }), dayOfMonth: e.target.value ? Number(e.target.value) : null }))} placeholder="Day of month (1-28)" />
                {recurrenceErrors.dayOfMonth ? <div className="mt-1 text-xs text-[var(--color-danger)]">{recurrenceErrors.dayOfMonth}</div> : null}
              </div>
            ) : null}

            {recurrence?.frequency === 'weekly' ? (
              <div className="mt-2">
                <select value={recurrence.weekday ?? 0} onChange={(e) => setRecurrence((prev) => ({ ...(prev ?? { frequency: 'weekly' }), weekday: Number(e.target.value) }))} className="rounded-xl border border-brand-100 px-3 py-2 text-sm">
                  <option value={0}>Sunday</option>
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                </select>
                {recurrenceErrors.weekday ? <div className="mt-1 text-xs text-[var(--color-danger)]">{recurrenceErrors.weekday}</div> : null}
              </div>
            ) : null}
          </div>

          <div>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" label="Note" />
          </div>

          <div className="flex gap-2">
            <Button onClick={onClose} variant="ghost" className="flex-1">Cancel</Button>
            <Button onClick={save} variant="primary" className="flex-1" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      </Sheet>
      <Toast open={toastOpen} onClose={() => setToastOpen(false)} variant="success">Saved</Toast>
    </>
  );
};

export default TransactionSheet;
