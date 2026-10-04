import { useState, useEffect, useRef } from 'react'
import {
  Plus,
  Search,
  Users2,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  UploadCloud,
  X,
  Calendar,
  Briefcase,
  MoreVertical,
  Eye,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

export default function TeamMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [activeMember, setActiveMember] = useState(null)

  // Form states
  const [formName, setFormName] = useState('')
  const [formPosition, setFormPosition] = useState('')
  const [formBio, setFormBio] = useState('')
  const [formSortOrder, setFormSortOrder] = useState('0')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fileInputRef = useRef(null)

  // Fetch team members from backend with search parameter
  const fetchMembers = async (searchQuery = '') => {
    try {
      setLoading(true)
      const params = {}
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }
      const res = await api.get('/team-members', { params })
      setMembers(res.data?.data || res.data || [])
    } catch (err) {
      console.error('Failed to load team members', err)
    } finally {
      setLoading(false)
    }
  }

  // Debounced search to backend
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers(search)
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  const resolvePhotoUrl = (member) => {
    if (!member) return ''
    if (member.photo_url) return member.photo_url
    if (!member.photo) return ''
    if (member.photo.startsWith('http://') || member.photo.startsWith('https://')) {
      return member.photo
    }
    const storageUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'
    return `${storageUrl.replace(/\/$/, '')}/${member.photo.replace(/^\//, '')}`
  }

  const getInitials = (name) => {
    if (!name) return 'TM'
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const resetForm = () => {
    setFormName('')
    setFormPosition('')
    setFormBio('')
    setFormSortOrder('0')
    setPhotoFile(null)
    setPhotoPreview('')
    setFormErrors({})
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleOpenAdd = () => {
    resetForm()
    setIsAddOpen(true)
  }

  const handleOpenDetail = (member) => {
    setActiveMember(member)
    setIsDetailOpen(true)
  }

  const handleOpenEdit = (member) => {
    resetForm()
    setActiveMember(member)
    setFormName(member.name || '')
    setFormPosition(member.position || '')
    setFormBio(member.bio || '')
    setFormSortOrder(String(member.sort_order ?? 0))
    setPhotoPreview(resolvePhotoUrl(member))
    setIsEditOpen(true)
  }

  const handleOpenDelete = (member) => {
    setActiveMember(member)
    setIsDeleteOpen(true)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!formName.trim() || !formPosition.trim()) {
      setFormErrors({
        name: !formName.trim() ? 'Nama anggota tim wajib diisi.' : null,
        position: !formPosition.trim() ? 'Posisi / jabatan wajib diisi.' : null,
      })
      return
    }

    try {
      setSubmitting(true)
      setFormErrors({})

      const formData = new FormData()
      formData.append('name', formName.trim())
      formData.append('position', formPosition.trim())
      if (formBio.trim()) formData.append('bio', formBio.trim())
      formData.append('sort_order', formSortOrder || '0')
      if (photoFile) {
        formData.append('photo', photoFile)
      }

      await api.post('/team-members', formData)

      setIsAddOpen(false)
      resetForm()
      await fetchMembers(search)
    } catch (err) {
      console.error('Error adding team member:', err)
      const message = err.response?.data?.message || 'Gagal menambahkan anggota tim.'
      const validationErrors = err.response?.data?.errors || {}
      setFormErrors({
        general: message,
        name: validationErrors.name?.[0],
        position: validationErrors.position?.[0],
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!activeMember) return

    if (!formName.trim() || !formPosition.trim()) {
      setFormErrors({
        name: !formName.trim() ? 'Nama anggota tim wajib diisi.' : null,
        position: !formPosition.trim() ? 'Posisi / jabatan wajib diisi.' : null,
      })
      return
    }

    try {
      setSubmitting(true)
      setFormErrors({})

      if (photoFile) {
        const formData = new FormData()
        formData.append('_method', 'PUT')
        formData.append('name', formName.trim())
        formData.append('position', formPosition.trim())
        formData.append('bio', formBio.trim() || '')
        formData.append('sort_order', formSortOrder || '0')
        formData.append('photo', photoFile)

        await api.post(`/team-members/${activeMember.id}`, formData)
      } else {
        await api.put(`/team-members/${activeMember.id}`, {
          name: formName.trim(),
          position: formPosition.trim(),
          bio: formBio.trim() || null,
          sort_order: parseInt(formSortOrder, 10) || 0,
        })
      }

      setIsEditOpen(false)
      resetForm()
      setActiveMember(null)
      await fetchMembers(search)
    } catch (err) {
      console.error('Error updating team member:', err)
      const message = err.response?.data?.message || 'Gagal memperbarui anggota tim.'
      const validationErrors = err.response?.data?.errors || {}
      setFormErrors({
        general: message,
        name: validationErrors.name?.[0],
        position: validationErrors.position?.[0],
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!activeMember) return
    try {
      setDeleting(true)
      await api.delete(`/team-members/${activeMember.id}`)
      setIsDeleteOpen(false)
      setActiveMember(null)
      await fetchMembers(search)
    } catch (err) {
      console.error('Error deleting team member:', err)
      alert(err.response?.data?.message || 'Gagal menghapus anggota tim.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
          <p className="text-sm text-muted-foreground">
            Kelola profil anggota tim, posisi jabatan, dan foto staf.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 cursor-pointer">
          <Plus className="h-4 w-4" />
          <span>Tambah Anggota</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari tim di backend..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
              <span>
                Total: <strong>{members.length}</strong> anggota
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
                  <th className="px-4 py-3 w-16">Foto</th>
                  <th className="px-4 py-3 w-56">Nama</th>
                  <th className="px-4 py-3 w-64">Jabatan / Posisi</th>
                  <th className="px-4 py-3">Bio</th>
                  <th className="px-4 py-3 w-20">Urutan</th>
                  <th className="px-4 py-3 text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && members.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-xs">Memuat data tim dari server...</span>
                      </div>
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users2 className="h-8 w-8 text-muted-foreground/50" />
                        <span className="text-sm font-medium">Belum ada anggota tim ditemukan.</span>
                        {search ? (
                          <span className="text-xs">Tidak ada hasil yang cocok dengan "{search}".</span>
                        ) : (
                          <Button variant="outline" size="sm" onClick={handleOpenAdd} className="mt-2 gap-1.5">
                            <Plus className="h-3.5 w-3.5" /> Tambah Anggota Pertama
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  members.map((member, index) => {
                    const photo = resolvePhotoUrl(member)
                    return (
                      <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-center text-xs font-mono font-medium text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <Avatar className="h-10 w-10 border border-border">
                            {photo && <AvatarImage src={photo} alt={member.name} />}
                            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          <div className="font-semibold text-foreground">{member.name}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground font-medium">
                          {member.position || '-'}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                          {member.bio || '-'}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono">{member.sort_order ?? 0}</td>
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
                                onClick={() => handleOpenDetail(member)}
                                className="cursor-pointer gap-2 py-2"
                              >
                                <Eye className="h-4 w-4 text-primary" />
                                <span>Lihat Detail</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => handleOpenEdit(member)}
                                className="cursor-pointer gap-2 py-2"
                              >
                                <Edit2 className="h-4 w-4 text-muted-foreground" />
                                <span>Edit Anggota</span>
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => handleOpenDelete(member)}
                                variant="destructive"
                                className="cursor-pointer gap-2 py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Hapus Anggota</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── MODAL: TAMBAH ANGGOTA ── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Anggota Tim</DialogTitle>
            <DialogDescription>Tambahkan profil arsitek atau staf baru ke sistem.</DialogDescription>
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
                placeholder="Misal: I Nyoman Undagi, S.Ars"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className={formErrors.name ? 'border-destructive' : ''}
              />
              {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Jabatan / Posisi <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Misal: Principal Architect & Founder"
                value={formPosition}
                onChange={(e) => setFormPosition(e.target.value)}
                className={formErrors.position ? 'border-destructive' : ''}
              />
              {formErrors.position && <p className="text-xs text-destructive">{formErrors.position}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Bio / Profil Singkat</label>
              <textarea
                placeholder="Ringkasan pengalaman & spesialisasi..."
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Urutan Tampil</label>
                <Input
                  type="number"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Foto Profil</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed rounded-lg p-2 text-center cursor-pointer hover:bg-muted/30 text-xs text-muted-foreground flex items-center justify-center gap-1.5 h-9"
                >
                  <UploadCloud className="h-4 w-4 text-primary" />
                  <span className="truncate">{photoFile ? photoFile.name : 'Pilih foto'}</span>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>
            </div>
            {photoPreview && (
              <div className="relative rounded-full overflow-hidden border border-border w-16 h-16 bg-muted/40">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={submitting}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{submitting ? 'Menyimpan...' : 'Simpan Anggota'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: EDIT ANGGOTA ── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Anggota Tim</DialogTitle>
            <DialogDescription>Perbarui profil dan jabatan anggota tim.</DialogDescription>
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
                Jabatan / Posisi <span className="text-destructive">*</span>
              </label>
              <Input
                value={formPosition}
                onChange={(e) => setFormPosition(e.target.value)}
                className={formErrors.position ? 'border-destructive' : ''}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Bio / Profil Singkat</label>
              <textarea
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Urutan Tampil</label>
                <Input
                  type="number"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Ganti Foto</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed rounded-lg p-2 text-center cursor-pointer hover:bg-muted/30 text-xs text-muted-foreground flex items-center justify-center gap-1.5 h-9"
                >
                  <UploadCloud className="h-4 w-4 text-primary" />
                  <span className="truncate">{photoFile ? photoFile.name : 'Pilih foto baru'}</span>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>
            </div>
            {photoPreview && (
              <div className="relative rounded-full overflow-hidden border border-border w-16 h-16 bg-muted/40">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
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

      {/* ── MODAL: HAPUS ANGGOTA ── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              <span>Hapus Anggota Tim?</span>
            </DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus anggota tim <strong className="text-foreground">"{activeMember?.name}"</strong>?
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
      {/* ── MODAL: LIHAT DETAIL ANGGOTA TIM ── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md">
          {activeMember && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3.5">
                  <Avatar className="h-16 w-16 border-2 border-border shadow-xs">
                    <AvatarImage
                      src={resolvePhotoUrl(activeMember)}
                      alt={activeMember.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                      {activeMember.name
                        ? activeMember.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()
                        : 'TM'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-lg font-bold">
                      {activeMember.name}
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-1.5 text-xs text-primary font-medium mt-0.5">
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>{activeMember.position || 'Anggota Tim'}</span>
                    </DialogDescription>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Urutan: <span className="font-mono font-medium">{activeMember.sort_order ?? 0}</span>
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2 text-xs">
                {activeMember.bio ? (
                  <div className="space-y-1">
                    <span className="font-semibold text-foreground">Biografi / Profil Singkat</span>
                    <p className="text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/50 whitespace-pre-line text-sm">
                      {activeMember.bio}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Belum ada biografi yang diisi untuk anggota ini.</p>
                )}

                {activeMember.created_at && (
                  <div className="flex items-center gap-2 text-muted-foreground pt-1 border-t border-border/40">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Terdaftar sejak: {new Date(activeMember.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
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
                    handleOpenEdit(activeMember)
                  }}
                  className="gap-1.5"
                >
                  <Edit2 className="h-4 w-4" /> Edit Anggota
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
