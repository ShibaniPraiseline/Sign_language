const express = require("express");
const { z } = require("zod");
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(6).max(20).optional().or(z.literal("")),
  bio: z.string().max(280).optional().or(z.literal("")),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  preferredLang: z.enum(["ISL", "ASL", "BSL"]).optional(),
});

function publicUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

// GET /api/profile — current user's own profile
router.get("/", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: publicUser(user) });
});

// PATCH /api/profile — update phone number, name, bio, avatar, preferred sign language
router.patch("/", requireAuth, async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: parsed.data,
  });

  res.json({ user: publicUser(user) });
});

// GET /api/profile/:id — view another user's public profile (e.g. a contact)
router.get("/:id", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: "User not found" });
  const { phone, ...limited } = publicUser(user); // hide phone from non-owners
  res.json({ user: limited });
});

module.exports = router;
