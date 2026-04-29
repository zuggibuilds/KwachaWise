import { z } from 'zod';

export const createReminderSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).nullable().optional(),
  amount_ngwee: z.number().int().nonnegative().nullable().optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  remind_before_days: z.number().int().min(0).max(365).optional(),
  enabled: z.union([z.literal(0), z.literal(1)]).optional()
});

export const updateReminderSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  amount_ngwee: z.number().int().nonnegative().nullable().optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  remind_before_days: z.number().int().min(0).max(365).optional(),
  enabled: z.union([z.literal(0), z.literal(1)]).optional()
});

export type CreateReminderInput = z.infer<typeof createReminderSchema>;
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;
