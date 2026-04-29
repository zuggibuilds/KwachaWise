import React, { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost, apiDelete, apiPatch } from '../api/client';
import Card from '../components/ui/Card';
import Sheet from '../components/ui/Sheet';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { ApiError } from '../lib/types';

type Reminder = { id: string; title: string; description?: string; due_date?: string | null; remind_before_days?: number };
type ReminderDraft = {
  title: string;
  description: string;
  dueDate: string;
  remindBefore: string;
  enabled: boolean;
};

type ReminderErrors = Partial<Record<'title' | 'description' | 'dueDate' | 'remindBefore', string>>;

function validateReminderDraft(draft: ReminderDraft): ReminderErrors {
  const errors: ReminderErrors = {};
  const title = draft.title.trim();
  const description = draft.description.trim();
  const dueDate = draft.dueDate.trim();
  const remindBefore = Number(draft.remindBefore);

  if (!title) errors.title = 'Title is required';
  else if (title.length > 200) errors.title = 'Title must be 200 characters or less';

  if (description.length > 1000) errors.description = 'Description must be 1000 characters or less';

  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) errors.dueDate = 'Use YYYY-MM-DD';

  if (draft.remindBefore !== '') {
    if (!Number.isInteger(remindBefore)) errors.remindBefore = 'Enter a whole number';
    else if (remindBefore < 0 || remindBefore > 365) errors.remindBefore = 'Must be between 0 and 365';
  }

  return errors;
}

export default function RemindersPage() {
  const [items, setItems] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [createError, setCreateError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editItem, setEditItem] = useState<Partial<Reminder> | null>(null);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<string>('');
  const [remindBefore, setRemindBefore] = useState<string>('0');
  const [enabled, setEnabled] = useState(true);
  const [editErrors, setEditErrors] = useState<ReminderErrors>({});

  const editDraft = useMemo<ReminderDraft>(() => ({
    title: editItem?.title ?? '',
    description,
    dueDate,
    remindBefore,
    enabled
  }), [description, dueDate, editItem?.title, enabled, remindBefore]);

  async function load() {
    setLoading(true);
    const res = await apiGet('/reminders');
    const payload = res as any;
    setItems(payload.reminders || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    const draft = { title, description: '', dueDate: '', remindBefore: '0', enabled: true };
    const errors = validateReminderDraft(draft);
    if (errors.title) {
      setCreateError(errors.title);
      return;
    }
    try {
      const res = await apiPost('/reminders', { title });
      const payload = res as any;
      setItems([payload.reminder, ...items]);
      setTitle('');
      setCreateError('');
    } catch (err: any) {
      if (err instanceof ApiError && err.code === 'VALIDATION_ERROR' && err.details && typeof err.details === 'object') {
        const details = err.details as { fieldErrors?: Record<string, string[]> };
        setCreateError(details.fieldErrors?.title?.[0] ?? err.message);
        return;
      }
      setCreateError(err?.message || 'Failed to create reminder');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete reminder?')) return;
    await apiDelete(`/reminders/${id}`);
    setItems(items.filter(i => i.id !== id));
  }

  function openEditor(id: string) {
    const it = items.find(x => x.id === id);
    if (!it) return;
    setEditItem(it);
    setDescription(it.description ?? '');
    setDueDate(it.due_date ?? '');
    setRemindBefore(String(it.remind_before_days ?? 0));
    setEnabled((it as any).enabled ? true : false);
    setEditErrors({});
    setEditing(true);
  }

  async function submitEdit() {
    if (!editItem) return;
    try {
      const errors = validateReminderDraft(editDraft);
      if (Object.keys(errors).length > 0) {
        setEditErrors(errors);
        return;
      }

      const payload = {
        title: editDraft.title,
        description: editDraft.description || null,
        due_date: editDraft.dueDate || null,
        remind_before_days: editDraft.remindBefore === '' ? 0 : Number(editDraft.remindBefore),
        enabled: enabled ? 1 : 0
      };
      const res = await apiPatch(`/reminders/${editItem.id}`, payload);
      const data = res as any;
      setItems(items.map(x => (x.id === editItem.id ? data.reminder : x)));
      setEditing(false);
      setEditItem(null);
      setEditErrors({});
    } catch (err: any) {
      if (err instanceof ApiError && err.code === 'VALIDATION_ERROR' && err.details && typeof err.details === 'object') {
        const details = err.details as { fieldErrors?: Record<string, string[]> };
        const nextErrors: ReminderErrors = {};
        const fieldErrors = details.fieldErrors ?? {};
        if (fieldErrors.title?.[0]) nextErrors.title = fieldErrors.title[0];
        if (fieldErrors.description?.[0]) nextErrors.description = fieldErrors.description[0];
        if (fieldErrors.dueDate?.[0]) nextErrors.dueDate = fieldErrors.dueDate[0];
        if (fieldErrors.remindBefore?.[0]) nextErrors.remindBefore = fieldErrors.remindBefore[0];
        setEditErrors(nextErrors);
        return;
      }
      alert(err?.message || 'Failed to update');
    }
  }

  return (
    <>
    <div className="p-4">
      <h2 className="mb-4 text-xl font-semibold">Reminders</h2>
      <div className="mb-3 flex gap-2">
        <div className="flex-1">
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="New reminder title" error={createError} />
        </div>
        <button onClick={handleCreate} className="btn">Add</button>
      </div>
      {loading && <div>Loading…</div>}
      <div className="space-y-2">
        {items.map(it => (
          <Card key={it.id} className="flex items-center justify-between">
            <div>
              <div className="font-medium">{it.title}</div>
              <div className="text-sm text-slate-500">{it.due_date ?? 'No due date'}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEditor(it.id)} className="text-sm text-slate-600">Edit</button>
              <button onClick={() => handleDelete(it.id)} className="text-red-500">Delete</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
    <Sheet open={editing} onClose={() => setEditing(false)} aria-label="Edit reminder">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Edit reminder</h3>
        <Input label="Title" value={editItem?.title ?? ''} onChange={(e) => setEditItem({ ...(editItem ?? {}), title: e.target.value })} error={editErrors.title} />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} error={editErrors.description} />
        <Input label="Due date (YYYY-MM-DD)" value={dueDate} onChange={(e) => setDueDate(e.target.value)} error={editErrors.dueDate} />
        <Input label="Remind before days" value={remindBefore} onChange={(e) => setRemindBefore(e.target.value)} error={editErrors.remindBefore} />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} /> Enabled
          </label>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
          <Button onClick={submitEdit}>Save</Button>
        </div>
      </div>
    </Sheet>
    </>
  );
}
