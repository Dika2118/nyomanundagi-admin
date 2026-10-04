import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  FolderTree,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  Calendar,
  MoreVertical,
  Eye,
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

export default function ProjectCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)

  // Form states
  const [formName, setFormName] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Fetch categories from backend with search parameter
  const fetchCategories = async (searchQuery = '') => {
    try {
      setLoading(true)
      const params = {}
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }
      const res = await api.get('/project-categories', { params })
      setCategories(res.data?.data || res.data || [])
    } catch (err) {
      console.error('Failed to load project categories', err)
    } finally {
      setLoading(false)
    }
  }

  // Debounced search to backend
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories(search)
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  const handleOpenAdd = () => {
    setFormName('')
    setFormErrors({})
    setIsAddOpen(true)
  }

  const handleOpenDetail = (category) => {
    setActiveCategory(category)
    setIsDetailOpen(true)
  }

  const handleOpenEdit = (category) => {
    setActiveCategory(category)
    setFormName(category.name || '')
    setFormErrors({})
    setIsEditOpen(true)
  }

  const handleOpenDelete = (category) => {
    setActiveCategory(category)
    setIsDeleteOpen(true)
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!formName.trim()) {
      setFormErrors({ name: 'Nama kategori wajib diisi.' })
      return
    }

    try {
      setSubmitting(true)
      setFormErrors({})
      await api.post('/project-categories', { name: formName.trim() })
      setIsAddOpen(false)
      setFormName('')
      await fetchCategories(search)
    } catch (err) {
      console.error('Error adding category:', err)
      const message = err.response?.data?.message || 'Gagal menambahkan kategori.'
      const validationErrors = err.response?.data?.errors || {}
      setFormErrors({
        general: message,
        name: validationErrors.name?.[0],
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!activeCategory) return
    if (!formName.trim()) {
      setFormErrors({ name: 'Nama kategori wajib diisi.' })
      return
    }

    try {
      setSubmitting(true)
      setFormErrors({})
      await api.put(`/project-categories/${activeCategory.id}`, { name: formName.trim() })
      setIsEditOpen(false)
      setActiveCategory(null)
      setFormName('')
      await fetchCategories(search)
    } catch (err) {
      console.error('Error updating category:', err)
      const message = err.response?.data?.message || 'Gagal memperbarui kategori.'
      const validationErrors = err.response?.data?.errors || {}
      setFormErrors({
        general: message,
        name: validationErrors.name?.[0],
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!activeCategory) return
    try {
      setDeleting(true)
      await api.delete(`/project-categories/${activeCategory.id}`)
      setIsDeleteOpen(false)
      setActiveCategory(null)
      await fetchCategories(search)
    } catch (err) {
      console.error('Error deleting category:', err)
      alert(err.response?.data?.message || 'Gagal menghapus kategori.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Categories</h1>
          <p className="text-sm text-muted-foreground">
            Kelola kategori untuk klasifikasi proyek & portofolio.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 cursor-pointer">
          <Plus className="h-4 w-4" />
          <span>Tambah Kategori</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari kategori di backend..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
              <span>
                Total: <strong>{categories.length}</strong> kategori
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
                  <th className="px-4 py-3">Nama Kategori</th>
                  <th className="px-4 py-3 w-40">Jumlah Proyek</th>
                  <th className="px-4 py-3 w-44">Tanggal Dibuat</th>
                  <th className="px-4 py-3 text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && categories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-xs">Memuat data kategori dari server...</span>
                      </div>
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FolderTree className="h-8 w-8 text-muted-foreground/50" />
                        <span className="text-sm font-medium">Belum ada kategori ditemukan.</span>
                        {search ? (
                          <span className="text-xs">Tidak ada hasil yang cocok dengan "{search}".</span>
                        ) : (
                          <Button variant="outline" size="sm" onClick={handleOpenAdd} className="mt-2 gap-1.5">
                            <Plus className="h-3.5 w-3.5" /> Tambah Kategori Pertama
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  categories.map((cat, index) => (
                    <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-center text-xs font-mono font-medium text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-2">
                        <FolderTree className="h-4 w-4 text-primary shrink-0" />
                        <span>{cat.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {cat.projects_count ?? 0} proyek
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {cat.created_at ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 text-muted-foreground/70" />
                            <span>{new Date(cat.created_at).toLocaleDateString('id-ID')}</span>
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
                              onClick={() => handleOpenDetail(cat)}
                              className="cursor-pointer gap-2 py-2"
                            >
                              <Eye className="h-4 w-4 text-primary" />
                              <span>Lihat Detail</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleOpenEdit(cat)}
                              className="cursor-pointer gap-2 py-2"
                            >
                              <Edit2 className="h-4 w-4 text-muted-foreground" />
                              <span>Edit Kategori</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => handleOpenDelete(cat)}
                              variant="destructive"
                              className="cursor-pointer gap-2 py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Hapus Kategori</span>
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

      {/* ── MODAL: TAMBAH KATEGORI ── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Kategori Proyek</DialogTitle>
            <DialogDescription>Tambahkan nama kategori baru untuk proyek arsitektur.</DialogDescription>
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
                Nama Kategori <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Misal: Villa & Resort, Komersial, Residensial"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className={formErrors.name ? 'border-destructive' : ''}
              />
              {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={submitting}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{submitting ? 'Menyimpan...' : 'Simpan Kategori'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: EDIT KATEGORI ── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Kategori</DialogTitle>
            <DialogDescription>Perbarui nama kategori proyek.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Nama Kategori <span className="text-destructive">*</span>
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className={formErrors.name ? 'border-destructive' : ''}
              />
              {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
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

      {/* ── MODAL: HAPUS KATEGORI ── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              <span>Hapus Kategori?</span>
            </DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus kategori <strong className="text-foreground">"{activeCategory?.name}"</strong>?
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
      {/* ── MODAL: LIHAT DETAIL KATEGORI ── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md">
          {activeCategory && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl border border-primary/20 bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <FolderTree className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold">
                      {activeCategory.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Total proyek: <Badge variant="secondary" className="font-mono text-xs ml-1">{activeCategory.projects_count ?? 0} proyek</Badge>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-3 py-2 text-xs">
                {activeCategory.created_at && (
                  <div className="flex items-center gap-2 text-muted-foreground pt-1 border-t border-border/40">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Dibuat pada: {new Date(activeCategory.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
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
                    handleOpenEdit(activeCategory)
                  }}
                  className="gap-1.5"
                >
                  <Edit2 className="h-4 w-4" /> Edit Kategori
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
