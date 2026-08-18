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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
        <div className="text-3xl mb-2">📞</div>
        <h2 className="text-lg font-semibold text-slate-900">
          {fromUser.name} is calling
        </h2>
        <p className="text-sm text-slate-500 mt-1">Mode: {mode}</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={decline}
            className="flex-1 py-2 border border-slate-300 rounded-md font-medium hover:bg-slate-100"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="flex-1 py-2 bg-teal-600 text-white rounded-md font-medium hover:bg-teal-700"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
