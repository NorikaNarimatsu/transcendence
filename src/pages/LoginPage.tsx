import { Link } from 'react-router-dom'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-semibold">Login</h1>

        <form className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:ring-slate-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:ring-slate-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl px-4 py-2 font-semibold bg-slate-900 text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link to="/" className="font-medium underline hover:no-underline">← Back to landing</Link>
        </p>
      </div>
    </main>
  )
}
