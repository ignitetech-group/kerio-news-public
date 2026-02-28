import { auth, signIn } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = { title: 'Sign In - Kerio News Admin' }

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string; error?: string }> }) {
  const session = await auth()
  const params = await searchParams

  if (session) {
    redirect(params.callbackUrl || '/admin')
  }

  const hasError = params.error === 'AccessDenied' || params.error === 'Callback'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f7fb', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#fff', padding: 40, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, marginBottom: 8, color: '#121457' }}>Kerio News Admin</h1>
        <p style={{ color: '#666', marginBottom: 24 }}>Sign in to manage content and redirects</p>

        {hasError && (
          <div style={{ background: '#fef2f2', color: '#991b1b', padding: 12, borderRadius: 4, marginBottom: 16, fontSize: 14 }}>
            Access denied. Your email is not authorized to access the admin panel.
          </div>
        )}

        <form action={async () => {
          "use server"
          await signIn("google", { redirectTo: params.callbackUrl || "/admin" })
        }}>
          <button
            type="submit"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '12px 16px', fontSize: 15, fontWeight: 500,
              background: '#fff', border: '1px solid #ddd', borderRadius: 4,
              cursor: 'pointer', color: '#333',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  )
}
