import { useState } from 'react';
import { Reorder } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../api/client';
import { dateToday, zmwToNgwee } from '../lib/format';
import { trackEvent } from '../lib/analytics';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function ChilimbaCreatePage() {
  const navigate = useNavigate();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [name, setName] = useState('');
  const [contribution, setContribution] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('monthly');
  const [startDate, setStartDate] = useState(dateToday());
  const [memberName, setMemberName] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [members, setMembers] = useState<Array<{ id: string; displayName: string; phone: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragStartOrder, setDragStartOrder] = useState<string[] | null>(null);

  function commitMembers(nextMembers: Array<{ id: string; displayName: string; phone: string }>, source: 'button' | 'keyboard' | 'drag', meta?: Record<string, unknown>) {
    setMembers(nextMembers);
    trackEvent('chilimba_reorder', {
      source,
      memberCount: nextMembers.length,
      order: nextMembers.map((member) => member.id),
      ...meta
    });
  }

  async function createGroup(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    if (members.length === 0) {
      setError('Add at least one member');
      return;
    }

    setSaving(true);
    try {
      const groupData = await apiPost<{ group: { id: string } }>('/chilimba', {
        name,
        contributionAmountNgwee: zmwToNgwee(contribution),
        frequency,
        startDate
      });

      for (let index = 0; index < members.length; index += 1) {
        const member = members[index];
        await apiPost(`/chilimba/${groupData.group.id}/members`, {
          displayName: member.displayName,
          phone: member.phone || null,
          payoutPosition: index + 1
        });
      }

      navigate(`/chilimba/${groupData.group.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create chilimba group');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <form className="space-y-2 rounded-2xl border border-brand-100 bg-white p-4 shadow-soft" onSubmit={createGroup}>
        <h2 className="text-sm font-semibold">Draft setup</h2>
        <input className="w-full rounded-xl border border-brand-100 px-3 py-3 text-sm" placeholder="Group name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input
          className="w-full rounded-xl border border-brand-100 px-3 py-3 text-sm"
          placeholder="Contribution amount in ZMW"
          value={contribution}
          onChange={(e) => setContribution(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            className="rounded-xl border border-brand-100 px-3 py-3 text-sm"
            title="Chilimba frequency"
            aria-label="Chilimba frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as 'weekly' | 'monthly')}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <input className="rounded-xl border border-brand-100 px-3 py-3 text-sm" type="date" title="Chilimba start date" aria-label="Chilimba start date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>

        <div className="mt-2 rounded-xl border border-brand-100 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Members and payout order</p>
            <p className="text-[11px] text-slate-500">Drag the handle or use ↑ ↓</p>
          </div>
          <div className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2">
            <input className="rounded-xl border border-brand-100 px-3 py-2 text-sm" placeholder="Name" value={memberName} onChange={(e) => setMemberName(e.target.value)} />
            <input className="rounded-xl border border-brand-100 px-3 py-2 text-sm" placeholder="Phone" value={memberPhone} onChange={(e) => setMemberPhone(e.target.value)} />
            <button
              type="button"
              className="rounded-xl bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700"
              onClick={() => {
                if (!memberName.trim()) {
                  return;
                }
                setMembers((prev) => [...prev, { id: `m-${Date.now()}`, displayName: memberName.trim(), phone: memberPhone.trim() }]);
                setMemberName('');
                setMemberPhone('');
              }}
            >
              Add
            </button>
          </div>
          <Reorder.Group axis="y" values={members} onReorder={setMembers} className="mt-3 space-y-2">
            {members.map((member, index) => (
              <Reorder.Item
                key={member.id}
                value={member}
                className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-3 shadow-sm focus-within:ring-2 focus-within:ring-brand-300"
                whileDrag={prefersReducedMotion ? undefined : { scale: 1.02 }}
                onDragStart={() => setDragStartOrder(members.map((item) => item.id))}
                onDragEnd={() => {
                  if (!dragStartOrder) return;
                  const currentOrder = members.map((item) => item.id);
                  if (dragStartOrder.join('|') !== currentOrder.join('|')) {
                    trackEvent('chilimba_reorder', {
                      source: 'drag',
                      memberCount: members.length,
                      previousOrder: dragStartOrder,
                      order: currentOrder
                    });
                  }
                  setDragStartOrder(null);
                }}
                onKeyDown={(event) => {
                  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
                  event.preventDefault();
                  const nextIndex = event.key === 'ArrowUp' ? index - 1 : index + 1;
                  if (nextIndex < 0 || nextIndex >= members.length) return;
                  commitMembers(moveItem(members, index, nextIndex), 'keyboard', {
                    fromIndex: index,
                    toIndex: nextIndex,
                    movedMemberId: member.id
                  });
                }}
                tabIndex={0}
                role="group"
                aria-label={`${member.displayName}, position ${index + 1}`}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-100 bg-white text-brand-700 shadow-sm transition hover:bg-brand-100"
                    aria-label={`Drag handle for ${member.displayName}`}
                    title="Drag to reorder"
                  >
                    <span aria-hidden="true" className="text-sm leading-none">⋮⋮</span>
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {index + 1}. {member.displayName}
                    </p>
                    <p className="text-xs text-slate-500">Use the handle, or press ↑ / ↓ to move</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 sm:mt-0">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="rounded-lg bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={index === 0}
                      aria-label={`Move ${member.displayName} up`}
                      onClick={() => commitMembers(moveItem(members, index, index - 1), 'button', { direction: 'up', movedMemberId: member.id })}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={index === members.length - 1}
                      aria-label={`Move ${member.displayName} down`}
                      onClick={() => commitMembers(moveItem(members, index, index + 1), 'button', { direction: 'down', movedMemberId: member.id })}
                    >
                      Down
                    </button>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg bg-white px-2 py-1 text-xs font-medium text-red-700 shadow-sm transition hover:bg-red-50"
                    onClick={() => setMembers((prev) => prev.filter((m) => m.id !== member.id))}
                  >
                    Remove
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white" type="submit" disabled={saving}>
          {saving ? 'Saving draft...' : 'Create draft'}
        </button>
      </form>
    </div>
  );
}
