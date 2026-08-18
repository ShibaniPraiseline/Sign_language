import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";

export default function IncomingCallModal() {
  const { socket, incomingCall, clearIncomingCall } = useSocket();
  const navigate = useNavigate();

  if (!incomingCall) return null;

  const { roomId, fromUser, mode, sourceLang, targetLang } = incomingCall;

  function accept() {
    clearIncomingCall();
    navigate(
      `/translate?peer=${fromUser.id}&room=${roomId}&mode=${mode}&sourceLang=${sourceLang}&targetLang=${targetLang}`
    );
  }

  function decline() {
    socket.emit("call-declined", { roomId, toUserId: fromUser.id });
    clearIncomingCall();
  }

  return (
    <div className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50 px-6">
      <div className="card p-7 w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-full bg-cobalt-soft text-cobalt flex items-center justify-center text-2xl mx-auto mb-4 animate-pulse">
          📞
        </div>
        <h2 className="font-display text-xl">{fromUser.name} is calling</h2>
        <p className="text-sm text-ink-soft font-mono mt-1">{mode}</p>
        <div className="mt-6 flex gap-3">
          <button onClick={decline} className="btn-secondary flex-1">
            Decline
          </button>
          <button onClick={accept} className="btn-primary flex-1">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
