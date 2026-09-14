import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please fill in both email and password.')
      return
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate('/profile')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16 p-8 bg-white dark:bg-earth-100 rounded-xl shadow-md border border-earth-300 dark:border-earth-200">
      <h1 className="text-2xl font-semibold text-earth-800 mb-6">Login</h1>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-earth-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fire-500"
        />
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-earth-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fire-500"
        />
        <label className="flex items-center gap-2 text-sm text-earth-700">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            className="accent-fire-600"
          />
          Show password
        </label>
        {error && (
          <p role="alert" className="bg-red-50 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm rounded-md px-3 py-2">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="bg-fire-600 hover:bg-fire-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-md py-2 font-medium"
        >
          {submitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="text-sm text-earth-700 mt-4">
        No account?{' '}
        <Link to="/register" className="text-fire-600 font-medium">
          Register
        </Link>
      </p>
    </div>
  )
}
