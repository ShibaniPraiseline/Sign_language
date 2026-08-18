import { Link } from "react-router-dom";
import BridgeMotif from "../components/BridgeMotif";

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper overflow-x-hidden">
      <header className="flex items-center justify-between px-6 py-6 max-w-5xl mx-auto">
        <span className="font-display text-xl tracking-tight">
          Sign<span className="text-amber">⇄</span>Voice
        </span>
        <div className="flex gap-3">
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-ink-soft hover:text-ink transition-colors">
            Log in
          </Link>
          <Link to="/signup" className="btn-primary text-sm">
            Sign up
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto text-center px-6 pt-16 pb-8">
        <p className="uppercase tracking-[0.2em] text-xs text-cobalt-deep font-medium mb-5">
          Real-time translation, both directions
        </p>
        <h1 className="font-display text-5xl md:text-6xl leading-[1.05] text-ink">
          Where a sign
          <br />
          becomes a <span className="italic text-cobalt">word</span>.
        </h1>
        <p className="mt-6 text-lg text-ink-soft max-w-xl mx-auto">
          A camera reads Indian Sign Language and speaks it aloud. A voice becomes
          signs on screen. One conversation, two channels, no interpreter required.
        </p>
      </main>

      <div className="max-w-2xl mx-auto px-6">
        <BridgeMotif className="w-full h-auto" />
      </div>

      <div className="flex justify-center gap-4 mt-4 mb-24">
        <Link to="/signup" className="btn-primary">
          Get started — it's free
        </Link>
        <a href="#how" className="btn-secondary">
          How it works
        </a>
      </div>

      <section id="how" className="border-t border-line">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <p className="font-mono text-xs text-ink-soft uppercase tracking-wider mb-2 text-center">
            The process
          </p>
          <h2 className="font-display text-3xl text-center mb-14">Three steps, one conversation</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <span className="font-display text-3xl text-cobalt">01</span>
              <h3 className="font-display text-lg mt-3 mb-2">Sign, on camera</h3>
              <p className="text-sm text-ink-soft leading-relaxed">
                Open a call and sign naturally. Your camera captures hand shape,
                position, and motion — no special hardware required.
              </p>
            </div>
            <div>
              <span className="font-display text-3xl text-cobalt">02</span>
              <h3 className="font-display text-lg mt-3 mb-2">Recognized, in real time</h3>
              <p className="text-sm text-ink-soft leading-relaxed">
                The system reads each gesture as it happens and assembles it into
                a sentence, the same way you'd expect a live captioner to work.
              </p>
            </div>
            <div>
              <span className="font-display text-3xl text-cobalt">03</span>
              <h3 className="font-display text-lg mt-3 mb-2">Heard, or seen</h3>
              <p className="text-sm text-ink-soft leading-relaxed">
                The sentence is spoken aloud for a hearing listener — or, in
                reverse, spoken words appear back as sign for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-ink text-paper">
        <div className="max-w-4xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-px bg-white/10">
          <div className="bg-ink p-8 text-left">
            <span className="font-mono text-xs text-cobalt-soft">Sign → Sign</span>
            <h3 className="font-display text-xl mt-2 mb-2">Across sign languages</h3>
            <p className="text-sm text-paper/70 leading-relaxed">
              Translate live between ISL, ASL, and BSL, so signers from different
              regions can understand each other directly.
            </p>
          </div>
          <div className="bg-ink p-8 text-left">
            <span className="font-mono text-xs text-amber">Sign → Voice</span>
            <h3 className="font-display text-xl mt-2 mb-2">Gestures, spoken aloud</h3>
            <p className="text-sm text-paper/70 leading-relaxed">
              A camera reads hand shapes and motion in real time and speaks the
              recognized words back naturally.
            </p>
          </div>
          <div className="bg-ink p-8 text-left">
            <span className="font-mono text-xs text-cobalt-soft">Voice → Sign</span>
            <h3 className="font-display text-xl mt-2 mb-2">Speech, made visible</h3>
            <p className="text-sm text-paper/70 leading-relaxed">
              Spoken words appear as sign language, so a hearing person's side of
              the conversation comes through too.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-3xl mb-4">Built for everyday conversation</h2>
        <p className="text-ink-soft leading-relaxed">
          Not a lecture-hall interpreting service — a video call you'd actually
          use with a friend, a shopkeeper, a doctor, or a colleague. Add contacts,
          call directly, and let the translation happen while you talk.
        </p>
        <Link to="/signup" className="btn-primary inline-block mt-8">
          Create your account
        </Link>
      </section>

      <footer className="text-center text-xs text-ink-soft py-10 border-t border-line">
        Built to make everyday conversation accessible.
      </footer>
    </div>
  );
}
