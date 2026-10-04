import { useState, useEffect, useRef } from 'react'
import {
  Plus,
  Search,
  Briefcase,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  UploadCloud,
  X,
  Calendar,
  MoreVertical,
  Eye,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [activeService, setActiveService] = useState(null)

  // Form states
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formSortOrder, setFormSortOrder] = useState('0')
  const [imageFile, setImageFile] = useState(null)
  const [filePreview, setFilePreview] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fileInputRef = useRef(null)

  // Fetch services from backend with search parameter
  const fetchServices = async (searchQuery = '') => {
    try {
      setLoading(true)
      const params = {}
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }
      const res = await api.get('/services', { params })
      setServices(res.data?.data || res.data || [])
    } catch (err) {
      console.error('Failed to load services', err)
    } finally {
      setLoading(false)
    }
  }

  // Debounced search to backend
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices(search)
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  const resetForm = () => {
    setFormTitle('')
    setFormDescription('')
    setFormSortOrder('0')
    setImageFile(null)
    setFilePreview('')
    setFormErrors({})
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const resolveImageUrl = (service) => {
    if (!service) return ''
    if (service.image_url) return service.image_url
    if (!service.image) return ''
    if (service.image.startsWith('http://') || service.image.startsWith('https://')) {
      return service.image
    }
    const storageUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'
    return `${storageUrl.replace(/\/$/, '')}/${service.image.replace(/^\//, '')}`
  }

  const handleOpenAdd = () => {
    resetForm()
    setIsAddOpen(true)
  }

  const handleOpenDetail = (service) => {
    setActiveService(service)
    setIsDetailOpen(true)
  }

  const handleOpenEdit = (service) => {
    resetForm()
    setActiveService(service)
    setFormTitle(service.title || '')
    setFormDescription(service.description || '')
    setFormSortOrder(String(service.sort_order ?? 0))
    setFilePreview(resolveImageUrl(service))
    setIsEditOpen(true)
  }

  const handleOpenDelete = (service) => {
    setActiveService(service)
    setIsDeleteOpen(true)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setFilePreview(URL.createObjectURL(file))
    }
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      setFormErrors({ title: 'Nama layanan wajib diisi.' })
      return
    }

    try {
      setSubmitting(true)
      setFormErrors({})

      const formData = new FormData()
      formData.append('title', formTitle.trim())
      if (formDescription.trim()) {
        formData.append('description', formDescription.trim())
      }
      formData.append('sort_order', formSortOrder || '0')
      if (imageFile) {
        formData.append('image', imageFile)
      }

      await api.post('/services', formData)

      setIsAddOpen(false)
      resetForm()
      await fetchServices(search)
    } catch (err) {
      console.error('Error adding service:', err)
      const message = err.response?.data?.message || 'Gagal menambahkan layanan.'
      const validationErrors = err.response?.data?.errors || {}
      setFormErrors({
        general: message,
        title: validationErrors.title?.[0],
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!activeService) return

    if (!formTitle.trim()) {
      setFormErrors({ title: 'Nama layanan wajib diisi.' })
      return
    }

    try {
      setSubmitting(true)
      setFormErrors({})

      if (imageFile) {
        const formData = new FormData()
        formData.append('_method', 'PUT')
        formData.append('title', formTitle.trim())
        formData.append('description', formDescription.trim() || '')
        formData.append('sort_order', formSortOrder || '0')
        formData.append('image', imageFile)

        await api.post(`/services/${activeService.id}`, formData)
      } else {
        await api.put(`/services/${activeService.id}`, {
          title: formTitle.trim(),
          description: formDescription.trim() || '',
          sort_order: parseInt(formSortOrder, 10) || 0,
        })
      }

      setIsEditOpen(false)
      resetForm()
      setActiveService(null)
      await fetchServices(search)
    } catch (err) {
      console.error('Error updating service:', err)
      const message = err.response?.data?.message || 'Gagal memperbarui layanan.'
      const validationErrors = err.response?.data?.errors || {}
      setFormErrors({
        general: message,
        title: validationErrors.title?.[0],
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!activeService) return
    try {
      setDeleting(true)
      await api.delete(`/services/${activeService.id}`)
      setIsDeleteOpen(false)
      setActiveService(null)
      await fetchServices(search)
    } catch (err) {
      console.error('Error deleting service:', err)
      alert(err.response?.data?.message || 'Gagal menghapus layanan.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-sm text-muted-foreground">
            Kelola daftar layanan & jasa arsitektur yang ditawarkan.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 cursor-pointer">
          <Plus className="h-4 w-4" />
          <span>Tambah Layanan</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari layanan di backend..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
              <span>
                Total: <strong>{services.length}</strong> layanan
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
                  <th className="px-4 py-3 w-16">Icon</th>
                  <th className="px-4 py-3 w-64">Nama Layanan</th>
                  <th className="px-4 py-3">Deskripsi</th>
                  <th className="px-4 py-3 w-24">Urutan</th>
                  <th className="px-4 py-3 w-36">Dibuat</th>
                  <th className="px-4 py-3 text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && services.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-xs">Memuat data layanan dari server...</span>
                      </div>
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Briefcase className="h-8 w-8 text-muted-foreground/50" />
                        <span className="text-sm font-medium">Belum ada layanan ditemukan.</span>
                        {search ? (
                          <span className="text-xs">Tidak ada hasil yang cocok dengan "{search}".</span>
                        ) : (
                          <Button variant="outline" size="sm" onClick={handleOpenAdd} className="mt-2 gap-1.5">
                            <Plus className="h-3.5 w-3.5" /> Tambah Layanan Pertama
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  services.map((service, index) => {
                    const imgSrc = resolveImageUrl(service)
                    return (
                      <tr key={service.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-center text-xs font-mono font-medium text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center overflow-hidden border border-border">
                            {imgSrc ? (
                              <img src={imgSrc} alt={service.title} className="h-full w-full object-cover" />
                            ) : (
                              <Briefcase className="h-5 w-5" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          <div className="font-semibold text-foreground">{service.title}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground max-w-sm">
                          {service.description ? (
                            <span className="line-clamp-2">{service.description}</span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono">{service.sort_order ?? 0}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {service.created_at ? (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3 text-muted-foreground/70" />
                              <span>{new Date(service.created_at).toLocaleDateString('id-ID')}</span>
                            </div>
                          ) : (
                            '-'
                          )}
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
                                onClick={() => handleOpenDetail(service)}
                                className="cursor-pointer gap-2 py-2"
                              >
                                <Eye className="h-4 w-4 text-primary" />
                                <span>Lihat Detail</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => handleOpenEdit(service)}
                                className="cursor-pointer gap-2 py-2"
                              >
                                <Edit2 className="h-4 w-4 text-muted-foreground" />
                                <span>Edit Layanan</span>
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => handleOpenDelete(service)}
                                variant="destructive"
                                className="cursor-pointer gap-2 py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Hapus Layanan</span>
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

      {/* ── MODAL: TAMBAH LAYANAN ── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Layanan Baru</DialogTitle>
            <DialogDescription>
              Tambahkan data layanan arsitektur yang disediakan.
            </DialogDescription>
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
                Nama Layanan <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Misal: Perencanaan Arsitektur & Desain Interior"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className={formErrors.title ? 'border-destructive' : ''}
              />
              {formErrors.title && <p className="text-xs text-destructive">{formErrors.title}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Deskripsi Layanan</label>
              <textarea
                placeholder="Jelaskan cakupan layanan..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Nomor Urutan (Sort Order)</label>
                <Input
                  type="number"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Gambar / Ikon</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed rounded-lg p-2 text-center cursor-pointer hover:bg-muted/30 text-xs text-muted-foreground flex items-center justify-center gap-1.5 h-9"
                >
                  <UploadCloud className="h-4 w-4 text-primary" />
                  <span className="truncate">{imageFile ? imageFile.name : 'Pilih gambar'}</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
            {filePreview && (
              <div className="relative rounded-lg overflow-hidden border border-border w-24 h-24 bg-muted/40">
                <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null)
                    setFilePreview('')
                  }}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 text-white flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={submitting}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{submitting ? 'Menyimpan...' : 'Simpan Layanan'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: EDIT LAYANAN ── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Layanan</DialogTitle>
            <DialogDescription>Perbarui informasi layanan arsitektur.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Nama Layanan <span className="text-destructive">*</span>
              </label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className={formErrors.title ? 'border-destructive' : ''}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Deskripsi Layanan</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Nomor Urutan</label>
                <Input
                  type="number"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Ganti Gambar</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed rounded-lg p-2 text-center cursor-pointer hover:bg-muted/30 text-xs text-muted-foreground flex items-center justify-center gap-1.5 h-9"
                >
                  <UploadCloud className="h-4 w-4 text-primary" />
                  <span className="truncate">{imageFile ? imageFile.name : 'Pilih file baru'}</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
            {filePreview && (
              <div className="relative rounded-lg overflow-hidden border border-border w-24 h-24 bg-muted/40">
                <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
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

      {/* ── MODAL: HAPUS LAYANAN ── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              <span>Hapus Layanan?</span>
            </DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus layanan <strong className="text-foreground">"{activeService?.title}"</strong>?
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
      {/* ── MODAL: LIHAT DETAIL LAYANAN ── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md">
          {activeService && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  {resolveImageUrl(activeService) ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-border shrink-0 bg-muted/40">
                      <img
                        src={resolveImageUrl(activeService)}
                        alt={activeService.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl border border-border flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                      <Briefcase className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <DialogTitle className="text-lg font-bold">
                      {activeService.title}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Urutan tampilan: <span className="font-mono font-medium text-foreground">{activeService.sort_order ?? 0}</span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2 text-xs">
                {activeService.description ? (
                  <div className="space-y-1">
                    <span className="font-semibold text-foreground">Deskripsi Layanan</span>
                    <p className="text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/50 whitespace-pre-line text-sm">
                      {activeService.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Tidak ada deskripsi untuk layanan ini.</p>
                )}

                {activeService.created_at && (
                  <div className="flex items-center gap-2 text-muted-foreground pt-1 border-t border-border/40">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Dibuat: {new Date(activeService.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
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
                    handleOpenEdit(activeService)
                  }}
                  className="gap-1.5"
                >
                  <Edit2 className="h-4 w-4" /> Edit Layanan
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
