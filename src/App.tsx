import { useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import './App.css'
import { login } from './api/routes'
import { AuthProvider } from './context/AuthContext.tsx'
import { useAuth } from './context/useAuth.ts'
import Dashboard from './pages/dashboard/Dashboard.tsx'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  if (!token) {
    return <Navigate to="/" replace />
  }
  return children
}

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setToken } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await login({ email, password })
      setToken(data.token)
      navigate('/dashboard')
    } catch {
      setError('Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <form style={styles.form} onSubmit={handleSubmit}>
          <h1 style={styles.logo}>Brizen</h1>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    backgroundColor: '#fafafa',
  } as const,
  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '2.5rem',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  } as const,
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  } as const,
  logo: {
    fontSize: '1.75rem',
    fontWeight: '600',
    color: '#09090b',
    textAlign: 'center' as const,
    marginBottom: '0.5rem',
  } as const,
  heading: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#09090b',
    textAlign: 'center' as const,
    marginBottom: '0.5rem',
  } as const,
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  } as const,
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#09090b',
  } as const,
  input: {
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    border: '1px solid #e4e4e7',
    borderRadius: '0.375rem',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    color: '#09090b',
    outline: 'none',
    transition: 'border-color 0.15s ease-in-out',
  } as const,
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as const,
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  } as const,
  checkbox: {
    width: '1rem',
    height: '1rem',
    cursor: 'pointer',
  } as const,
  checkboxText: {
    fontSize: '0.875rem',
    color: '#09090b',
  } as const,
  link: {
    fontSize: '0.875rem',
    color: '#71717a',
    textDecoration: 'underline',
    textDecorationColor: 'rgba(113, 113, 122, 0.5)',
    cursor: 'pointer',
    transition: 'textDecorationColor 0.15s ease-in-out',
  } as const,
  button: {
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#18181b',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    transition: 'backgroundColor 0.15s ease-in-out',
  } as const,
  buttonDisabled: {
    backgroundColor: '#71717a',
    cursor: 'not-allowed',
  } as const,
  signupText: {
    fontSize: '0.875rem',
    color: '#71717a',
    textAlign: 'center' as const,
  } as const,
  error: {
    padding: '0.75rem',
    fontSize: '0.875rem',
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    borderRadius: '0.375rem',
  } as const,
}

export default App
