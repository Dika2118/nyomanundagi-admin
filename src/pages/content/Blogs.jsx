import { useState, useEffect, useRef } from 'react'
import {
  Plus,
  Search,
  BookOpen,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  UploadCloud,
  Link as LinkIcon,
  X,
  ExternalLink,
  Calendar,
  MoreVertical,
  Eye,
  User,
  Tag,
  Clock,
  Sparkles,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { useAuth } from '@/context/AuthContext'

const DEFAULT_CATEGORIES = [
  'Arsitektur Bali',
  'Desain Interior',
  'Konstruksi & Sipil',
  'Tips & Inspirasi',
  'Proyek & Berita',
  'Material & Estetika',
]

export default function Blogs() {
  const { user } = useAuth()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [activeBlog, setActiveBlog] = useState(null)
  const [previewImageUrl, setPreviewImageUrl] = useState('')

  // Form states
  const [formTitle, setFormTitle] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formCategory, setFormCategory] = useState('Arsitektur Bali')
  const [formAuthorName, setFormAuthorName] = useState('')
  const [formStatus, setFormStatus] = useState('Published')
  const [formExcerpt, setFormExcerpt] = useState('')
  const [formContent, setFormContent] = useState('')
  const [imageMode, setImageMode] = useState('file') // 'file' | 'url'
  const [imageFile, setImageFile] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [filePreview, setFilePreview] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fileInputRef = useRef(null)

  // Fetch blogs with backend query filters
  const fetchBlogs = async (searchQuery = '', statusFilter = '', categoryFilter = '') => {
    try {
      setLoading(true)
      const params = {}
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }
      if (statusFilter) {
        params.status = statusFilter
      }
      if (categoryFilter) {
        params.category = categoryFilter
      }
      const res = await api.get('/blogs', { params })
      const data = res.data?.data
      if (Array.isArray(data)) {
        setBlogs(data)
      } else if (data && Array.isArray(data.data)) {
        setBlogs(data.data)
      } else {
        setBlogs([])
      }
    } catch (err) {
      console.error('Failed to load blogs', err)
      setBlogs([])
    } finally {
      setLoading(false)
    }
  }

  // Debounce search and filter
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBlogs(search, selectedStatus, selectedCategory)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, selectedStatus, selectedCategory])

  const resetForm = () => {
    setFormTitle('')
    setFormSlug('')
    setFormCategory('Arsitektur Bali')
    setFormAuthorName(user?.name || 'Nyoman Undagi Team')
    setFormStatus('Published')
    setFormExcerpt('')
    setFormContent('')
    setImageMode('file')
    setImageFile(null)
    setImageUrl('')
    setFilePreview('')
    setFormErrors({})
  }

  const resolveImageUrl = (blog) => {
    if (!blog) return ''
    if (blog.image_url) return blog.image_url
    if (blog.thumbnail_url) return blog.thumbnail_url
    if (!blog.image) return ''
    if (blog.image.startsWith('http://') || blog.image.startsWith('https://')) {
      return blog.image
    }
    const storageUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'
    return `${storageUrl.replace(/\/$/, '')}/${blog.image.replace(/^\//, '')}`
  }

  const generateSlug = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (e) => {
    const val = e.target.value
    setFormTitle(val)
    if (!formSlug || formSlug === generateSlug(formTitle)) {
      setFormSlug(generateSlug(val))
    }
  }

  const handleOpenAdd = () => {
    resetForm()
    setIsAddOpen(true)
  }

  const handleOpenDetail = (blog) => {
    setActiveBlog(blog)
    setIsDetailOpen(true)
  }

  const handleOpenEdit = (blog) => {
    resetForm()
    setActiveBlog(blog)
    setFormTitle(blog.title || '')
    setFormSlug(blog.slug || '')
    setFormCategory(blog.category || 'Arsitektur Bali')
    setFormAuthorName(blog.author_name || user?.name || '')
    setFormStatus(blog.status || 'Published')
    setFormExcerpt(blog.excerpt || '')
    setFormContent(blog.content || '')
    const imgUrl = resolveImageUrl(blog)
    if (imgUrl) {
      if (imgUrl.startsWith('http') && !imgUrl.includes('/storage/')) {
        setImageMode('url')
        setImageUrl(imgUrl)
      } else {
        setImageMode('file')
        setFilePreview(imgUrl)
      }
    }
    setIsEditOpen(true)
  }

  const handleOpenDelete = (blog) => {
    setActiveBlog(blog)
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
      setFormErrors({ title: 'Judul artikel wajib diisi.' })
      return
    }

    try {
      setSubmitting(true)
      setFormErrors({})

      if (imageMode === 'file' && imageFile) {
        const formData = new FormData()
        formData.append('title', formTitle.trim())
        if (formSlug.trim()) formData.append('slug', formSlug.trim())
        if (formCategory) formData.append('category', formCategory)
        if (formAuthorName.trim()) formData.append('author_name', formAuthorName.trim())
        formData.append('status', formStatus)
        if (formExcerpt.trim()) formData.append('excerpt', formExcerpt.trim())
        if (formContent.trim()) formData.append('content', formContent.trim())
        formData.append('image', imageFile)

        await api.post('/blogs', formData)
      } else {
        const payload = {
          title: formTitle.trim(),
          slug: formSlug.trim() || undefined,
          category: formCategory,
          author_name: formAuthorName.trim() || undefined,
          status: formStatus,
          excerpt: formExcerpt.trim() || undefined,
          content: formContent.trim() || undefined,
        }
        if (imageMode === 'url' && imageUrl.trim()) {
          payload.image = imageUrl.trim()
        }
        await api.post('/blogs', payload)
      }

      setIsAddOpen(false)
      resetForm()
      await fetchBlogs(search, selectedStatus, selectedCategory)
    } catch (err) {
      console.error('Error adding blog:', err)
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Gagal menambahkan artikel blog. Silakan coba lagi.'
      const validationErrors = err.response?.data?.errors || {}
      setFormErrors({
        general: message,
        title: validationErrors.title?.[0],
        slug: validationErrors.slug?.[0],
        image: validationErrors.image?.[0],
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!activeBlog) return
    if (!formTitle.trim()) {
      setFormErrors({ title: 'Judul artikel wajib diisi.' })
      return
    }

    try {
      setSubmitting(true)
      setFormErrors({})

      if (imageMode === 'file' && imageFile) {
        const formData = new FormData()
        formData.append('_method', 'PUT')
        formData.append('title', formTitle.trim())
        if (formSlug.trim()) formData.append('slug', formSlug.trim())
        if (formCategory) formData.append('category', formCategory)
        if (formAuthorName.trim()) formData.append('author_name', formAuthorName.trim())
        formData.append('status', formStatus)
        if (formExcerpt.trim()) formData.append('excerpt', formExcerpt.trim())
        if (formContent.trim()) formData.append('content', formContent.trim())
        formData.append('image', imageFile)

        await api.post(`/blogs/${activeBlog.id}`, formData)
      } else {
        const payload = {
          title: formTitle.trim(),
          slug: formSlug.trim() || undefined,
          category: formCategory,
          author_name: formAuthorName.trim() || undefined,
          status: formStatus,
          excerpt: formExcerpt.trim() || undefined,
          content: formContent.trim() || undefined,
        }
        if (imageMode === 'url' && imageUrl.trim()) {
          payload.image = imageUrl.trim()
        }
        await api.put(`/blogs/${activeBlog.id}`, payload)
      }

      setIsEditOpen(false)
      resetForm()
      setActiveBlog(null)
      await fetchBlogs(search, selectedStatus, selectedCategory)
    } catch (err) {
      console.error('Error updating blog:', err)
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Gagal memperbarui artikel blog. Silakan coba lagi.'
      const validationErrors = err.response?.data?.errors || {}
      setFormErrors({
        general: message,
        title: validationErrors.title?.[0],
        slug: validationErrors.slug?.[0],
        image: validationErrors.image?.[0],
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!activeBlog) return
    try {
      setDeleting(true)
      await api.delete(`/blogs/${activeBlog.id}`)
      setIsDeleteOpen(false)
      setActiveBlog(null)
      await fetchBlogs(search, selectedStatus, selectedCategory)
    } catch (err) {
      console.error('Error deleting blog:', err)
      alert(err.response?.data?.message || 'Gagal menghapus artikel.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>Manajemen Blog & Artikel</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola publikasi artikel, wawasan arsitektur, dan berita seputar Nyoman Undagi.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 cursor-pointer shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Tambah Artikel</span>
        </Button>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="p-4 pb-0">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari artikel berdasarkan judul, ringkasan, atau penulis..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background/50 h-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 px-3 text-xs rounded-md border border-input bg-background/50 text-foreground cursor-pointer focus:outline-none"
              >
                <option value="">Semua Kategori</option>
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 px-3 text-xs rounded-md border border-input bg-background/50 text-foreground cursor-pointer focus:outline-none"
              >
                <option value="">Semua Status</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
        </CardHeader>

        {/* ── TABLE DATA ── */}
        <CardContent className="p-4 pt-4">
          <div className="rounded-lg border border-border/70 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/70">
                <tr>
                  <th className="px-4 py-3 text-center w-12">No</th>
                  <th className="px-4 py-3 w-28">Gambar</th>
                  <th className="px-4 py-3">Artikel & Ringkasan</th>
                  <th className="px-4 py-3 w-40">Kategori</th>
                  <th className="px-4 py-3 w-36">Penulis</th>
                  <th className="px-4 py-3 w-28">Status</th>
                  <th className="px-4 py-3 w-32">Tanggal Rilis</th>
                  <th className="px-4 py-3 text-right w-20">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-xs">Memuat daftar artikel blog...</span>
                      </div>
                    </td>
                  </tr>
                ) : blogs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                        <span className="text-sm font-medium">Belum ada artikel ditemukan.</span>
                        {search || selectedStatus || selectedCategory ? (
                          <span className="text-xs">Tidak ada artikel yang cocok dengan filter pencarian.</span>
                        ) : (
                          <Button variant="outline" size="sm" onClick={handleOpenAdd} className="mt-2 gap-1.5 cursor-pointer">
                            <Plus className="h-3.5 w-3.5" /> Buat Artikel Pertama
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  blogs.map((blog, index) => {
                    const imgUrl = resolveImageUrl(blog)
                    return (
                      <tr key={blog.id} className="hover:bg-muted/30 transition-colors">
                        {/* Kolom No */}
                        <td className="px-4 py-3 text-center text-xs font-mono font-medium text-muted-foreground">
                          {index + 1}
                        </td>

                        {/* Kolom Gambar Thumbnail */}
                        <td className="px-4 py-3">
                          {imgUrl ? (
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewImageUrl(imgUrl)
                                setIsPreviewOpen(true)
                              }}
                              className="group relative h-14 w-20 rounded-md overflow-hidden border border-border bg-muted/30 cursor-pointer block"
                              title="Klik untuk perbesar gambar"
                            >
                              <img
                                src={imgUrl}
                                alt={blog.title}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </button>
                          ) : (
                            <div className="h-14 w-20 rounded-md border border-dashed border-border/80 bg-muted/20 flex flex-col items-center justify-center text-muted-foreground">
                              <ImageIcon className="h-5 w-5 opacity-40" />
                              <span className="text-[10px] opacity-60 mt-0.5">No Cover</span>
                            </div>
                          )}
                        </td>

                        {/* Kolom Judul & Ringkasan */}
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(blog)}
                            className="font-semibold text-foreground hover:text-primary transition-colors text-left block text-sm"
                          >
                            {blog.title}
                          </button>
                          {blog.slug && (
                            <span className="text-[11px] font-mono text-muted-foreground/80 block mt-0.5 truncate max-w-md">
                              /{blog.slug}
                            </span>
                          )}
                          {blog.excerpt && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1 max-w-lg">
                              {blog.excerpt}
                            </p>
                          )}
                        </td>

                        {/* Kolom Kategori */}
                        <td className="px-4 py-3">
                          {blog.category ? (
                            <Badge variant="secondary" className="text-xs font-normal">
                              {blog.category}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">-</span>
                          )}
                        </td>

                        {/* Kolom Penulis */}
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                            <span className="truncate max-w-[120px]">{blog.author_name || 'Admin'}</span>
                          </div>
                        </td>

                        {/* Kolom Status */}
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={
                              blog.status === 'Published'
                                ? 'text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-[11px]'
                                : 'text-amber-600 border-amber-500/30 bg-amber-500/10 text-[11px]'
                            }
                          >
                            {blog.status || 'Published'}
                          </Badge>
                        </td>

                        {/* Kolom Tanggal Rilis */}
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {blog.published_at || blog.created_at ? (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3 text-muted-foreground/70" />
                              <span>
                                {new Date(blog.published_at || blog.created_at).toLocaleDateString('id-ID', {
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

                        {/* Kolom Aksi Titik 3 */}
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
                                onClick={() => handleOpenDetail(blog)}
                                className="cursor-pointer gap-2 py-2"
                              >
                                <Eye className="h-4 w-4 text-primary" />
                                <span>Lihat Detail</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => handleOpenEdit(blog)}
                                className="cursor-pointer gap-2 py-2"
                              >
                                <Edit2 className="h-4 w-4 text-muted-foreground" />
                                <span>Edit Artikel</span>
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => handleOpenDelete(blog)}
                                variant="destructive"
                                className="cursor-pointer gap-2 py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Hapus Artikel</span>
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

      {/* ── MODAL: LIHAT DETAIL ARTIKEL ── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {activeBlog && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <Badge variant="secondary" className="text-xs">
                    {activeBlog.category || 'Artikel'}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      activeBlog.status === 'Published'
                        ? 'text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-xs'
                        : 'text-amber-600 border-amber-500/30 bg-amber-500/10 text-xs'
                    }
                  >
                    {activeBlog.status || 'Published'}
                  </Badge>
                </div>
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  {activeBlog.title}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-primary" />
                    <span>{activeBlog.author_name || 'Admin'}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>
                      {new Date(activeBlog.published_at || activeBlog.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Gambar Sampul */}
                {resolveImageUrl(activeBlog) && (
                  <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30 aspect-video max-h-72 w-full flex items-center justify-center">
                    <img
                      src={resolveImageUrl(activeBlog)}
                      alt={activeBlog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Slug */}
                {activeBlog.slug && (
                  <div className="text-xs font-mono text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/60">
                    URL Slug: <span className="text-primary font-semibold">/{activeBlog.slug}</span>
                  </div>
                )}

                {/* Ringkasan */}
                {activeBlog.excerpt && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-foreground">Ringkasan</span>
                    <p className="text-sm text-muted-foreground italic border-l-2 border-primary pl-3 py-0.5">
                      "{activeBlog.excerpt}"
                    </p>
                  </div>
                )}

                {/* Konten Lengkap */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-foreground">Konten Artikel</span>
                  <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line bg-muted/20 p-4 rounded-xl border border-border/60 min-h-32">
                    {activeBlog.content || 'Belum ada konten yang ditulis.'}
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Tutup
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailOpen(false)
                    handleOpenEdit(activeBlog)
                  }}
                  className="gap-1.5"
                >
                  <Edit2 className="h-4 w-4" /> Edit Artikel
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── MODAL: TAMBAH ARTIKEL ── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Artikel Blog</DialogTitle>
            <DialogDescription>
              Tulis artikel atau wawasan baru untuk ditampilkan pada blog website Nyoman Undagi.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
            {formErrors.general && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formErrors.general}</span>
              </div>
            )}

            {/* Judul Artikel */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Judul Artikel <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Contoh: Inspirasi Desain Villa Tropis Modern di Bali"
                value={formTitle}
                onChange={handleTitleChange}
                required
              />
              {formErrors.title && <p className="text-[11px] text-destructive">{formErrors.title}</p>}
            </div>

            {/* Slug URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center justify-between">
                <span>URL Slug (Otomatis)</span>
                <span className="text-[10px] text-muted-foreground font-normal">Bisa diedit bila perlu</span>
              </label>
              <Input
                placeholder="inspirasi-desain-villa-tropis-modern-di-bali"
                value={formSlug}
                onChange={(e) => setFormSlug(generateSlug(e.target.value))}
                className="font-mono text-xs"
              />
              {formErrors.slug && <p className="text-[11px] text-destructive">{formErrors.slug}</p>}
            </div>

            {/* Kategori, Penulis & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Kategori</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground"
                >
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Penulis</label>
                <Input
                  placeholder="Nama Penulis"
                  value={formAuthorName}
                  onChange={(e) => setFormAuthorName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Status Publikasi</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground"
                >
                  <option value="Published">Published (Tayang)</option>
                  <option value="Draft">Draft (Draf)</option>
                </select>
              </div>
            </div>

            {/* Ringkasan Singkat / Excerpt */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Ringkasan / Excerpt
              </label>
              <textarea
                rows={2}
                placeholder="Tulis ringkasan 1-2 kalimat untuk preview di kartu blog..."
                value={formExcerpt}
                onChange={(e) => setFormExcerpt(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Konten Lengkap */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Konten Lengkap Artikel
              </label>
              <textarea
                rows={7}
                placeholder="Tulis isi artikel lengkap di sini..."
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-sans leading-relaxed"
              />
            </div>

            {/* Gambar Sampul (Thumbnail) */}
            <div className="space-y-2 border-t border-border/50 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">Gambar Sampul (Thumbnail)</label>
                <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg border border-border/50">
                  <button
                    type="button"
                    onClick={() => setImageMode('file')}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                      imageMode === 'file'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Unggah File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                      imageMode === 'url'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Gunakan URL
                  </button>
                </div>
              </div>

              {imageMode === 'file' ? (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {filePreview ? (
                    <div className="relative rounded-lg overflow-hidden border border-border bg-muted/30 aspect-video max-h-48 flex items-center justify-center">
                      <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null)
                          setFilePreview('')
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border/80 hover:border-primary/50 transition-colors rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-muted/10 hover:bg-muted/20"
                    >
                      <UploadCloud className="h-8 w-8 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">Klik untuk memilih gambar cover</span>
                      <span className="text-[11px] text-muted-foreground">Format JPG, PNG, WEBP (Maks 3MB)</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="https://example.com/gambar-artikel.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  {imageUrl && (
                    <div className="rounded-lg overflow-hidden border border-border aspect-video max-h-48 flex items-center justify-center bg-muted/20">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={submitting}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{submitting ? 'Menyimpan...' : 'Terbitkan Artikel'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: EDIT ARTIKEL ── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Artikel Blog</DialogTitle>
            <DialogDescription>
              Perbarui judul, ringkasan, atau isi artikel blog.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            {formErrors.general && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formErrors.general}</span>
              </div>
            )}

            {/* Judul Artikel */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Judul Artikel <span className="text-destructive">*</span>
              </label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
              />
              {formErrors.title && <p className="text-[11px] text-destructive">{formErrors.title}</p>}
            </div>

            {/* Slug URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">URL Slug</label>
              <Input
                value={formSlug}
                onChange={(e) => setFormSlug(generateSlug(e.target.value))}
                className="font-mono text-xs"
              />
              {formErrors.slug && <p className="text-[11px] text-destructive">{formErrors.slug}</p>}
            </div>

            {/* Kategori, Penulis & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Kategori</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground"
                >
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Penulis</label>
                <Input
                  value={formAuthorName}
                  onChange={(e) => setFormAuthorName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Status Publikasi</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground"
                >
                  <option value="Published">Published (Tayang)</option>
                  <option value="Draft">Draft (Draf)</option>
                </select>
              </div>
            </div>

            {/* Ringkasan Singkat / Excerpt */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Ringkasan / Excerpt</label>
              <textarea
                rows={2}
                value={formExcerpt}
                onChange={(e) => setFormExcerpt(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Konten Lengkap */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Konten Lengkap Artikel</label>
              <textarea
                rows={7}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-sans leading-relaxed"
              />
            </div>

            {/* Gambar Sampul (Thumbnail) */}
            <div className="space-y-2 border-t border-border/50 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">Gambar Sampul</label>
                <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg border border-border/50">
                  <button
                    type="button"
                    onClick={() => setImageMode('file')}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                      imageMode === 'file'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Unggah File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                      imageMode === 'url'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Gunakan URL
                  </button>
                </div>
              </div>

              {imageMode === 'file' ? (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {filePreview ? (
                    <div className="relative rounded-lg overflow-hidden border border-border bg-muted/30 aspect-video max-h-48 flex items-center justify-center">
                      <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null)
                          setFilePreview('')
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border/80 hover:border-primary/50 transition-colors rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-muted/10 hover:bg-muted/20"
                    >
                      <UploadCloud className="h-8 w-8 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">Pilih gambar pengganti</span>
                      <span className="text-[11px] text-muted-foreground">Biarkan kosong jika tidak ingin mengubah cover</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="https://example.com/gambar-artikel.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  {imageUrl && (
                    <div className="rounded-lg overflow-hidden border border-border aspect-video max-h-48 flex items-center justify-center bg-muted/20">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="pt-3">
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

      {/* ── MODAL: HAPUS ARTIKEL ── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              <span>Hapus Artikel?</span>
            </DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus artikel <strong className="text-foreground">"{activeBlog?.title}"</strong>?
              Tindakan ini tidak dapat dibatalkan.
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

      {/* ── MODAL: PREVIEW GAMBAR LENGKAP (LIGHTBOX) ── */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-3xl p-2 bg-black/95 border-neutral-800 text-white">
          <div className="relative flex flex-col items-center">
            {previewImageUrl && (
              <div className="w-full max-h-[75vh] overflow-hidden rounded-lg flex items-center justify-center bg-black">
                <img
                  src={previewImageUrl}
                  alt="Preview"
                  className="max-h-[75vh] w-auto object-contain"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
