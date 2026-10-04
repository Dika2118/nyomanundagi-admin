import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Code2,
  Sparkles,
  UserCheck,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('admin@nyomanundagi.com')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  // Dev preset credentials
  const devAccounts = [
    {
      label: 'Admin (Default)',
      email: 'admin@nyomanundagi.com',
      password: 'password',
    },
    {
      label: 'Test User',
      email: 'test@example.com',
      password: 'password',
    },
    {
      label: 'Admin Example',
      email: 'admin@example.com',
      password: 'password',
    },
  ]

  const handleQuickFill = (acc, autoSubmit = false) => {
    setEmail(acc.email)
    setPassword(acc.password)
    setError('')

    if (autoSubmit) {
      setTimeout(() => {
        executeLogin(acc.email, acc.password)
      }, 100)
    }
  }

  const executeLogin = async (userEmail, userPass) => {
    setError('')
    setLoading(true)

    try {
      await login(userEmail, userPass)
      navigate('/', { replace: true })
    } catch (err) {
      console.error('Login error', err)
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Email atau kata sandi tidak valid. Pastikan server nyomanundagi-api sedang berjalan.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await executeLogin(email, password)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Nyoman Undagi</h1>
          <p className="text-xs text-muted-foreground">Admin Portal & Content Management System</p>
        </div>

        {/* DEVTOOLS HELPER BAR */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Code2 className="h-4 w-4" />
              <span>DevTools: Quick Login Helper</span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 py-0">
              DEV MODE
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2">
            Klik akun di bawah untuk mengisi otomatis & masuk tanpa perlu mengetik:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {devAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleQuickFill(acc)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-background/80 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer shadow-2xs"
              >
                <Zap className="h-3 w-3 text-amber-500" />
                <span>{acc.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-border/80 shadow-lg">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl font-bold">Masuk ke Akun</CardTitle>
              <CardDescription>
                Masukkan email dan kata sandi Anda untuk mengakses dashboard
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@nyomanundagi.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Kata Sandi</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 pt-2">
              <Button type="submit" className="w-full gap-2 cursor-pointer" disabled={loading}>
                {loading ? (
                  'Memproses...'
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Nyoman Undagi Studio. All rights reserved.
        </p>
      </div>
    </div>
  )
}
