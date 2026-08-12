import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Register() {
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)
    const { error } = await signUp(email, password, fullName)
    setSubmitting(false)

    if (error) {
      setError(error)
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-sm flex-col gap-4 px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Check your email</h1>
        <p className="text-sm text-gray-600">
          We sent a confirmation link to <strong>{email}</strong>. Confirm your address, then{' '}
          <Link to="/login" className="font-medium text-gray-900 underline">
            log in
          </Link>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-gray-900">Create an account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Full name
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Confirm password
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {submitting ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
      <p className="text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-gray-900 underline">
          Log in
        </Link>
      </p>
    </div>
  )
}