import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const SIGN_LANGS = ["ISL", "ASL", "BSL"];

// Free public STUN server — fine for most home/mobile networks.
// For strict corporate networks you'll eventually want a TURN server too.
const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

export default function Translate() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [searchParams] = useSearchParams();

  const peerId = searchParams.get("peer");
  const incomingRoomId = searchParams.get("room"); // present if we're accepting a call
  const isIncoming = Boolean(incomingRoomId);

  const [mode, setMode] = useState(searchParams.get("mode") || "sign-to-voice");
  const [sourceLang, setSourceLang] = useState(searchParams.get("sourceLang") || "ISL");
  const [targetLang, setTargetLang] = useState(searchParams.get("targetLang") || "ISL");
  const [inCall, setInCall] = useState(false);
  const [status, setStatus] = useState("Not connected");
  const [translatedText, setTranslatedText] = useState("");
  const [error, setError] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const roomIdRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    return () => endCall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If we arrived here by accepting an incoming call, join automatically.
  useEffect(() => {
    if (isIncoming && socket && !inCall) {
      joinExistingCall(incomingRoomId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIncoming, socket]);

  function attachSocketListeners(roomId) {
    socket.on("peer-joined", handlePeerJoined);
    socket.on("webrtc-offer", handleOffer);
    socket.on("webrtc-answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("translation-result", handleTranslation);
    socket.on("call-declined", handleDeclined);
    socket.on("peer-left", handlePeerLeft);
  }

  function detachSocketListeners() {
    if (!socket) return;
    socket.off("peer-joined", handlePeerJoined);
    socket.off("webrtc-offer", handleOffer);
    socket.off("webrtc-answer", handleAnswer);
    socket.off("ice-candidate", handleIceCandidate);
    socket.off("translation-result", handleTranslation);
    socket.off("call-declined", handleDeclined);
    socket.off("peer-left", handlePeerLeft);
  }

  async function setupMediaAndPeerConnection(roomId) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    setMicOn(true);
    setCameraOn(true);

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { roomId, candidate: event.candidate });
      }
    };
  }

  async function handlePeerJoined() {
    setStatus("Connecting...");
    const pc = pcRef.current;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("webrtc-offer", { roomId: roomIdRef.current, offer });
  }

  async function handleOffer({ offer }) {
    const pc = pcRef.current;
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("webrtc-answer", { roomId: roomIdRef.current, answer });
    setStatus("Connected");
  }

  async function handleAnswer({ answer }) {
    await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    setStatus("Connected");
  }

  async function handleIceCandidate({ candidate }) {
    try {
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("Error adding ICE candidate", err);
    }
  }

  function handleTranslation({ text }) {
    setTranslatedText(text);
  }

  function handleDeclined() {
    setStatus("Call declined");
    setError("The other person declined the call.");
    cleanupMedia();
    setInCall(false);
  }

  function handlePeerLeft() {
    setStatus("The other person left the call");
  }

  // Caller flow: create a new CallSession, then invite the callee
  async function startCall() {
    setError("");
    if (!peerId) {
      setError("No contact selected. Go to Contacts and click Call on someone.");
      return;
    }
    if (!socket) {
      setError("Still connecting, try again in a second.");
      return;
    }

    try {
      const sessionRes = await api.post("/calls", {
        calleeId: peerId,
        mode,
        sourceLang,
        targetLang,
      });
      const roomId = sessionRes.data.roomId;
      roomIdRef.current = roomId;

      await setupMediaAndPeerConnection(roomId);
      attachSocketListeners(roomId);

      socket.emit("join-room", { roomId, userId: user.id });
      setStatus("Waiting for the other person to join...");

      // Notify the callee wherever they are in the app
      socket.emit("call-invite", {
        roomId,
        toUserId: peerId,
        fromUser: { id: user.id, name: user.name },
        mode,
        sourceLang,
        targetLang,
      });

      setInCall(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Could not start the call.");
    }
  }

  // Callee flow: join the room the caller already created — never creates a new session
  async function joinExistingCall(roomId) {
    setError("");
    if (!socket) return;

    try {
      roomIdRef.current = roomId;
      await setupMediaAndPeerConnection(roomId);
      attachSocketListeners(roomId);

      socket.emit("join-room", { roomId, userId: user.id });
      setStatus("Connecting...");
      setInCall(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not join the call.");
    }
  }

  function toggleMic() {
    const stream = localStreamRef.current;
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;
    audioTrack.enabled = !audioTrack.enabled;
    setMicOn(audioTrack.enabled);
  }

  function toggleCamera() {
    const stream = localStreamRef.current;
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;
    videoTrack.enabled = !videoTrack.enabled;
    setCameraOn(videoTrack.enabled);
  }

  function cleanupMedia() {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    detachSocketListeners();
  }

  function endCall() {
    if (roomIdRef.current) {
      if (socket) socket.emit("leave-room", { roomId: roomIdRef.current });
      api.post(`/calls/${roomIdRef.current}/end`).catch(() => {});
    }
    cleanupMedia();
    setInCall(false);
    setStatus("Not connected");
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <p className="font-mono text-xs text-ink-soft uppercase tracking-wider mb-2">Live session</p>
        <div className="flex items-center gap-2 mb-6">
          <h1 className="font-display text-3xl">Translation</h1>
          <span
            className={`text-xs font-mono px-2 py-1 rounded-full ${
              status === "Connected"
                ? "bg-green-50 text-good"
                : status === "Call declined"
                ? "bg-red-50 text-bad"
                : "bg-cobalt-soft text-cobalt-deep"
            }`}
          >
            {status}
          </span>
        </div>

        {error && (
          <div className="mb-4 text-sm text-bad bg-red-50 px-3 py-2 rounded-md">{error}</div>
        )}

        <div className="card p-5 mb-6 flex flex-wrap gap-6 items-end">
          <div>
            <label className="field-label">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              disabled={inCall}
              className="field-input"
            >
              <option value="sign-to-sign">Sign → Sign</option>
              <option value="sign-to-voice">Sign → Voice</option>
              <option value="voice-to-sign">Voice → Sign</option>
            </select>
          </div>

          {mode === "sign-to-sign" ? (
            <>
              <div>
                <label className="field-label">From</label>
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  disabled={inCall}
                  className="field-input"
                >
                  {SIGN_LANGS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">To</label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  disabled={inCall}
                  className="field-input"
                >
                  {SIGN_LANGS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div>
              <label className="field-label">Sign language</label>
              <select
                value={mode === "sign-to-voice" ? sourceLang : targetLang}
                onChange={(e) =>
                  mode === "sign-to-voice"
                    ? setSourceLang(e.target.value)
                    : setTargetLang(e.target.value)
                }
                disabled={inCall}
                className="field-input"
              >
                {SIGN_LANGS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          )}

          <div className="ml-auto">
            {!inCall ? (
              <button onClick={startCall} disabled={isIncoming} className="btn-primary">
                Start call
              </button>
            ) : (
              <button
                onClick={endCall}
                className="rounded-md bg-bad text-white font-medium px-5 py-2.5 hover:bg-red-700 transition-colors"
              >
                End call
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-ink rounded-xl overflow-hidden aspect-video relative">
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            <span className="absolute bottom-2 left-2 text-xs bg-black/60 text-paper px-2 py-1 rounded font-mono">
              You
            </span>
            {inCall && (
              <div className="absolute bottom-2 right-2 flex gap-2">
                <button
                  onClick={toggleMic}
                  title={micOn ? "Mute microphone" : "Unmute microphone"}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm transition-colors ${
                    micOn ? "bg-white/15 hover:bg-white/25" : "bg-bad hover:bg-red-700"
                  }`}
                >
                  {micOn ? "🎤" : "🔇"}
                </button>
                <button
                  onClick={toggleCamera}
                  title={cameraOn ? "Turn camera off" : "Turn camera on"}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm transition-colors ${
                    cameraOn ? "bg-white/15 hover:bg-white/25" : "bg-bad hover:bg-red-700"
                  }`}
                >
                  {cameraOn ? "📹" : "🚫"}
                </button>
              </div>
            )}
          </div>
          <div className="bg-ink rounded-xl overflow-hidden aspect-video relative">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <span className="absolute bottom-2 left-2 text-xs bg-black/60 text-paper px-2 py-1 rounded font-mono">
              Contact
            </span>
          </div>
        </div>

        <div className="mt-6 card p-5">
          <h2 className="font-mono text-xs uppercase tracking-wider text-ink-soft mb-2">
            Translation output
          </h2>
          <p className="text-ink text-lg min-h-[2rem]">
            {translatedText || (
              <span className="text-ink-soft italic">
                Recognized text will appear here once the gesture-recognition model is connected.
              </span>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}
