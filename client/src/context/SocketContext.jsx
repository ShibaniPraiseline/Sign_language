import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { API_BASE } from "../lib/api";

const SOCKET_URL = API_BASE.replace("/api", "");

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const alertIntervalRef = useRef(null);
  const originalTitleRef = useRef(document.title);
  const originalFaviconRef = useRef(null);

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

  // Deaf/HoH users can't rely on a ringtone. While a call is incoming, we
  // flash the tab title + favicon, flash the screen briefly, and vibrate
  // on supported mobile devices — visual/physical signals instead of sound.
  useEffect(() => {
    if (!incomingCall) {
      stopAlerts();
      return;
    }

    startAlerts();
    return () => stopAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingCall]);

  function startAlerts() {
    originalTitleRef.current = document.title;
    const favicon = document.querySelector("link[rel~='icon']");
    if (favicon) originalFaviconRef.current = favicon.href;

    let flashOn = false;
    alertIntervalRef.current = setInterval(() => {
      flashOn = !flashOn;
      document.title = flashOn ? "📞 Incoming call…" : originalTitleRef.current;
      setFavicon(flashOn ? "🔴" : null);
    }, 800);

    // A few short buzzes on devices that support vibration (most phones)
    if (navigator.vibrate) {
      navigator.vibrate([300, 150, 300, 150, 300]);
    }

    // Brief full-screen flash so it's noticeable even peripherally
    document.body.classList.add("incoming-call-flash");
    setTimeout(() => document.body.classList.remove("incoming-call-flash"), 1500);
  }

  function stopAlerts() {
    if (alertIntervalRef.current) {
      clearInterval(alertIntervalRef.current);
      alertIntervalRef.current = null;
    }
    document.title = originalTitleRef.current;
    setFavicon(null);
    document.body.classList.remove("incoming-call-flash");
  }

  function setFavicon(emoji) {
    let favicon = document.querySelector("link[rel~='icon']");
    if (!favicon) return;
    if (!emoji) {
      if (originalFaviconRef.current) favicon.href = originalFaviconRef.current;
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.font = "56px serif";
    ctx.fillText(emoji, 2, 52);
    favicon.href = canvas.toDataURL("image/png");
  }

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
