const express = require("express");
const { z } = require("zod");
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function publicUser(user) {
  const { passwordHash, phone, ...safe } = user;
  return safe;
}

// GET /api/contacts/search?q=name-or-email
router.get("/search", requireAuth, async (req, res) => {
  const q = (req.query.q || "").toString().trim();
  if (!q) return res.json({ users: [] });

  const users = await prisma.user.findMany({
    where: {
      id: { not: req.userId },
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 20,
  });

  res.json({ users: users.map(publicUser) });
});

// POST /api/contacts/request  { toUserId }
router.post("/request", requireAuth, async (req, res) => {
  const schema = z.object({ toUserId: z.string().uuid() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "toUserId required" });

  const { toUserId } = parsed.data;
  if (toUserId === req.userId) {
    return res.status(400).json({ error: "Cannot add yourself" });
  }

  const request = await prisma.contactRequest.upsert({
    where: { fromUserId_toUserId: { fromUserId: req.userId, toUserId } },
    update: {},
    create: { fromUserId: req.userId, toUserId },
  });

  res.status(201).json({ request });
});

// GET /api/contacts/requests — incoming pending requests
router.get("/requests", requireAuth, async (req, res) => {
  const requests = await prisma.contactRequest.findMany({
    where: { toUserId: req.userId, status: "pending" },
    include: { fromUser: true },
  });
  res.json({
    requests: requests.map((r) => ({ id: r.id, from: publicUser(r.fromUser), createdAt: r.createdAt })),
  });
});

// POST /api/contacts/requests/:id/respond  { accept: boolean }
router.post("/requests/:id/respond", requireAuth, async (req, res) => {
  const { accept } = req.body;
  const request = await prisma.contactRequest.findUnique({ where: { id: req.params.id } });

  if (!request || request.toUserId !== req.userId) {
    return res.status(404).json({ error: "Request not found" });
  }

  if (accept) {
    await prisma.$transaction([
      prisma.contactRequest.update({ where: { id: request.id }, data: { status: "accepted" } }),
      prisma.contact.create({
        data: { userAId: request.fromUserId, userBId: request.toUserId },
      }),
    ]);
  } else {
    await prisma.contactRequest.update({ where: { id: request.id }, data: { status: "declined" } });
  }

  res.json({ ok: true });
});

// GET /api/contacts — accepted friends list
router.get("/", requireAuth, async (req, res) => {
  const contacts = await prisma.contact.findMany({
    where: { OR: [{ userAId: req.userId }, { userBId: req.userId }] },
    include: { userA: true, userB: true },
  });

  const friends = contacts.map((c) => (c.userAId === req.userId ? c.userB : c.userA));
  res.json({ friends: friends.map(publicUser) });
});

module.exports = router;
