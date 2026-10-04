import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  UserCog,
  Edit2,
  Trash2,
  ShieldCheck,
  Mail,
  Loader2,
  AlertCircle,
  Filter,
  Calendar,
  MoreVertical,
  Eye,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import api from '@/api/axios'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState('')

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [activeUser, setActiveUser] = useState(null)

  // Form states
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formRole, setFormRole] = useState('admin')
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Fetch users from backend with search & role parameters
  const fetchUsers = async (searchQuery = '', roleFilter = '') => {
    try {
      setLoading(true)
      const params = {}
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }
      if (roleFilter) {
        params.role = roleFilter
      }
      const res = await api.get('/users', { params })
      setUsers(res.data?.data || res.data || [])
    } catch (err) {
      console.error('Failed to load users', err)
    } finally {
      setLoading(false)
    }
  }

  // Debounced search & filter to backend
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(search, selectedRole)
    }, 350)
    return () => clearTimeout(timer)
  }, [search, selectedRole])

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const resetForm = () => {
    setFormName('')
    setFormEmail('')
    setFormPassword('')
    setFormRole('admin')
    setFormErrors({})
  }

  const handleOpenAdd = () => {
    resetForm()
    setIsAddOpen(true)
  }

  const handleOpenDetail = (user) => {
    setActiveUser(user)
    setIsDetailOpen(true)
  }

  const handleOpenEdit = (user) => {
    resetForm()
    setActiveUser(user)
    setFormName(user.name || '')
    setFormEmail(user.email || '')
    setFormRole(user.role || 'admin')
    setIsEditOpen(true)
  }

  const handleOpenDelete = (user) => {
    setActiveUser(user)
    setIsDeleteOpen(true)
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!formName.trim() || !formEmail.trim() || !formPassword) {
      setFormErrors({
        name: !formName.trim() ? 'Nama pengguna wajib diisi.' : null,
        email: !formEmail.trim() ? 'Email pengguna wajib diisi.' : null,
        password: !formPassword ? 'Kata sandi wajib diisi (minimal 8 karakter).' : null,
      })
      return
    }

    try {
      setSubmitting(true)
      setFormErrors({})
      await api.post('/users', {
        name: formName.trim(),
        email: formEmail.trim(),
        password: formPassword,
        role: formRole,
      })
      setIsAddOpen(false)
      resetForm()
      await fetchUsers(search, selectedRole)
    } catch (err) {
      console.error('Error adding user:', err)
      const message = err.response?.data?.message || 'Gagal menambahkan pengguna.'
      const validationErrors = err.response?.data?.errors || {}
      setFormErrors({
        general: message,
        name: validationErrors.name?.[0],
        email: validationErrors.email?.[0],
        password: validationErrors.password?.[0],
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!activeUser) return

    if (!formName.trim() || !formEmail.trim()) {
      setFormErrors({
        name: !formName.trim() ? 'Nama pengguna wajib diisi.' : null,
        email: !formEmail.trim() ? 'Email pengguna wajib diisi.' : null,
      })
      return
    }

    try {
      setSubmitting(true)
      setFormErrors({})
      const payload = {
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
      }
      if (formPassword.trim()) {
        payload.password = formPassword
      }
      await api.put(`/users/${activeUser.id}`, payload)
      setIsEditOpen(false)
      resetForm()
      setActiveUser(null)
      await fetchUsers(search, selectedRole)
    } catch (err) {
      console.error('Error updating user:', err)
      const message = err.response?.data?.message || 'Gagal memperbarui pengguna.'
      const validationErrors = err.response?.data?.errors || {}
      setFormErrors({
        general: message,
        name: validationErrors.name?.[0],
        email: validationErrors.email?.[0],
        password: validationErrors.password?.[0],
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!activeUser) return
    try {
      setDeleting(true)
      await api.delete(`/users/${activeUser.id}`)
      setIsDeleteOpen(false)
      setActiveUser(null)
      await fetchUsers(search, selectedRole)
    } catch (err) {
      console.error('Error deleting user:', err)
      alert(err.response?.data?.message || 'Gagal menghapus pengguna.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Kelola akun administrator dan staf yang memiliki akses ke panel.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 cursor-pointer">
          <Plus className="h-4 w-4" />
          <span>Tambah User</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari user di backend..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Backend Role Filter */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                <span>Role:</span>
              </div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Semua Peran</option>
                <option value="admin">Administrator</option>
                <option value="staff">Staff</option>
              </select>

              {(selectedRole || search) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch('')
                    setSelectedRole('')
                  }}
                  className="h-9 text-xs text-muted-foreground hover:text-foreground"
                >
                  Reset
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
              <span>
                Total: <strong>{users.length}</strong> pengguna
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-y border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 w-14 text-center">No</th>
                  <th className="px-4 py-3">Pengguna</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3 w-32">Peran (Role)</th>
                  <th className="px-4 py-3 w-36">Terdaftar</th>
                  <th className="px-4 py-3 text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y border-border">
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-xs">Memuat data pengguna dari server...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <UserCog className="h-8 w-8 text-muted-foreground/50" />
                        <span className="text-sm font-medium">Belum ada pengguna ditemukan.</span>
                        {search || selectedRole ? (
                          <span className="text-xs">Tidak ada hasil yang cocok dengan kriteria filter.</span>
                        ) : (
                          <Button variant="outline" size="sm" onClick={handleOpenAdd} className="mt-2 gap-1.5">
                            <Plus className="h-3.5 w-3.5" /> Tambah Pengguna Pertama
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((u, index) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-center text-xs font-mono font-medium text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border">
                            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                              {getInitials(u.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-foreground">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{u.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 text-[11px] gap-1">
                          <ShieldCheck className="h-3 w-3" /> {u.role || 'Admin'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                              title="Menu Aksi"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() => handleOpenDetail(u)}
                              className="cursor-pointer gap-2 py-2"
                            >
                              <Eye className="h-4 w-4 text-primary" />
                              <span>Lihat Detail</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleOpenEdit(u)}
                              className="cursor-pointer gap-2 py-2"
                            >
                              <Edit2 className="h-4 w-4 text-muted-foreground" />
                              <span>Edit User</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => handleOpenDelete(u)}
                              variant="destructive"
                              className="cursor-pointer gap-2 py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Hapus User</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── MODAL: TAMBAH USER ── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
            <DialogDescription>Tambahkan akun staf atau admin baru ke panel pengelola.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
            {formErrors.general && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formErrors.general}</span>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Nama Lengkap <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Misal: John Doe"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className={formErrors.name ? 'border-destructive' : ''}
              />
              {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Email Login <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                placeholder="nama@nyomanundagi.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className={formErrors.email ? 'border-destructive' : ''}
              />
              {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Kata Sandi <span className="text-destructive">*</span>
              </label>
              <Input
                type="password"
                placeholder="Minimal 8 karakter"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                className={formErrors.password ? 'border-destructive' : ''}
              />
              {formErrors.password && <p className="text-xs text-destructive">{formErrors.password}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Peran / Role</label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="admin">Administrator</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={submitting}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{submitting ? 'Menyimpan...' : 'Simpan User'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: EDIT USER ── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
            <DialogDescription>Perbarui nama, email, peran, atau ganti kata sandi.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Nama Lengkap <span className="text-destructive">*</span>
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className={formErrors.name ? 'border-destructive' : ''}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Email Login <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className={formErrors.email ? 'border-destructive' : ''}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Kata Sandi Baru <span className="text-muted-foreground font-normal">(kosongkan jika tidak diubah)</span>
              </label>
              <Input
                type="password"
                placeholder="Masukkan kata sandi baru..."
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Peran / Role</label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="admin">Administrator</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={submitting}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{submitting ? 'Memperbarui...' : 'Simpan Perubahan'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: HAPUS USER ── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              <span>Hapus Pengguna?</span>
            </DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus akun pengguna <strong className="text-foreground">"{activeUser?.name}"</strong> ({activeUser?.email})?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={deleting}>
              Batal
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteConfirm} disabled={deleting} className="gap-2">
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{deleting ? 'Menghapus...' : 'Ya, Hapus'}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ── MODAL: LIHAT DETAIL USER ── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md">
          {activeUser && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3.5">
                  <Avatar className="h-14 w-14 border border-border shadow-xs">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                      {activeUser.name
                        ? activeUser.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()
                        : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-lg font-bold">
                      {activeUser.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                      {activeUser.email}
                    </DialogDescription>
                    <div className="mt-1.5">
                      <Badge
                        variant="secondary"
                        className={
                          activeUser.role === 'admin'
                            ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs'
                            : 'bg-primary/10 text-primary border border-primary/20 text-xs'
                        }
                      >
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        {activeUser.role === 'admin' ? 'Administrator' : 'Super Admin'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-3 py-2 text-xs">
                {activeUser.created_at && (
                  <div className="flex items-center gap-2 text-muted-foreground pt-1 border-t border-border/40">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Terdaftar sejak: {new Date(activeUser.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                )}
              </div>

              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Tutup
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailOpen(false)
                    handleOpenEdit(activeUser)
                  }}
                  className="gap-1.5"
                >
                  <Edit2 className="h-4 w-4" /> Edit User
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
