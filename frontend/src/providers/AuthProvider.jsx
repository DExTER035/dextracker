import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchApi } from '../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check local storage for an existing user session
    const storedUser = localStorage.getItem('dextracker_user')
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        // Optionally fetch fresh user data from backend
        fetchApi(`/api/auth/user/${parsed.id}`)
          .then(({ user: freshUser }) => {
            setUser(freshUser)
            localStorage.setItem('dextracker_user', JSON.stringify(freshUser))
          })
          .catch(() => {
            // If the user doesn't exist on the backend anymore, clear session
            localStorage.removeItem('dextracker_user')
            setUser(null)
          })
          .finally(() => setLoading(false))
      } catch {
        localStorage.removeItem('dextracker_user')
        setUser(null)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (userData) => {
    const { user: newUser } = await fetchApi('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    setUser(newUser)
    localStorage.setItem('dextracker_user', JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('dextracker_user')
  }

  // For compatibility with old code, expose session
  const value = useMemo(
    () => ({ session: user ? { user } : null, user, loading, login, logout }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const v = useContext(AuthContext)
  if (!v) throw new Error('useAuth must be used within AuthProvider')
  return v
}

