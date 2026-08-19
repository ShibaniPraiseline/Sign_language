import { useEffect, useRef, useState } from "react";

const BAR_COUNT = 7;

// Renders animated bars driven by actual microphone input volume —
// grows/shrinks in real time as you speak, like a voice recorder UI.
export default function AudioLevelMeter({ active, onStream }) {
  const [levels, setLevels] = useState(Array(BAR_COUNT).fill(0.08));
  const [error, setError] = useState("");
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active) {
      cleanup();
      return;
    }
    start();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  async function start() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      if (onStream) onStream(stream);

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      loop();
    } catch (err) {
      console.error("Microphone access failed", err);
      setError("Could not access the microphone.");
    }
  }

  function loop() {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    const chunkSize = Math.floor(data.length / BAR_COUNT);
    const newLevels = Array.from({ length: BAR_COUNT }, (_, i) => {
      const slice = data.slice(i * chunkSize, (i + 1) * chunkSize);
      const avg = slice.reduce((a, b) => a + b, 0) / (slice.length || 1);
      return Math.max(0.08, avg / 255);
    });
    setLevels(newLevels);
    rafRef.current = requestAnimationFrame(loop);
  }

  function cleanup() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    rafRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
    streamRef.current = null;
    setLevels(Array(BAR_COUNT).fill(0.08));
  }

  if (error) {
    return <p className="text-sm text-bad">{error}</p>;
  }

  return (
    <div className="flex items-end justify-center gap-2 h-32">
      {levels.map((lvl, i) => (
        <div
          key={i}
          className="w-4 rounded-full bg-amber transition-all duration-75 ease-out"
          style={{ height: `${Math.max(8, lvl * 100)}%` }}
        />
      ))}
    </div>
  );
}
