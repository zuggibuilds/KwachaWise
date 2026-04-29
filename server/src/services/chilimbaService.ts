import { db } from '../db/index.js';
import { AppError } from '../utils/errors.js';
import { createId } from '../utils/ids.js';
import { addDays, addMonths, nowIso } from '../utils/dates.js';

type Frequency = 'weekly' | 'monthly';
type GroupStatus = 'draft' | 'active';

interface ChilimbaGroupRow {
  id: string;
  user_id: string;
  name: string;
  contribution_amount_ngwee: number;
  frequency: Frequency;
  start_date: string;
  status: GroupStatus;
  created_at: string;
}

interface ChilimbaMemberRow {
  id: string;
  group_id: string;
  display_name: string;
  phone: string | null;
  payout_position: number;
  created_at: string;
}

interface ChilimbaRoundRow {
  id: string;
  group_id: string;
  round_number: number;
  recipient_member_id: string;
  status: 'open' | 'completed';
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

interface ChilimbaPaymentRow {
  id: string;
  round_id: string;
  member_id: string;
  paid: 0 | 1;
  paid_at: string | null;
  updated_by: string;
  updated_at: string;
  created_at: string;
}

export interface ChilimbaListItem {
  id: string;
  name: string;
  contribution_amount_ngwee: number;
  frequency: Frequency;
  start_date: string;
  status: GroupStatus;
  member_count: number;
  current_round_number: number | null;
}

export interface ChilimbaDetail {
  group: ChilimbaGroupRow;
  members: ChilimbaMemberRow[];
  currentRound: (ChilimbaRoundRow & { recipientName: string; payments: Array<ChilimbaPaymentRow & { memberName: string }> }) | null;
  history: Array<ChilimbaRoundRow & { recipientName: string; paymentCount: number; paidCount: number }>;
}

function getGroupById(userId: string, groupId: string): ChilimbaGroupRow {
  const group = db.prepare('SELECT id, user_id, name, contribution_amount_ngwee, frequency, start_date, status, created_at FROM chilimba_groups WHERE id = ? AND user_id = ?').get(groupId, userId) as ChilimbaGroupRow | undefined;
  if (!group) {
    throw new AppError(404, 'CHILIMBA_GROUP_NOT_FOUND', 'Chilimba group not found');
  }
  return group;
}

function getMembers(groupId: string): ChilimbaMemberRow[] {
  return db.prepare('SELECT id, group_id, display_name, phone, payout_position, created_at FROM chilimba_members WHERE group_id = ? ORDER BY payout_position ASC').all(groupId) as unknown as ChilimbaMemberRow[];
}

function getOpenRound(groupId: string): ChilimbaRoundRow | null {
  return (db.prepare('SELECT id, group_id, round_number, recipient_member_id, status, due_date, completed_at, created_at FROM chilimba_rounds WHERE group_id = ? AND status = ? ORDER BY round_number DESC LIMIT 1').get(groupId, 'open') as ChilimbaRoundRow | undefined) ?? null;
}

function getRoundById(groupId: string, roundId: string): ChilimbaRoundRow | null {
  return (db.prepare('SELECT id, group_id, round_number, recipient_member_id, status, due_date, completed_at, created_at FROM chilimba_rounds WHERE id = ? AND group_id = ?').get(roundId, groupId) as ChilimbaRoundRow | undefined) ?? null;
}

function getRecipientName(groupId: string, recipientMemberId: string): string {
  const member = db.prepare('SELECT display_name FROM chilimba_members WHERE id = ? AND group_id = ?').get(recipientMemberId, groupId) as { display_name: string } | undefined;
  return member?.display_name ?? 'Unknown';
}

function buildPayments(roundId: string): Array<ChilimbaPaymentRow & { memberName: string }> {
  return db
    .prepare(
      `SELECT p.id, p.round_id, p.member_id, p.paid, p.paid_at, p.updated_by, p.updated_at, p.created_at, m.display_name AS memberName
       FROM chilimba_payments p
       JOIN chilimba_members m ON m.id = p.member_id
       WHERE p.round_id = ?
       ORDER BY m.payout_position ASC`
    )
    .all(roundId) as unknown as Array<ChilimbaPaymentRow & { memberName: string }>;
}

function createRound(group: ChilimbaGroupRow, roundNumber: number, members: ChilimbaMemberRow[]): ChilimbaRoundRow {
  const recipientPosition = ((roundNumber - 1) % members.length) + 1;
  const recipient = members.find((member) => member.payout_position === recipientPosition);
  if (!recipient) {
    throw new AppError(400, 'CHILIMBA_ROUND_INVALID', 'Unable to determine round recipient');
  }

  const dueDate = roundNumber === 1 ? group.start_date : group.frequency === 'weekly' ? addDays(group.start_date, 7 * (roundNumber - 1)) : addMonths(group.start_date, roundNumber - 1);
  const round: ChilimbaRoundRow = {
    id: createId(),
    group_id: group.id,
    round_number: roundNumber,
    recipient_member_id: recipient.id,
    status: 'open',
    due_date: dueDate,
    completed_at: null,
    created_at: nowIso()
  };

  db.prepare('INSERT INTO chilimba_rounds (id, group_id, round_number, recipient_member_id, status, due_date, completed_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
    round.id,
    round.group_id,
    round.round_number,
    round.recipient_member_id,
    round.status,
    round.due_date,
    round.completed_at,
    round.created_at
  );

  const paymentInsert = db.prepare('INSERT INTO chilimba_payments (id, round_id, member_id, paid, paid_at, updated_by, updated_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  for (const member of members) {
    paymentInsert.run(createId(), round.id, member.id, 0, null, group.user_id, nowIso(), nowIso());
  }

  return round;
}

export function listChilimba(userId: string): ChilimbaListItem[] {
  const groups = db.prepare('SELECT id, user_id, name, contribution_amount_ngwee, frequency, start_date, status, created_at FROM chilimba_groups WHERE user_id = ? ORDER BY created_at DESC').all(userId) as unknown as ChilimbaGroupRow[];
  return groups.map((group) => {
    const memberCount = db.prepare('SELECT COUNT(*) AS count FROM chilimba_members WHERE group_id = ?').get(group.id) as { count: number };
    const currentRound = db.prepare('SELECT round_number FROM chilimba_rounds WHERE group_id = ? AND status = ? ORDER BY round_number DESC LIMIT 1').get(group.id, 'open') as { round_number: number } | undefined;
    return {
      id: group.id,
      name: group.name,
      contribution_amount_ngwee: group.contribution_amount_ngwee,
      frequency: group.frequency,
      start_date: group.start_date,
      status: group.status,
      member_count: memberCount.count,
      current_round_number: currentRound?.round_number ?? null
    };
  });
}

export function createDraftGroup(userId: string, input: { name: string; contributionAmountNgwee: number; frequency: Frequency; startDate: string }): ChilimbaGroupRow {
  const group: ChilimbaGroupRow = {
    id: createId(),
    user_id: userId,
    name: input.name.trim(),
    contribution_amount_ngwee: input.contributionAmountNgwee,
    frequency: input.frequency,
    start_date: input.startDate,
    status: 'draft',
    created_at: nowIso()
  };

  db.prepare('INSERT INTO chilimba_groups (id, user_id, name, contribution_amount_ngwee, frequency, start_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
    group.id,
    group.user_id,
    group.name,
    group.contribution_amount_ngwee,
    group.frequency,
    group.start_date,
    group.status,
    group.created_at
  );

  return group;
}

export function addMember(userId: string, groupId: string, input: { displayName: string; phone?: string | null; payoutPosition: number }): ChilimbaMemberRow {
  const group = getGroupById(userId, groupId);
  if (group.status !== 'draft') {
    throw new AppError(409, 'CHILIMBA_LOCKED', 'Members can only be changed while the group is in draft');
  }

  const member: ChilimbaMemberRow = {
    id: createId(),
    group_id: groupId,
    display_name: input.displayName.trim(),
    phone: input.phone ?? null,
    payout_position: input.payoutPosition,
    created_at: nowIso()
  };

  db.prepare('INSERT INTO chilimba_members (id, group_id, display_name, phone, payout_position, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    member.id,
    member.group_id,
    member.display_name,
    member.phone,
    member.payout_position,
    member.created_at
  );

  return member;
}

export function reorderMembers(userId: string, groupId: string, orderedMemberIds: string[]): ChilimbaMemberRow[] {
  const group = getGroupById(userId, groupId);
  if (group.status !== 'draft') {
    throw new AppError(409, 'CHILIMBA_LOCKED', 'Members can only be reordered while the group is in draft');
  }

  const members = getMembers(groupId);
  if (members.length !== orderedMemberIds.length || !orderedMemberIds.every((id) => members.some((member) => member.id === id))) {
    throw new AppError(400, 'INVALID_MEMBER_ORDER', 'Ordered member ids must match the current group members');
  }

  const update = db.prepare('UPDATE chilimba_members SET payout_position = ? WHERE id = ? AND group_id = ?');
  orderedMemberIds.forEach((memberId, index) => {
    update.run(index + 1, memberId, groupId);
  });

  return getMembers(groupId);
}

export function startGroup(userId: string, groupId: string): ChilimbaDetail {
  const group = getGroupById(userId, groupId);
  if (group.status !== 'draft') {
    throw new AppError(409, 'CHILIMBA_ALREADY_STARTED', 'Group has already been started');
  }

  const members = getMembers(groupId);
  if (members.length === 0) {
    throw new AppError(400, 'CHILIMBA_NO_MEMBERS', 'Add at least one member before starting');
  }

  db.transaction(() => {
    db.prepare('UPDATE chilimba_groups SET status = ? WHERE id = ? AND user_id = ?').run('active', groupId, userId);
    createRound({ ...group, status: 'active' }, 1, members);
  });

  return getGroupDetail(userId, groupId);
}

export function getGroupDetail(userId: string, groupId: string): ChilimbaDetail {
  const group = getGroupById(userId, groupId);
  const members = getMembers(groupId);
  const currentRound = getOpenRound(groupId);
  const history = db
    .prepare(
      `SELECT r.id, r.group_id, r.round_number, r.recipient_member_id, r.status, r.due_date, r.completed_at, r.created_at,
        m.display_name AS recipientName,
        COUNT(p.id) AS paymentCount,
        SUM(CASE WHEN p.paid = 1 THEN 1 ELSE 0 END) AS paidCount
       FROM chilimba_rounds r
       JOIN chilimba_members m ON m.id = r.recipient_member_id
       LEFT JOIN chilimba_payments p ON p.round_id = r.id
       WHERE r.group_id = ?
       GROUP BY r.id
       ORDER BY r.round_number DESC`
    )
    .all(groupId) as unknown as Array<ChilimbaRoundRow & { recipientName: string; paymentCount: number; paidCount: number }>;

  return {
    group,
    members,
    currentRound: currentRound
      ? {
          ...currentRound,
          recipientName: getRecipientName(groupId, currentRound.recipient_member_id),
          payments: buildPayments(currentRound.id)
        }
      : null,
    history
  };
}

export function togglePayment(userId: string, groupId: string, roundId: string, memberId: string, paid: boolean): ChilimbaDetail {
  const group = getGroupById(userId, groupId);
  const round = getRoundById(groupId, roundId);
  if (!round || round.status !== 'open') {
    throw new AppError(409, 'CHILIMBA_ROUND_CLOSED', 'Payments can only be changed while the round is open');
  }

  const member = db.prepare('SELECT id FROM chilimba_members WHERE id = ? AND group_id = ?').get(memberId, groupId) as { id: string } | undefined;
  if (!member) {
    throw new AppError(404, 'CHILIMBA_MEMBER_NOT_FOUND', 'Member not found');
  }

  const updatedAt = nowIso();
  db.prepare('UPDATE chilimba_payments SET paid = ?, paid_at = ?, updated_by = ?, updated_at = ? WHERE round_id = ? AND member_id = ?').run(
    paid ? 1 : 0,
    paid ? updatedAt : null,
    userId,
    updatedAt,
    roundId,
    memberId
  );

  return getGroupDetail(group.user_id, groupId);
}

export function completeRound(userId: string, groupId: string, roundId: string): ChilimbaDetail {
  const group = getGroupById(userId, groupId);
  const round = getRoundById(groupId, roundId);
  if (!round || round.status !== 'open') {
    throw new AppError(409, 'CHILIMBA_ROUND_CLOSED', 'Round is not open');
  }

  const members = getMembers(groupId);
  const paymentCount = db.prepare('SELECT COUNT(*) AS count, SUM(CASE WHEN paid = 1 THEN 1 ELSE 0 END) AS paidCount FROM chilimba_payments WHERE round_id = ?').get(roundId) as { count: number; paidCount: number };
  if (paymentCount.count !== members.length || paymentCount.paidCount !== members.length) {
    throw new AppError(400, 'CHILIMBA_INCOMPLETE', 'All member payments must be marked paid before completing the round');
  }

  db.transaction(() => {
    db.prepare('UPDATE chilimba_rounds SET status = ?, completed_at = ? WHERE id = ? AND group_id = ?').run('completed', nowIso(), roundId, groupId);
    createRound(group, round.round_number + 1, members);
  });

  return getGroupDetail(userId, groupId);
}
