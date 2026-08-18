// WebRTC signaling via Socket.io.
// This server never touches audio/video itself — it just relays the
// handshake messages (offer/answer/ICE candidates) so two browsers can
// open a direct peer-to-peer connection with each other.

function registerSignaling(io) {
  io.on("connection", (socket) => {
    // Every logged-in user registers into a personal room keyed by their
    // userId as soon as they connect. This lets us notify them of an
    // incoming call no matter which page they're currently on.
    socket.on("register", ({ userId }) => {
      socket.data.userId = userId;
      socket.join(`user:${userId}`);
    });

    // Caller sends this right after creating the CallSession. It's relayed
    // to the callee's personal room so they get notified wherever they are.
    socket.on("call-invite", ({ roomId, toUserId, fromUser, mode, sourceLang, targetLang }) => {
      io.to(`user:${toUserId}`).emit("incoming-call", {
        roomId,
        fromUser,
        mode,
        sourceLang,
        targetLang,
      });
    });

    // Callee declined — let the caller know so their UI doesn't hang on
    // "Waiting for the other person to join" forever.
    socket.on("call-declined", ({ roomId, toUserId }) => {
      io.to(`user:${toUserId}`).emit("call-declined", { roomId });
    });

    // Join a call room identified by the CallSession id (roomId)
    socket.on("join-room", ({ roomId, userId }) => {
      socket.join(roomId);
      socket.data.userId = userId;
      // Tell the other participant someone joined, so they can start the offer
      socket.to(roomId).emit("peer-joined", { userId });
    });

    // Relay a WebRTC offer to the other peer in the room
    socket.on("webrtc-offer", ({ roomId, offer }) => {
      socket.to(roomId).emit("webrtc-offer", { offer, from: socket.data.userId });
    });

    // Relay a WebRTC answer back to the offerer
    socket.on("webrtc-answer", ({ roomId, answer }) => {
      socket.to(roomId).emit("webrtc-answer", { answer, from: socket.data.userId });
    });

    // Relay ICE candidates as they're discovered
    socket.on("ice-candidate", ({ roomId, candidate }) => {
      socket.to(roomId).emit("ice-candidate", { candidate, from: socket.data.userId });
    });

    // Live translation events: recognized sign/text pushed from the AI
    // pipeline on one side, broadcast to the other participant's UI
    socket.on("translation-result", ({ roomId, text, mode }) => {
      socket.to(roomId).emit("translation-result", { text, mode });
    });

    socket.on("leave-room", ({ roomId }) => {
      socket.to(roomId).emit("peer-left", { userId: socket.data.userId });
      socket.leave(roomId);
    });

    socket.on("disconnecting", () => {
      for (const roomId of socket.rooms) {
        socket.to(roomId).emit("peer-left", { userId: socket.data.userId });
      }
    });
  });
}

module.exports = { registerSignaling };
