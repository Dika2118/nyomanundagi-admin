import { useState, useEffect, useRef } from 'react'
import {
  Plus,
  Search,
  FolderKanban,
  Edit2,
  Trash2,
  Star,
  Image as ImageIcon,
  Images,
  Loader2,
  AlertCircle,
  UploadCloud,
  X,
  Filter,
  ExternalLink,
  MoreVertical,
  Eye,
  MapPin,
  User,
  Calendar,
  Maximize2,
  Building,
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

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [activeProject, setActiveProject] = useState(null)

  // Detail Modal state
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [detailProject, setDetailProject] = useState(null)

  // Gallery Modal states
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [galleryProject, setGalleryProject] = useState(null)
  const [galleryImages, setGalleryImages] = useState([])
  const [loadingGallery, setLoadingGallery] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [deletingImageId, setDeletingImageId] = useState(null)
  const [galleryFile, setGalleryFile] = useState(null)
  const [galleryPreview, setGalleryPreview] = useState('')
  const [galleryCaption, setGalleryCaption] = useState('')
  const [galleryError, setGalleryError] = useState('')

  // Preview Image state (Lightbox)
  const [previewImageUrl, setPreviewImageUrl] = useState('')
  const [previewImageTitle, setPreviewImageTitle] = useState('')

  // Form states
  const [formTitle, setFormTitle] = useState('')
  const [formCategoryId, setFormCategoryId] = useState('')
  const [formClient, setFormClient] = useState('')
  const [formLocation, setFormLocation] = useState('')
  const [formYear, setFormYear] = useState('')
  const [formLandArea, setFormLandArea] = useState('')
  const [formBuildingArea, setFormBuildingArea] = useState('')
  const [formStatus, setFormStatus] = useState('Berjalan')
  const [formIsFeatured, setFormIsFeatured] = useState(false)
  const [formShortDescription, setFormShortDescription] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fileInputRef = useRef(null)
  const galleryFileInputRef = useRef(null)

  // Fetch categories for filter dropdown & form
  const fetchCategories = async () => {
    try {
      const res = await api.get('/project-categories')
      setCategories(res.data?.data || res.data || [])
    } catch (err) {
      console.error('Failed to load categories', err)
    }
  }

  // Fetch projects from backend with filters & search params
  const fetchProjects = async (searchQuery = '', catId = '', stat = '') => {
    try {
      setLoading(true)
      const params = {
        all: true,
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }
      if (catId) {
        params.category_id = catId
      }
      if (stat) {
        params.status = stat
      }

      const res = await api.get('/projects', { params })
      const data = res.data?.data
      if (Array.isArray(data)) {
        setProjects(data)
      } else if (data?.data && Array.isArray(data.data)) {
        setProjects(data.data)
      } else {
        setProjects([])
      }
    } catch (err) {
      console.error('Failed to load projects', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Debounced search & filter to backend
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects(search, selectedCategory, selectedStatus)
    }, 350)
    return () => clearTimeout(timer)
  }, [search, selectedCategory, selectedStatus])

  const resolveThumbnailUrl = (project) => {
    if (!project) return ''
    if (project.thumbnail_url) return project.thumbnail_url
    if (!project.thumbnail) return ''
    if (project.thumbnail.startsWith('http://') || project.thumbnail.startsWith('https://')) {
      return project.thumbnail
    }
    const storageUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'
    return `${storageUrl.replace(/\/$/, '')}/${project.thumbnail.replace(/^\//, '')}`
  }

  const resolveGalleryUrl = (img) => {
    if (!img) return ''
    if (img.image_url) return img.image_url
    if (!img.image) return ''
    if (img.image.startsWith('http://') || img.image.startsWith('https://')) {
      return img.image
    }
    const storageUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'
    return `${storageUrl.replace(/\/$/, '')}/${img.image.replace(/^\//, '')}`
  }

  const resetForm = () => {
    setFormTitle('')
    setFormCategoryId('')
    setFormClient('')
    setFormLocation('')
    setFormYear(new Date().getFullYear().toString())
    setFormLandArea('')
    setFormBuildingArea('')
    setFormStatus('Berjalan')
    setFormIsFeatured(false)
    setFormShortDescription('')
    setFormDescription('')
    setThumbnailFile(null)
    setThumbnailPreview('')
    setFormErrors({})
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleOpenAdd = () => {
    resetForm()
    setIsAddOpen(true)
  }

  const handleOpenEdit = (project) => {
    resetForm()
    setActiveProject(project)
    setFormTitle(project.title || '')
    setFormCategoryId(project.category_id ? String(project.category_id) : '')
    setFormClient(project.client_name || '')
    setFormLocation(project.location || '')
    setFormYear(project.year || '')
    setFormLandArea(project.land_area || '')
    setFormBuildingArea(project.building_area || '')
    setFormStatus(project.status || 'Berjalan')
    setFormIsFeatured(Boolean(project.is_featured))
    setFormShortDescription(project.short_description || '')
    setFormDescription(project.description || '')
    setThumbnailPreview(resolveThumbnailUrl(project))
    setIsEditOpen(true)
  }

  const handleOpenDelete = (project) => {
    setActiveProject(project)
    setIsDeleteOpen(true)
  }

  // ── Detail Handler ──
  const handleOpenDetail = (project) => {
    setDetailProject(project)
    setIsDetailOpen(true)
  }

  // ── Gallery Handlers ──
  const fetchGalleryImages = async (projectId) => {
    try {
      setLoadingGallery(true)
      const res = await api.get('/project-images', { params: { project_id: projectId } })
      setGalleryImages(res.data?.data || [])
    } catch (err) {
      console.error('Failed to load gallery images', err)
    } finally {
      setLoadingGallery(false)
    }
  }

  const handleOpenGallery = (project) => {
    setGalleryProject(project)
    setGalleryFile(null)
    setGalleryPreview('')
    setGalleryCaption('')
    setGalleryError('')
    if (galleryFileInputRef.current) {
      galleryFileInputRef.current.value = ''
    }
    setIsGalleryOpen(true)
    fetchGalleryImages(project.id)
  }

  const handleGalleryFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setGalleryError('File harus berupa gambar (JPG, PNG, WebP).')
        return
      }
      setGalleryFile(file)
      setGalleryPreview(URL.createObjectURL(file))
      setGalleryError('')
    }
  }

  const handleUploadGalleryImage = async (e) => {
    e.preventDefault()
    if (!galleryProject || !galleryFile) {
      setGalleryError('Pilih file foto terlebih dahulu.')
      return
    }

    try {
      setUploadingGallery(true)
      setGalleryError('')

      const formData = new FormData()
      formData.append('project_id', galleryProject.id)
      formData.append('image', galleryFile)
      if (galleryCaption.trim()) {
        formData.append('caption', galleryCaption.trim())
      }

      await api.post('/project-images', formData)

      setGalleryFile(null)
      setGalleryPreview('')
      setGalleryCaption('')
      if (galleryFileInputRef.current) {
        galleryFileInputRef.current.value = ''
      }

      // Refresh gallery images and refresh projects list to keep counts updated
      await fetchGalleryImages(galleryProject.id)
      fetchProjects(search, selectedCategory, selectedStatus)
    } catch (err) {
      console.error('Error uploading gallery image:', err)
      setGalleryError(err.response?.data?.message || 'Gagal mengunggah foto ke galeri.')
    } finally {
      setUploadingGallery(false)
    }
  }

  const handleDeleteGalleryImage = async (imageId) => {
    try {
      setDeletingImageId(imageId)
      await api.delete(`/project-images/${imageId}`)
      setGalleryImages((prev) => prev.filter((img) => img.id !== imageId))
      fetchProjects(search, selectedCategory, selectedStatus)
    } catch (err) {
      console.error('Error deleting gallery image:', err)
      alert(err.response?.data?.message || 'Gagal menghapus foto dari galeri.')
    } finally {
      setDeletingImageId(null)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailFile(file)
      setThumbnailPreview(URL.createObjectURL(file))
    }
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      setFormErrors({ title: 'Judul proyek wajib diisi.' })
      return
    }

    try {
      setSubmitting(true)
      setFormErrors({})

      const formData = new FormData()
      formData.append('title', formTitle.trim())
      if (formCategoryId) formData.append('category_id', formCategoryId)
      if (formClient.trim()) formData.append('client_name', formClient.trim())
      if (formLocation.trim()) formData.append('location', formLocation.trim())
      if (formYear.trim()) formData.append('year', formYear.trim())
      if (formLandArea.trim()) formData.append('land_area', formLandArea.trim())
      if (formBuildingArea.trim()) formData.append('building_area', formBuildingArea.trim())
      formData.append('status', formStatus)
      formData.append('is_featured', formIsFeatured ? '1' : '0')
      if (formShortDescription.trim()) formData.append('short_description', formShortDescription.trim())
      if (formDescription.trim()) formData.append('description', formDescription.trim())
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile)
      }

      await api.post('/projects', formData)

      setIsAddOpen(false)
      resetForm()
      await fetchProjects(search, selectedCategory, selectedStatus)
    } catch (err) {
      console.error('Error adding project:', err)
      const message = err.response?.data?.message || 'Gagal menambahkan proyek.'
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
    if (!activeProject) return

    if (!formTitle.trim()) {
      setFormErrors({ title: 'Judul proyek wajib diisi.' })
      return
    }

    try {
      setSubmitting(true)
      setFormErrors({})

      if (thumbnailFile) {
        const formData = new FormData()
        formData.append('_method', 'PUT')
        formData.append('title', formTitle.trim())
        if (formCategoryId) formData.append('category_id', formCategoryId)
        if (formClient.trim()) formData.append('client_name', formClient.trim())
        if (formLocation.trim()) formData.append('location', formLocation.trim())
        if (formYear.trim()) formData.append('year', formYear.trim())
        if (formLandArea.trim()) formData.append('land_area', formLandArea.trim())
        if (formBuildingArea.trim()) formData.append('building_area', formBuildingArea.trim())
        formData.append('status', formStatus)
        formData.append('is_featured', formIsFeatured ? '1' : '0')
        if (formShortDescription.trim()) formData.append('short_description', formShortDescription.trim())
        if (formDescription.trim()) formData.append('description', formDescription.trim())
        formData.append('thumbnail', thumbnailFile)

        await api.post(`/projects/${activeProject.id}`, formData)
      } else {
        await api.put(`/projects/${activeProject.id}`, {
          title: formTitle.trim(),
          category_id: formCategoryId ? parseInt(formCategoryId, 10) : null,
          client_name: formClient.trim() || null,
          location: formLocation.trim() || null,
          year: formYear.trim() || null,
          land_area: formLandArea.trim() || null,
          building_area: formBuildingArea.trim() || null,
          status: formStatus,
          is_featured: formIsFeatured,
          short_description: formShortDescription.trim() || null,
          description: formDescription.trim() || null,
        })
      }

      setIsEditOpen(false)
      resetForm()
      setActiveProject(null)
      await fetchProjects(search, selectedCategory, selectedStatus)
    } catch (err) {
      console.error('Error updating project:', err)
      const message = err.response?.data?.message || 'Gagal memperbarui proyek.'
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
    if (!activeProject) return
    try {
      setDeleting(true)
      await api.delete(`/projects/${activeProject.id}`)
      setIsDeleteOpen(false)
      setActiveProject(null)
      await fetchProjects(search, selectedCategory, selectedStatus)
    } catch (err) {
      console.error('Error deleting project:', err)
      alert(err.response?.data?.message || 'Gagal menghapus proyek.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Kelola portofolio karya arsitektur, foto sampul, dan galeri dokumentasi proyek.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 cursor-pointer">
          <Plus className="h-4 w-4" />
          <span>Tambah Proyek</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Backend Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari proyek di backend..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Backend Filters: Category & Status */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                <span>Filter:</span>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Semua Status</option>
                <option value="Perencanaan">Perencanaan</option>
                <option value="Berjalan">Berjalan</option>
                <option value="Selesai">Selesai</option>
              </select>

              {(selectedCategory || selectedStatus || search) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch('')
                    setSelectedCategory('')
                    setSelectedStatus('')
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
                Total: <strong>{projects.length}</strong> proyek
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
                  <th className="px-4 py-3 w-20">Sampul</th>
                  <th className="px-4 py-3">Judul Proyek</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Klien & Lokasi</th>
                  <th className="px-4 py-3 w-20">Tahun</th>
                  <th className="px-4 py-3 w-24">Featured</th>
                  <th className="px-4 py-3 w-28">Status</th>
                  <th className="px-4 py-3 text-right w-20 pr-6">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && projects.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-xs">Memuat data proyek dari server...</span>
                      </div>
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FolderKanban className="h-8 w-8 text-muted-foreground/50" />
                        <span className="text-sm font-medium">Belum ada proyek ditemukan.</span>
                        {search || selectedCategory || selectedStatus ? (
                          <span className="text-xs">Tidak ada hasil yang cocok dengan kriteria filter.</span>
                        ) : (
                          <Button variant="outline" size="sm" onClick={handleOpenAdd} className="mt-2 gap-1.5">
                            <Plus className="h-3.5 w-3.5" /> Tambah Proyek Pertama
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  projects.map((project, index) => {
                    const thumb = resolveThumbnailUrl(project)
                    const galleryCount = project.images?.length ?? 0
                    return (
                      <tr key={project.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-center text-xs font-mono font-medium text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (thumb) {
                                setPreviewImageUrl(thumb)
                                setPreviewImageTitle(project.title)
                              }
                            }}
                            className="group relative h-12 w-16 rounded-md bg-muted overflow-hidden border border-border flex items-center justify-center cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                            title="Klik untuk melihat foto sampul"
                          >
                            {thumb ? (
                              <>
                                <img src={thumb} alt={project.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </div>
                              </>
                            ) : (
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          <div className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer" onClick={() => handleOpenDetail(project)}>
                            {project.title}
                          </div>
                          {project.short_description && (
                            <div className="text-xs text-muted-foreground line-clamp-1">{project.short_description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="secondary" className="font-normal text-[11px]">
                              {project.category?.name || 'Umum'}
                            </Badge>
                            {galleryCount > 0 && (
                              <button
                                type="button"
                                onClick={() => handleOpenGallery(project)}
                                className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors bg-muted/60 px-1.5 py-0.5 rounded"
                                title={`${galleryCount} foto galeri`}
                              >
                                <Images className="h-3 w-3" />
                                <span>{galleryCount}</span>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          <div>{project.client_name || '-'}</div>
                          <div className="text-[11px]">{project.location || '-'}</div>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono">{project.year || '-'}</td>
                        <td className="px-4 py-3">
                          {project.is_featured ? (
                            <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10 text-[11px] gap-1">
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Ya
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={
                              project.status === 'Selesai'
                                ? 'text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-[11px]'
                                : project.status === 'Berjalan'
                                ? 'text-blue-600 border-blue-500/30 bg-blue-500/10 text-[11px]'
                                : 'text-amber-600 border-amber-500/30 bg-amber-500/10 text-[11px]'
                            }
                          >
                            {project.status || 'Berjalan'}
                          </Badge>
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
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleOpenDetail(project)}
                                className="cursor-pointer gap-2 py-2"
                              >
                                <Eye className="h-4 w-4 text-primary" />
                                <span>Lihat Detail</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => handleOpenGallery(project)}
                                className="cursor-pointer gap-2 py-2"
                              >
                                <Images className="h-4 w-4 text-muted-foreground" />
                                <span>Kelola Galeri ({galleryCount})</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => handleOpenEdit(project)}
                                className="cursor-pointer gap-2 py-2"
                              >
                                <Edit2 className="h-4 w-4 text-muted-foreground" />
                                <span>Edit Proyek</span>
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => handleOpenDelete(project)}
                                variant="destructive"
                                className="cursor-pointer gap-2 py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Hapus Proyek</span>
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

      {/* ── MODAL: LIHAT DETAIL PROYEK ── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          {detailProject && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <Badge variant="secondary" className="text-xs font-normal">
                    {detailProject.category?.name || 'Umum'}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      detailProject.status === 'Selesai'
                        ? 'text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-xs'
                        : detailProject.status === 'Berjalan'
                        ? 'text-blue-600 border-blue-500/30 bg-blue-500/10 text-xs'
                        : 'text-amber-600 border-amber-500/30 bg-amber-500/10 text-xs'
                    }
                  >
                    {detailProject.status || 'Berjalan'}
                  </Badge>
                  {detailProject.is_featured && (
                    <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10 text-xs gap-1">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Unggulan (Featured)
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {detailProject.title}
                </DialogTitle>
                {detailProject.location && (
                  <DialogDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{detailProject.location} {detailProject.year ? `• Tahun ${detailProject.year}` : ''}</span>
                  </DialogDescription>
                )}
              </DialogHeader>

              <div className="space-y-5 py-3">
                {/* Foto Sampul */}
                {resolveThumbnailUrl(detailProject) && (
                  <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30 aspect-video max-h-72 w-full flex items-center justify-center">
                    <img
                      src={resolveThumbnailUrl(detailProject)}
                      alt={detailProject.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Spesifikasi / Rincian Singkat Proyek */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 p-3.5 rounded-xl border border-border/70 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-primary" /> Klien
                    </span>
                    <p className="font-semibold text-foreground text-sm">{detailProject.client_name || '-'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-primary" /> Tahun
                    </span>
                    <p className="font-semibold text-foreground text-sm">{detailProject.year || '-'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 text-primary" /> Luas Tanah
                    </span>
                    <p className="font-semibold text-foreground text-sm">{detailProject.land_area || '-'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 text-primary" /> Luas Bangunan
                    </span>
                    <p className="font-semibold text-foreground text-sm">{detailProject.building_area || '-'}</p>
                  </div>
                </div>

                {/* Ringkasan & Deskripsi */}
                {detailProject.short_description && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-foreground">Ringkasan</span>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {detailProject.short_description}
                    </p>
                  </div>
                )}

                {detailProject.description && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-foreground">Deskripsi Lengkap</span>
                    <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line bg-muted/20 p-3 rounded-lg border border-border/50">
                      {detailProject.description}
                    </div>
                  </div>
                )}

                {/* Foto Galeri Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Images className="h-4 w-4 text-primary" />
                      <span>Galeri Foto ({detailProject.images?.length ?? 0})</span>
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsDetailOpen(false)
                        handleOpenGallery(detailProject)
                      }}
                      className="h-7 text-xs gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> Kelola Galeri
                    </Button>
                  </div>

                  {detailProject.images && detailProject.images.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {detailProject.images.map((img) => {
                        const imgUrl = resolveGalleryUrl(img)
                        return (
                          <div
                            key={img.id}
                            onClick={() => {
                              setPreviewImageUrl(imgUrl)
                              setPreviewImageTitle(img.caption || detailProject.title)
                            }}
                            className="group relative rounded-lg overflow-hidden border border-border aspect-video bg-muted cursor-pointer"
                          >
                            <img src={imgUrl} alt={img.caption || ''} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                              <ExternalLink className="h-3 w-3" />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-lg border border-border/40 text-center">
                      Belum ada foto dokumentasi tambahan pada galeri proyek ini.
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter className="pt-2 flex flex-col sm:flex-row sm:justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDetailOpen(false)
                      handleOpenGallery(detailProject)
                    }}
                    className="gap-1.5 text-xs"
                  >
                    <Images className="h-3.5 w-3.5" />
                    <span>Galeri Foto</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDetailOpen(false)
                      handleOpenEdit(detailProject)
                    }}
                    className="gap-1.5 text-xs"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit Proyek</span>
                  </Button>
                </div>
                <Button type="button" variant="default" onClick={() => setIsDetailOpen(false)}>
                  Tutup
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── MODAL: KELOLA GALERI FOTO PROYEK ── */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Images className="h-5 w-5 text-primary" />
              <span>Galeri Foto: {galleryProject?.title}</span>
            </DialogTitle>
            <DialogDescription>
              Kelola dan unggah dokumentasi foto-foto detail (interior, eksterior, fasad) untuk proyek ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Form Upload Foto Baru */}
            <form onSubmit={handleUploadGalleryImage} className="border border-border/80 rounded-xl p-4 bg-muted/20 space-y-3">
              <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Tambah Foto Baru ke Galeri</span>
                <span className="text-muted-foreground font-normal">Format JPG, PNG, WEBP</span>
              </div>

              {galleryError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{galleryError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-start">
                <div className="space-y-2">
                  <div
                    onClick={() => galleryFileInputRef.current?.click()}
                    className="border border-dashed rounded-lg p-3 text-center cursor-pointer hover:bg-muted/40 text-xs text-muted-foreground flex items-center justify-center gap-2 h-10 transition-colors"
                  >
                    <UploadCloud className="h-4 w-4 text-primary" />
                    <span className="truncate">{galleryFile ? galleryFile.name : 'Pilih file foto galeri...'}</span>
                  </div>
                  <input
                    ref={galleryFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryFileChange}
                    className="hidden"
                  />

                  <Input
                    placeholder="Keterangan / Caption foto (opsional, misal: Tampak Kolam Renang & Fasad)"
                    value={galleryCaption}
                    onChange={(e) => setGalleryCaption(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="flex sm:flex-col gap-2">
                  {galleryPreview && (
                    <div className="relative rounded-lg overflow-hidden border border-border w-24 h-16 bg-muted/50 shrink-0">
                      <img src={galleryPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setGalleryFile(null)
                          setGalleryPreview('')
                          if (galleryFileInputRef.current) galleryFileInputRef.current.value = ''
                        }}
                        className="absolute top-1 right-1 h-4 w-4 rounded-full bg-black/70 text-white flex items-center justify-center text-[10px]"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="sm"
                    disabled={uploadingGallery || !galleryFile}
                    className="h-9 gap-1.5 text-xs cursor-pointer w-full"
                  >
                    {uploadingGallery ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                    <span>{uploadingGallery ? 'Mengunggah...' : 'Unggah Foto'}</span>
                  </Button>
                </div>
              </div>
            </form>

            {/* List Foto Galeri */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Daftar Foto Galeri ({galleryImages.length})</span>
                {loadingGallery && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
              </div>

              {loadingGallery ? (
                <div className="py-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span>Memuat galeri foto...</span>
                </div>
              ) : galleryImages.length === 0 ? (
                <div className="py-12 border border-dashed rounded-xl text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-1.5">
                  <Images className="h-8 w-8 text-muted-foreground/40" />
                  <span className="font-medium text-foreground">Belum ada foto galeri untuk proyek ini.</span>
                  <p>Gunakan formulir di atas untuk mengunggah foto dokumentasi proyek.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {galleryImages.map((img) => {
                    const imgUrl = resolveGalleryUrl(img)
                    const isDeleting = deletingImageId === img.id
                    return (
                      <div
                        key={img.id}
                        className="group relative rounded-xl overflow-hidden border border-border bg-muted/30 flex flex-col transition-all hover:shadow-md"
                      >
                        <div
                          onClick={() => {
                            setPreviewImageUrl(imgUrl)
                            setPreviewImageTitle(img.caption || galleryProject?.title || 'Foto Galeri')
                          }}
                          className="relative aspect-video w-full overflow-hidden cursor-pointer bg-muted flex items-center justify-center"
                        >
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={img.caption || 'Foto Galeri'}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          )}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <ExternalLink className="h-4 w-4" />
                          </div>
                        </div>

                        {/* Caption & Delete Button */}
                        <div className="p-2.5 flex items-center justify-between gap-2 bg-card text-xs">
                          <span className="truncate text-muted-foreground text-[11px]" title={img.caption || 'Tanpa keterangan'}>
                            {img.caption || <span className="italic text-muted-foreground/60">Tanpa keterangan</span>}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteGalleryImage(img.id)}
                            disabled={isDeleting}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
                            title="Hapus foto ini"
                          >
                            {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setIsGalleryOpen(false)}>
              Selesai / Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: LIGHTBOX IMAGE PREVIEW ── */}
      <Dialog open={Boolean(previewImageUrl)} onOpenChange={(open) => !open && setPreviewImageUrl('')}>
        <DialogContent className="sm:max-w-3xl p-2 bg-black/95 border-neutral-800 text-white">
          <div className="relative flex flex-col items-center">
            {previewImageUrl && (
              <>
                <div className="w-full max-h-[75vh] overflow-hidden rounded-lg flex items-center justify-center bg-black">
                  <img
                    src={previewImageUrl}
                    alt={previewImageTitle || 'Preview'}
                    className="max-h-[75vh] w-auto object-contain"
                  />
                </div>
                {previewImageTitle && (
                  <div className="p-3 w-full text-left">
                    <h3 className="font-semibold text-sm text-white">{previewImageTitle}</h3>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: TAMBAH PROYEK ── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Proyek Baru</DialogTitle>
            <DialogDescription>Tambahkan proyek portofolio baru ke sistem.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
            {formErrors.general && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formErrors.general}</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">
                  Judul Proyek <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Misal: Villa Ombak Luxury Residence"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className={formErrors.title ? 'border-destructive' : ''}
                />
                {formErrors.title && <p className="text-xs text-destructive">{formErrors.title}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Kategori</label>
                <select
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Status Pengerjaan</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="Perencanaan">Perencanaan</option>
                  <option value="Berjalan">Berjalan</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Nama Klien</label>
                <Input placeholder="Misal: Bapak Wayan" value={formClient} onChange={(e) => setFormClient(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Lokasi</label>
                <Input placeholder="Misal: Canggu, Bali" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Tahun Selesai / Mulai</label>
                <Input placeholder="Misal: 2026" value={formYear} onChange={(e) => setFormYear(e.target.value)} />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={formIsFeatured}
                  onChange={(e) => setFormIsFeatured(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="featured-check" className="text-xs font-medium cursor-pointer">
                  Tampilkan sebagai Proyek Unggulan (Featured)
                </label>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">Ringkasan Singkat</label>
                <Input
                  placeholder="Ringkasan 1-2 kalimat untuk kartu proyek"
                  value={formShortDescription}
                  onChange={(e) => setFormShortDescription(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">Foto Sampul (Thumbnail)</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed rounded-lg p-3 text-center cursor-pointer hover:bg-muted/30 text-xs text-muted-foreground flex items-center justify-center gap-1.5 h-11"
                >
                  <UploadCloud className="h-4 w-4 text-primary" />
                  <span>{thumbnailFile ? thumbnailFile.name : 'Pilih file foto sampul proyek'}</span>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                {thumbnailPreview && (
                  <div className="relative rounded-lg overflow-hidden border border-border w-28 h-20 bg-muted/40 mt-2">
                    <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={submitting}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{submitting ? 'Menyimpan...' : 'Simpan Proyek'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: EDIT PROYEK ── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Proyek</DialogTitle>
            <DialogDescription>Perbarui informasi portofolio proyek.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">
                  Judul Proyek <span className="text-destructive">*</span>
                </label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className={formErrors.title ? 'border-destructive' : ''}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Kategori</label>
                <select
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Status Pengerjaan</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="Perencanaan">Perencanaan</option>
                  <option value="Berjalan">Berjalan</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Nama Klien</label>
                <Input value={formClient} onChange={(e) => setFormClient(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Lokasi</label>
                <Input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Tahun</label>
                <Input value={formYear} onChange={(e) => setFormYear(e.target.value)} />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="featured-check-edit"
                  checked={formIsFeatured}
                  onChange={(e) => setFormIsFeatured(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="featured-check-edit" className="text-xs font-medium cursor-pointer">
                  Tampilkan sebagai Proyek Unggulan (Featured)
                </label>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">Ringkasan Singkat</label>
                <Input
                  value={formShortDescription}
                  onChange={(e) => setFormShortDescription(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">Deskripsi Lengkap</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">Ganti Foto Sampul</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed rounded-lg p-3 text-center cursor-pointer hover:bg-muted/30 text-xs text-muted-foreground flex items-center justify-center gap-1.5 h-11"
                >
                  <UploadCloud className="h-4 w-4 text-primary" />
                  <span>{thumbnailFile ? thumbnailFile.name : 'Pilih file foto baru'}</span>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                {thumbnailPreview && (
                  <div className="relative rounded-lg overflow-hidden border border-border w-28 h-20 bg-muted/40 mt-2">
                    <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
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

      {/* ── MODAL: HAPUS PROYEK ── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              <span>Hapus Proyek?</span>
            </DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus portofolio <strong className="text-foreground">"{activeProject?.title}"</strong>?
              Semua foto galeri yang terhubung juga akan dihapus.
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
    </div>
  )
}
