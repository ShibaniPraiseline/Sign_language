import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <span className="text-xl font-bold text-slate-900">Sign⇄Voice</span>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            Sign up
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto text-center px-6 py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
          Breaking the barrier between sign and spoken language
        </h1>
        <p className="mt-6 text-lg text-slate-600">
          Real-time translation between Indian Sign Language, spoken language, and
          other sign languages — so conversations can happen naturally, without a
          human interpreter in the room.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            to="/signup"
            className="px-6 py-3 bg-teal-600 text-white rounded-md font-medium hover:bg-teal-700"
          >
            Get started
          </Link>
          <a
            href="#about"
            className="px-6 py-3 border border-slate-300 rounded-md font-medium text-slate-700 hover:bg-slate-100"
          >
            Learn more
          </a>
        </div>
      </main>

      <section id="about" className="max-w-4xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="text-2xl mb-2">🖐️</div>
          <h3 className="font-semibold text-slate-900 mb-1">Sign to Sign</h3>
          <p className="text-sm text-slate-600">
            Translate between ISL, ASL, BSL and more — sign language users can
            communicate across regions.
          </p>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-2">🔊</div>
          <h3 className="font-semibold text-slate-900 mb-1">Sign to Voice</h3>
          <p className="text-sm text-slate-600">
            A camera reads gestures and speaks them aloud in natural language,
            in real time.
          </p>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-2">🎙️</div>
          <h3 className="font-semibold text-slate-900 mb-1">Voice to Sign</h3>
          <p className="text-sm text-slate-600">
            Spoken words are converted into sign language, so the conversation
            flows both ways.
          </p>
        </div>
      </section>

      <footer className="text-center text-xs text-slate-400 py-8">
        Built to make everyday communication accessible.
      </footer>
    </div>
  );
}
