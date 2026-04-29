import { z } from 'zod';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const createRecurringSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount_ngwee: z.number().int().positive(),
  category_id: z.string().min(1),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  interval: z.number().int().min(1).max(365).optional().default(1),
  day_of_month: z.number().int().min(1).max(28).nullable().optional(),
  weekday: z.number().int().min(0).max(6).nullable().optional(),
  next_occurrence: dateString,
  enabled: z.union([z.literal(0), z.literal(1)]).optional()
}).superRefine((value, ctx) => {
  if (value.frequency === 'monthly' && value.day_of_month == null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Day of month is required for monthly recurrence', path: ['day_of_month'] });
  }

  if (value.frequency === 'weekly' && value.weekday == null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Weekday is required for weekly recurrence', path: ['weekday'] });
  }
});

export type CreateRecurringInput = z.infer<typeof createRecurringSchema>;
