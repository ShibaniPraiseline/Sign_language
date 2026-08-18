import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { API_BASE } from "../lib/api";

const SOCKET_URL = API_BASE.replace("/api", "");

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    if (!user) {
      if (socket) socket.disconnect();
      setSocket(null);
      return;
    }

    const s = io(SOCKET_URL);

    s.on("connect", () => {
      // Registers this browser tab under the user's personal room so
      // incoming-call invites can reach them from anywhere in the app.
      s.emit("register", { userId: user.id });
    });

    s.on("incoming-call", (data) => {
      setIncomingCall(data);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  function clearIncomingCall() {
    setIncomingCall(null);
  }

  return (
    <SocketContext.Provider value={{ socket, incomingCall, clearIncomingCall }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside SocketProvider");
  return ctx;
}
