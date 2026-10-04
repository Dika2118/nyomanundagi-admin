import { useState, useEffect, useRef } from 'react'
import {
  Plus,
  Search,
  Image as ImageIcon,
  Edit2,
  Trash2,
  UploadCloud,
  Link as LinkIcon,
  X,
  Loader2,
  AlertCircle,
  ExternalLink,
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

export default function HeroBanners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [activeBanner, setActiveBanner] = useState(null)

  // Form states
  const [formTitle, setFormTitle] = useState('')
  const [formSubtitle, setFormSubtitle] = useState('')
  const [imageMode, setImageMode] = useState('file') // 'file' | 'url'
  const [imageFile, setImageFile] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [filePreview, setFilePreview] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fileInputRef = useRef(null)

  // Fetch banners directly from backend with search parameter
  const fetchBanners = async (searchQuery = '') => {
    try {
      setLoading(true)
      const params = {}
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }
      const res = await api.get('/hero-banners', { params })
      setBanners(res.data?.data || res.data || [])
    } catch (err) {
      console.error('Failed to load hero banners', err)
    } finally {
      setLoading(false)
    }
  }

  // Debounced search to backend for optimal performance & security
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBanners(search)
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  const resetForm = () => {
    setFormTitle('')
    setFormSubtitle('')
    setImageMode('file')
    setImageFile(null)
    setImageUrl('')
    setFilePreview('')
    setFormErrors({})
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleOpenAdd = () => {
    resetForm()
    setIsAddOpen(true)
  }

  const handleOpenEdit = (banner) => {
    resetForm()
    setActiveBanner(banner)
    setFormTitle(banner.title || '')
    setFormSubtitle(banner.subtitle || '')
    const bannerImg = banner.image_url || banner.image || ''
    if (bannerImg.startsWith('http://') || bannerImg.startsWith('https://')) {
      setImageMode('url')
      setImageUrl(bannerImg)
    } else {
      setImageMode('file')
    }
    setFilePreview(resolveImageUrl(banner))
    setIsEditOpen(true)
  }

  const handleOpenDelete = (banner) => {
    setActiveBanner(banner)
    setIsDeleteOpen(true)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormErrors((prev) => ({ ...prev, image: 'File harus berupa gambar (JPG, PNG, WebP).' }))
        return
      }
      setImageFile(file)
      setFormErrors((prev) => ({ ...prev, image: null }))
      const preview = URL.createObjectURL(file)
      setFilePreview(preview)
    }
  }

  const handleRemoveFile = () => {
    setImageFile(null)
    setFilePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const resolveImageUrl = (banner) => {
    if (!banner) return ''
    if (banner.image_url) return banner.image_url
    if (!banner.image) return ''
    if (banner.image.startsWith('http://') || banner.image.startsWith('https://')) {
      return banner.image
    }
    const storageUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'
    return `${storageUrl.replace(/\/$/, '')}/${banner.image.replace(/^\//, '')}`
  }

  // Handle Add Banner Submission
  const handleAddSubmit = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!formTitle.trim()) {
      errors.title = 'Judul banner wajib diisi.'
    }
    if (imageMode === 'file' && !imageFile) {
      errors.image = 'File gambar banner wajib diunggah.'
    } else if (imageMode === 'url' && !imageUrl.trim()) {
      errors.image = 'URL gambar banner wajib diisi.'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      setSubmitting(true)
      setFormErrors({})

      const formData = new FormData()
      formData.append('title', formTitle.trim())
      if (formSubtitle.trim()) {
        formData.append('subtitle', formSubtitle.trim())
      }

      if (imageMode === 'file' && imageFile) {
        formData.append('image', imageFile)
      } else if (imageMode === 'url') {
        formData.append('image', imageUrl.trim())
      }

      await api.post('/hero-banners', formData)

      setIsAddOpen(false)
      resetForm()
      await fetchBanners(search)
    } catch (err) {
      console.error('Error adding hero banner:', err)
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Gagal menambahkan banner. Silakan periksa kembali data Anda.'
      const validationErrors = err.response?.data?.errors || {}
      setFormErrors({
        general: message,
        title: validationErrors.title?.[0],
        image: validationErrors.image?.[0],
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Edit Banner Submission
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!activeBanner) return

    const errors = {}
    if (!formTitle.trim()) {
      errors.title = 'Judul banner wajib diisi.'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      setSubmitting(true)
      setFormErrors({})

      if (imageMode === 'file' && imageFile) {
        // Upload new file using multipart form with method spoofing
        const formData = new FormData()
        formData.append('_method', 'PUT')
        formData.append('title', formTitle.trim())
        formData.append('subtitle', formSubtitle.trim() || '')
        formData.append('image', imageFile)

        await api.post(`/hero-banners/${activeBanner.id}`, formData)
      } else {
        // Updating without new file or using URL
        const payload = {
          title: formTitle.trim(),
          subtitle: formSubtitle.trim() || '',
        }
        if (imageMode === 'url' && imageUrl.trim()) {
          payload.image = imageUrl.trim()
        }
        await api.put(`/hero-banners/${activeBanner.id}`, payload)
      }

      setIsEditOpen(false)
      resetForm()
      setActiveBanner(null)
      await fetchBanners(search)
    } catch (err) {
      console.error('Error updating hero banner:', err)
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Gagal memperbarui banner. Silakan coba lagi.'
      const validationErrors = err.response?.data?.errors || {}
      setFormErrors({
        general: message,
        title: validationErrors.title?.[0],
        image: validationErrors.image?.[0],
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Delete Banner
  const handleDeleteConfirm = async () => {
    if (!activeBanner) return
    try {
      setDeleting(true)
      await api.delete(`/hero-banners/${activeBanner.id}`)
      setIsDeleteOpen(false)
      setActiveBanner(null)
      await fetchBanners(search)
    } catch (err) {
      console.error('Error deleting hero banner:', err)
      alert(err.response?.data?.message || 'Gagal menghapus banner.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hero Banners</h1>
          <p className="text-sm text-muted-foreground">
            Kelola banner slider utama yang tampil di beranda website.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 cursor-pointer">
          <Plus className="h-4 w-4" />
          <span>Tambah Banner</span>
        </Button>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari banner di backend..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
              <span>
                Total: <strong>{banners.length}</strong> banner
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
                  <th className="px-4 py-3 w-32">Banner</th>
                  <th className="px-4 py-3 w-64">Judul Banner</th>
                  <th className="px-4 py-3">Subtitle</th>
                  <th className="px-4 py-3 w-44">Tanggal Dibuat</th>
                  <th className="px-4 py-3 text-right w-28 pr-6">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && banners.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-xs">Memuat data banner dari server...</span>
                      </div>
                    </td>
                  </tr>
                ) : banners.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                        <span className="text-sm font-medium">Belum ada banner ditemukan.</span>
                        {search ? (
                          <span className="text-xs">Tidak ada hasil yang cocok dengan "{search}".</span>
                        ) : (
                          <Button variant="outline" size="sm" onClick={handleOpenAdd} className="mt-2 gap-1.5">
                            <Plus className="h-3.5 w-3.5" /> Tambah Banner Pertama
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  banners.map((banner, index) => {
                    const imgSrc = resolveImageUrl(banner)
                    return (
                      <tr key={banner.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-center text-xs font-mono font-medium text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveBanner(banner)
                              setIsPreviewOpen(true)
                            }}
                            className="group relative h-14 w-24 rounded-lg bg-muted overflow-hidden border border-border flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                            title="Klik untuk memperbesar"
                          >
                            {imgSrc ? (
                              <>
                                <img
                                  src={imgSrc}
                                  alt={banner.title}
                                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden')
                                  }}
                                />
                                <div className="fallback-icon hidden">
                                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                  <ExternalLink className="h-4 w-4" />
                                </div>
                              </>
                            ) : (
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          <div className="font-semibold text-foreground">{banner.title}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground max-w-sm">
                          {banner.subtitle ? (
                            <span className="line-clamp-2">{banner.subtitle}</span>
                          ) : (
                            <span className="text-xs italic text-muted-foreground/60">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {banner.created_at ? (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                              <span>
                                {new Date(banner.created_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
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
                                onClick={() => handleOpenPreview(banner)}
                                className="cursor-pointer gap-2 py-2"
                              >
                                <Eye className="h-4 w-4 text-primary" />
                                <span>Lihat Detail</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => handleOpenEdit(banner)}
                                className="cursor-pointer gap-2 py-2"
                              >
                                <Edit2 className="h-4 w-4 text-muted-foreground" />
                                <span>Edit Banner</span>
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => handleOpenDelete(banner)}
                                variant="destructive"
                                className="cursor-pointer gap-2 py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Hapus Banner</span>
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

      {/* ── MODAL: TAMBAH BANNER ── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Hero Banner</DialogTitle>
            <DialogDescription>
              Tambahkan gambar banner baru untuk ditampilkan pada slider beranda website.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
            {formErrors.general && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formErrors.general}</span>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Judul Banner <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Misal: Arsitektur Tropis & Modern Bali"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className={formErrors.title ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {formErrors.title && (
                <p className="text-xs text-destructive">{formErrors.title}</p>
              )}
            </div>

            {/* Subtitle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Subtitle / Deskripsi Singkat <span className="text-muted-foreground font-normal">(opsional)</span>
              </label>
              <textarea
                placeholder="Misal: Mewujudkan hunian impian dengan harmoni arsitektur Bali modern dan alam tropis."
                value={formSubtitle}
                onChange={(e) => setFormSubtitle(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Image Upload / URL Choice */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Gambar Banner <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setImageMode('file')}
                    className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                      imageMode === 'file'
                        ? 'bg-background text-foreground font-medium shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Unggah File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                      imageMode === 'url'
                        ? 'bg-background text-foreground font-medium shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Tautan URL
                  </button>
                </div>
              </div>

              {imageMode === 'file' ? (
                <div>
                  {filePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30 aspect-video flex items-center justify-center">
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Hapus gambar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 ${
                        formErrors.image ? 'border-destructive/60 bg-destructive/5' : 'border-border'
                      }`}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-primary">Klik untuk unggah</span> atau seret file ke sini
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Format JPG, PNG, WEBP. Rekomendasi rasio 16:9 (1920x1080 px).
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="https://example.com/banner-hero.jpg"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value)
                        setFilePreview(e.target.value)
                      }}
                      className={`pl-8 ${formErrors.image ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {imageUrl && (
                    <div className="rounded-lg overflow-hidden border border-border aspect-video bg-muted/40 max-h-36 flex items-center justify-center">
                      <img
                        src={imageUrl}
                        alt="Preview URL"
                        className="w-full h-full object-cover"
                        onError={() => setFilePreview('')}
                      />
                    </div>
                  )}
                </div>
              )}

              {formErrors.image && (
                <p className="text-xs text-destructive">{formErrors.image}</p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{submitting ? 'Menyimpan...' : 'Simpan Banner'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: EDIT BANNER ── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Hero Banner</DialogTitle>
            <DialogDescription>
              Perbarui judul, subtitle, atau ganti gambar banner utama.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            {formErrors.general && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formErrors.general}</span>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Judul Banner <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Judul banner"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className={formErrors.title ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {formErrors.title && (
                <p className="text-xs text-destructive">{formErrors.title}</p>
              )}
            </div>

            {/* Subtitle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Subtitle / Deskripsi Singkat <span className="text-muted-foreground font-normal">(opsional)</span>
              </label>
              <textarea
                placeholder="Deskripsi singkat banner"
                value={formSubtitle}
                onChange={(e) => setFormSubtitle(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Image Preview & Replacement */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Gambar Banner
                </label>
                <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setImageMode('file')}
                    className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                      imageMode === 'file'
                        ? 'bg-background text-foreground font-medium shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Unggah File Baru
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                      imageMode === 'url'
                        ? 'bg-background text-foreground font-medium shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Gunakan URL
                  </button>
                </div>
              </div>

              {/* Current or Selected Preview */}
              {filePreview && (
                <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30 aspect-video flex items-center justify-center">
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {imageFile && (
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Batalkan file baru"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}

              {imageMode === 'file' ? (
                <div>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 text-xs text-muted-foreground"
                  >
                    <UploadCloud className="h-4 w-4 text-primary" />
                    <span>{imageFile ? 'Pilih file lain' : 'Klik untuk mengganti gambar banner'}</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="relative">
                    <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="https://example.com/banner-hero.jpg"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value)
                        setFilePreview(e.target.value)
                      }}
                      className="pl-8"
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={submitting}
              >
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

      {/* ── MODAL: KONFIRMASI HAPUS ── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              <span>Hapus Hero Banner?</span>
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus banner{' '}
              <strong className="text-foreground">"{activeBanner?.title}"</strong>?
              Data yang telah dihapus beserta gambarnya tidak dapat dikembalikan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="gap-2"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{deleting ? 'Menghapus...' : 'Ya, Hapus Banner'}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: PREVIEW GAMBAR LENGKAP ── */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-3xl p-2 bg-black/95 border-neutral-800 text-white">
          <div className="relative flex flex-col items-center">
            {activeBanner && (
              <>
                <div className="w-full max-h-[75vh] overflow-hidden rounded-lg flex items-center justify-center bg-black">
                  <img
                    src={resolveImageUrl(activeBanner)}
                    alt={activeBanner.title}
                    className="max-h-[75vh] w-auto object-contain"
                  />
                </div>
                <div className="p-3 w-full text-left">
                  <h3 className="font-semibold text-sm text-white">{activeBanner.title}</h3>
                  {activeBanner.subtitle && (
                    <p className="text-xs text-neutral-400 mt-0.5">{activeBanner.subtitle}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
