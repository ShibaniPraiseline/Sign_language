const express = require("express");
const { z } = require("zod");
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const MODES = ["sign-to-sign", "sign-to-voice", "voice-to-sign"];
const SIGN_LANGS = ["ISL", "ASL", "BSL"];

const startSchema = z.object({
  calleeId: z.string().uuid(),
  mode: z.enum(MODES),
  sourceLang: z.string(),
  targetLang: z.string(),
});

// POST /api/calls — create a call session record, returns a roomId to join via socket.io
router.post("/", requireAuth, async (req, res) => {
  const parsed = startSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }
  const { calleeId, mode, sourceLang, targetLang } = parsed.data;

  if (mode === "sign-to-sign") {
    if (!SIGN_LANGS.includes(sourceLang) || !SIGN_LANGS.includes(targetLang)) {
      return res.status(400).json({ error: "sign-to-sign requires ISL/ASL/BSL on both sides" });
    }
  }

  const session = await prisma.callSession.create({
    data: { callerId: req.userId, calleeId, mode, sourceLang, targetLang },
  });

  res.status(201).json({ session, roomId: session.id });
});

// POST /api/calls/:id/end
router.post("/:id/end", requireAuth, async (req, res) => {
  const session = await prisma.callSession.update({
    where: { id: req.params.id },
    data: { status: "ended", endedAt: new Date() },
  });
  res.json({ session });
});

// GET /api/calls/history
router.get("/history", requireAuth, async (req, res) => {
  const sessions = await prisma.callSession.findMany({
    where: { OR: [{ callerId: req.userId }, { calleeId: req.userId }] },
    orderBy: { startedAt: "desc" },
    take: 50,
  });
  res.json({ sessions });
});

module.exports = router;
