import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-6">
        <span className="font-semibold text-gray-900">Inventory App</span>
        {user && (
          <>
            <Link to="/inventory" className="text-sm text-gray-600 hover:text-gray-900">
              Inventory
            </Link>
            <Link to="/profile" className="text-sm text-gray-600 hover:text-gray-900">
              Profile
            </Link>
          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-500">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}