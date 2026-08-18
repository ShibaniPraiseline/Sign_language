require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const contactsRoutes = require("./routes/contacts");
const callsRoutes = require("./routes/calls");
const { registerSignaling } = require("./socket/signaling");

const app = express();
const server = http.createServer(app);

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",");

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/calls", callsRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const io = new Server(server, {
  cors: { origin: allowedOrigins },
});
registerSignaling(io);

const PORT = process.env.PORT || 4000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`API + signaling server listening on port ${PORT}`);
});