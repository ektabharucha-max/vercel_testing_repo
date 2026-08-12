import { useAuth } from '../context/AuthContext'

export function Profile() {
  const { user } = useAuth()

  if (!user) return null

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? '—'

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-gray-900">My profile</h1>
      <dl className="flex flex-col gap-4 rounded-md border border-gray-200 p-6">
        <Row label="Full name" value={fullName} />
        <Row label="Email" value={user.email ?? '—'} />
        <Row label="User ID" value={user.id} />
        <Row
          label="Joined"
          value={user.created_at ? new Date(user.created_at).toLocaleString() : '—'}
        />
        <Row
          label="Last sign in"
          value={user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : '—'}
        />
      </dl>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="break-all text-sm text-gray-900">{value}</dd>
    </div>
  )
}