import { Link } from 'react-router-dom'

export default function App() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="max-w-2xl text-center p-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Welcome to...
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          the best pong game you ever saw!
        </p>

        <div className="mt-8">
          <Link
            to="/login"
            className="inline-flex items-center rounded-xl border border-transparent px-6 py-3 text-base font-semibold shadow-sm bg-slate-900 text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Let's play!
          </Link>
        </div>
      </div>
    </main>
  )
}

