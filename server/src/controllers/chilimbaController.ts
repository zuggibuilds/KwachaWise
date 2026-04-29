import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';
import { addMember, completeRound, createDraftGroup, getGroupDetail, listChilimba, reorderMembers, startGroup, togglePayment } from '../services/chilimbaService.js';
import { isIsoDate } from '../utils/dates.js';

const groupSchema = z.object({
  name: z.string().min(1).max(120),
  contributionAmountNgwee: z.number().int().positive(),
  frequency: z.enum(['weekly', 'monthly']),
  startDate: z.string().refine(isIsoDate, 'Expected YYYY-MM-DD')
});

const memberSchema = z.object({
  displayName: z.string().min(1).max(120),
  phone: z.string().max(40).nullable().optional(),
  payoutPosition: z.number().int().positive()
});

const reorderSchema = z.object({ orderedMemberIds: z.array(z.string().min(1)).min(1) });

const toggleSchema = z.object({ paid: z.boolean() });

export const getGroups = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  res.json({ groups: listChilimba(req.user.id) });
});

export const postGroup = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const parsed = groupSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid chilimba payload', parsed.error.flatten());
  }

  res.status(201).json({ group: createDraftGroup(req.user.id, parsed.data) });
});

export const postMember = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const parsed = memberSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid member payload', parsed.error.flatten());
  }

  res.status(201).json({ member: addMember(req.user.id, String(req.params.id), parsed.data) });
});

export const patchMembersReorder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const parsed = reorderSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid reorder payload', parsed.error.flatten());
  }

  res.json({ members: reorderMembers(req.user.id, String(req.params.id), parsed.data.orderedMemberIds) });
});

export const start = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  res.json({ chilimba: startGroup(req.user.id, String(req.params.id)) });
});

export const getDetail = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  res.json({ chilimba: getGroupDetail(req.user.id, String(req.params.id)) });
});

export const patchPayment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const parsed = toggleSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid payment payload', parsed.error.flatten());
  }

  res.json({ chilimba: togglePayment(req.user.id, String(req.params.id), String(req.params.roundId), String(req.params.memberId), parsed.data.paid) });
});

export const complete = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  res.json({ chilimba: completeRound(req.user.id, String(req.params.id), String(req.params.roundId)) });
});
