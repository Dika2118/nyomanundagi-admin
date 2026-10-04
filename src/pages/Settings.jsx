import { useState } from 'react'
import { User, KeyRound, Save, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/context/AuthContext'
import api from '@/api/axios'

export default function Settings() {
  const { user, updateUser } = useAuth()

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const getInitials = (name) => {
    if (!name) return 'AD'
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileSuccess('')
    setProfileError('')

    try {
      const response = await api.put(`/users/${user?.id}`, profileData)
      updateUser(response.data?.data || response.data || profileData)
      setProfileSuccess('Profil berhasil diperbarui!')
    } catch (err) {
      setProfileError(
        err.response?.data?.message || 'Gagal memperbarui profil. Silakan coba lagi.'
      )
    } finally {
      setProfileLoading(false)
    }
  }

  // Handle Password Update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordSuccess('')
    setPasswordError('')

    if (passwordData.password !== passwordData.password_confirmation) {
      setPasswordError('Konfirmasi kata sandi baru tidak cocok!')
      setPasswordLoading(false)
      return
    }

    try {
      await api.put(`/users/${user?.id}`, {
        current_password: passwordData.current_password,
        password: passwordData.password,
        password_confirmation: passwordData.password_confirmation,
      })
      setPasswordSuccess('Kata sandi berhasil diubah!')
      setPasswordData({
        current_password: '',
        password: '',
        password_confirmation: '',
      })
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || 'Gagal mengubah kata sandi. Periksa kata sandi saat ini.'
      )
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan Akun</h1>
        <p className="text-sm text-muted-foreground">
          Kelola profil pengguna dan keamanan akun Anda dalam satu tempat.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>My Profile</span>
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            <span>Change Password</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: MY PROFILE */}
        <TabsContent value="profile">
          <Card>
            <form onSubmit={handleProfileSubmit}>
              <CardHeader>
                <CardTitle>Informasi Profil</CardTitle>
                <CardDescription>
                  Perbarui informasi pribadi dan alamat email akun admin Anda.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {profileSuccess && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>{profileSuccess}</span>
                  </div>
                )}
                {profileError && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                {/* Avatar Preview */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-border">
                    <AvatarImage src={user?.avatar_url || ''} />
                    <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-semibold">{user?.name || 'Administrator'}</h3>
                    <p className="text-xs text-muted-foreground">{user?.email || 'admin@nyomanundagi.com'}</p>
                    <span className="inline-block mt-1 text-[11px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {user?.role || 'Administrator'}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Alamat Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      placeholder="admin@example.com"
                      required
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end border-t border-border/50 pt-4">
                <Button type="submit" disabled={profileLoading} className="gap-2">
                  <Save className="h-4 w-4" />
                  {profileLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* TAB 2: CHANGE PASSWORD */}
        <TabsContent value="password">
          <Card>
            <form onSubmit={handlePasswordSubmit}>
              <CardHeader>
                <CardTitle>Ganti Kata Sandi</CardTitle>
                <CardDescription>
                  Pastikan kata sandi baru Anda aman dan memiliki minimal 8 karakter.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 max-w-lg">
                {passwordSuccess && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}
                {passwordError && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="current_password">Kata Sandi Saat Ini</Label>
                  <Input
                    id="current_password"
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, current_password: e.target.value })
                    }
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Kata Sandi Baru</Label>
                  <Input
                    id="password"
                    type="password"
                    value={passwordData.password}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, password: e.target.value })
                    }
                    placeholder="Minimal 8 karakter"
                    required
                    minLength={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">Konfirmasi Kata Sandi Baru</Label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    value={passwordData.password_confirmation}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        password_confirmation: e.target.value,
                      })
                    }
                    placeholder="Ulangi kata sandi baru"
                    required
                    minLength={8}
                  />
                </div>
              </CardContent>

              <CardFooter className="flex justify-end border-t border-border/50 pt-4">
                <Button type="submit" disabled={passwordLoading} className="gap-2">
                  <KeyRound className="h-4 w-4" />
                  {passwordLoading ? 'Memproses...' : 'Ubah Kata Sandi'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
