import { Router, Request, Response, NextFunction } from "express";
import { handleChat, getHistory } from "../services/chat";
import {
  validateBody,
  chatRequestSchema,
  sessionIdParamSchema,
} from "../middleware/validation";
import type { ChatRequest } from "../types";

const router = Router();

/**
 * POST /chat/message
 * Sends a user message and returns the AI reply.
 */
router.post(
  "/message",
  validateBody(chatRequestSchema),
  async (
    req: Request<{}, {}, ChatRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { message, sessionId } = req.body;
      const result = await handleChat(message, sessionId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /chat/history/:sessionId
 * Returns persisted messages for a session (for reload / resume).
 */
router.get(
  "/history/:sessionId",
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = sessionIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid sessionId format." });
        return;
      }

      const history = getHistory(parsed.data.sessionId);
      if (!history) {
        res.status(404).json({ error: "Session not found." });
        return;
      }

      res.json(history);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /chat/health
 * Lightweight health-check endpoint.
 */
router.get("/health", (_req: Request, res: Response): void => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
