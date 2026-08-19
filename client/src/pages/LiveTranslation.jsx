import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import AudioLevelMeter from "../components/AudioLevelMeter";

const SIGN_LANGS = ["ISL", "ASL", "BSL"];

const MODES = [
  {
    id: "sign-to-sign",
    icon: "🤟",
    title: "Sign → Sign",
    desc: "Translate live between two sign languages (e.g. ISL to ASL).",
  },
  {
    id: "sign-to-voice",
    icon: "🔊",
    title: "Sign → Voice",
    desc: "Camera reads your signs and speaks them aloud.",
  },
  {
    id: "voice-to-sign",
    icon: "🎙️",
    title: "Voice → Sign",
    desc: "Speak, and see it rendered back as sign language.",
  },
];

export default function LiveTranslation() {
  const [step, setStep] = useState(1); // 1 = mode, 2 = language, 3 = active session
  const [mode, setMode] = useState(null);
  const [sourceLang, setSourceLang] = useState("ISL");
  const [targetLang, setTargetLang] = useState("ISL");

  const [sessionActive, setSessionActive] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [captionSize, setCaptionSize] = useState("md");
  const [testInput, setTestInput] = useState("");
  const [speakAloud, setSpeakAloud] = useState(true);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const needsCamera = mode === "sign-to-sign" || mode === "sign-to-voice";
  const needsMic = mode === "voice-to-sign";

  useEffect(() => {
    return () => stopSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pickMode(id) {
    setMode(id);
    setStep(2);
  }

  async function startSession() {
    setTranscript([]);
    if (needsCamera) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30, min: 24 } },
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error(err);
        return;
      }
    }
    setSessionActive(true);
    setStep(3);
  }

  function stopSession() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setSessionActive(false);
  }

  function backToStart() {
    stopSession();
    setStep(1);
    setMode(null);
    setTranscript([]);
  }

  // Manual "simulate recognized output" input — lets you test/demo the full
  // pipeline (transcript, captions, speech) before the real gesture/speech
  // recognition model is wired in to replace this.
  function pushTestOutput(e) {
    e.preventDefault();
    if (!testInput.trim()) return;
    const entry = { text: testInput.trim(), time: new Date() };
    setTranscript((prev) => [...prev, entry]);
    if (mode === "sign-to-voice" && speakAloud && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(entry.text);
      window.speechSynthesis.speak(utterance);
    }
    setTestInput("");
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <p className="font-mono text-xs text-ink-soft uppercase tracking-wider mb-2">Live Translation</p>

        {step === 1 && (
          <>
            <h1 className="font-display text-3xl mb-8">What do you want to translate?</h1>
            <div className="grid sm:grid-cols-3 gap-4">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => pickMode(m.id)}
                  className="card p-6 text-left hover:border-cobalt transition-colors"
                >
                  <div className="text-2xl mb-3">{m.icon}</div>
                  <h2 className="font-display text-lg mb-1">{m.title}</h2>
                  <p className="text-sm text-ink-soft leading-relaxed">{m.desc}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <button onClick={() => setStep(1)} className="text-sm text-ink-soft hover:text-ink mb-4">
              ← Back
            </button>
            <h1 className="font-display text-3xl mb-8">
              {MODES.find((m) => m.id === mode)?.title}
            </h1>

            <div className="card p-6 space-y-5">
              {mode === "sign-to-sign" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="field-label">From</label>
                    <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="field-input">
                      {SIGN_LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">To</label>
                    <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="field-input">
                      {SIGN_LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {mode === "sign-to-voice" && (
                <div>
                  <label className="field-label">Sign language you'll use</label>
                  <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="field-input">
                    {SIGN_LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              )}

              {mode === "voice-to-sign" && (
                <div>
                  <label className="field-label">Sign language to translate into</label>
                  <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="field-input">
                    {SIGN_LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              )}

              <button onClick={startSession} className="btn-primary w-full">
                {needsCamera ? "Turn on camera & start" : "Turn on microphone & start"}
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-display text-3xl">
                {MODES.find((m) => m.id === mode)?.title}
              </h1>
              <button onClick={backToStart} className="btn-secondary text-sm py-1.5 px-3">
                End session
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* Input panel */}
              <div className="card p-4">
                <p className="font-mono text-xs text-ink-soft uppercase tracking-wider mb-3">
                  Input {needsCamera ? `— ${sourceLang}` : ""}
                </p>
                {needsCamera ? (
                  <div className="bg-ink rounded-lg overflow-hidden aspect-video">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="bg-ink rounded-lg aspect-video flex items-center justify-center">
                    <AudioLevelMeter active={sessionActive} />
                  </div>
                )}
              </div>

              {/* Output panel */}
              <div className="card p-4">
                <p className="font-mono text-xs text-ink-soft uppercase tracking-wider mb-3">
                  Output {mode === "sign-to-sign" ? `— ${targetLang}` : mode === "voice-to-sign" ? `— ${targetLang}` : "— Voice"}
                </p>
                {mode === "sign-to-sign" || mode === "voice-to-sign" ? (
                  <div className="bg-cobalt-soft rounded-lg aspect-video flex flex-col items-center justify-center text-center px-4">
                    <span className="text-3xl mb-2">🤟</span>
                    <p className="text-sm text-cobalt-deep">
                      Sign-language avatar output will render here once the model is connected.
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-soft rounded-lg aspect-video flex flex-col items-center justify-center text-center px-4">
                    <span className="text-3xl mb-2">🔊</span>
                    <p className="text-sm text-amber-deep">
                      Recognized signs are spoken aloud automatically.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Transcript */}
            <div className="card p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-mono text-xs uppercase tracking-wider text-ink-soft">Transcript</h2>
                <div className="flex items-center gap-1">
                  {["sm", "md", "lg"].map((size) => (
                    <button
                      key={size}
                      onClick={() => setCaptionSize(size)}
                      className={`w-7 h-7 rounded-md text-xs font-medium border transition-colors ${
                        captionSize === size
                          ? "bg-cobalt text-white border-cobalt"
                          : "border-line text-ink-soft hover:bg-cobalt-soft"
                      }`}
                    >
                      A
                    </button>
                  ))}
                </div>
              </div>
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {transcript.length === 0 ? (
                  <p className="text-ink-soft italic">Nothing recognized yet.</p>
                ) : (
                  transcript.map((entry, i) => (
                    <p
                      key={i}
                      className={captionSize === "sm" ? "text-base" : captionSize === "lg" ? "text-2xl" : "text-lg"}
                    >
                      <span className="font-mono text-xs text-ink-soft mr-2">
                        {entry.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                      {entry.text}
                    </p>
                  ))
                )}
              </div>
            </div>

            {/* Dev/demo helper — stands in for the AI model until it's connected */}
            <div className="card p-4 border-dashed">
              <p className="font-mono text-xs text-ink-soft uppercase tracking-wider mb-2">
                Test the pipeline (temporary, until the model is connected)
              </p>
              <form onSubmit={pushTestOutput} className="flex gap-2">
                <input
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Type recognized text to preview the flow..."
                  className="field-input flex-1"
                />
                <button className="btn-secondary text-sm">Add</button>
              </form>
              {mode === "sign-to-voice" && (
                <label className="flex items-center gap-2 text-xs text-ink-soft mt-3">
                  <input
                    type="checkbox"
                    checked={speakAloud}
                    onChange={(e) => setSpeakAloud(e.target.checked)}
                  />
                  Speak new lines aloud
                </label>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
