import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

/**
 * Generic request body validator.
 * Returns a 400 with a descriptive message on failure.
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: "Invalid request body.",
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data; // replace with parsed/coerced data
    next();
  };
}

// ── Schemas ──────────────────────────────────────────────────────────────────

export const chatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty.")
    .max(10_000, "Message is too long (max 10,000 characters)."),
  sessionId: z.string().uuid("sessionId must be a valid UUID.").optional(),
});

export const sessionIdParamSchema = z.object({
  sessionId: z.string().uuid("sessionId must be a valid UUID."),
});
