import { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  Check,
  X,
  GripVertical,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import api from '@/api/axios'

const emptyForm = {
  title: '',
  slug: '',
  content: '',
  order: '',
  is_active: true,
  last_updated_label: '',
}

export default function PrivacyPolicy() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)

  // Form/Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [activeSection, setActiveSection] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchSections = async () => {
    try {
      setLoading(true)
      const res = await api.get('/privacy-policy-sections', { params: { all: true } })
      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : res.data?.data?.data || []
      setSections(data)
    } catch (err) {
      console.error('Failed to load privacy policy sections', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSections()
  }, [])

  // ─── Open Create ──────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setActiveSection(null)
    setForm({
      ...emptyForm,
      last_updated_label: new Date().toISOString().substring(0, 10),
    })
    setFormErrors({})
    setIsFormOpen(true)
  }

  // ─── Open Edit ────────────────────────────────────────────────────────────
  const handleOpenEdit = (section) => {
    setActiveSection(section)
    setForm({
      title: section.title || '',
      slug: section.slug || '',
      content: section.content || '',
      order: section.order ?? '',
      is_active: section.is_active ?? true,
      last_updated_label: section.last_updated_label
        ? section.last_updated_label.substring(0, 10)
        : '',
    })
    setFormErrors({})
    setIsFormOpen(true)
  }

  // ─── Open Delete ──────────────────────────────────────────────────────────
  const handleOpenDelete = (section) => {
    setActiveSection(section)
    setIsDeleteOpen(true)
  }

  // ─── Validate ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errors = {}
    if (!form.title.trim()) errors.title = 'Judul wajib diisi.'
    if (!form.content.trim()) errors.content = 'Konten wajib diisi.'
    return errors
  }

  // ─── Submit (Create / Edit) ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      is_active: form.is_active,
      ...(form.slug.trim() && { slug: form.slug.trim() }),
      ...(form.order !== '' && { order: parseInt(form.order, 10) }),
      ...(form.last_updated_label && { last_updated_label: form.last_updated_label }),
    }

    try {
      setSubmitting(true)
      setFormErrors({})
      if (activeSection) {
        await api.put(`/privacy-policy-sections/${activeSection.id}`, payload)
      } else {
        await api.post('/privacy-policy-sections', payload)
      }
      setIsFormOpen(false)
      await fetchSections()
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal menyimpan perubahan.'
      setFormErrors({ general: message })
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!activeSection) return
    try {
      await api.delete(`/privacy-policy-sections/${activeSection.id}`)
      setIsDeleteOpen(false)
      await fetchSections()
    } catch (err) {
      console.error('Delete failed', err)
    }
  }

  // ─── Toggle Active ────────────────────────────────────────────────────────
  const handleToggleActive = async (section) => {
    try {
      await api.put(`/privacy-policy-sections/${section.id}`, {
        is_active: !section.is_active,
      })
      await fetchSections()
    } catch (err) {
      console.error('Toggle active failed', err)
    }
  }

  // ─── Reorder (up / down) ──────────────────────────────────────────────────
  const handleReorder = async (index, direction) => {
    const updated = [...sections]
    const swapIdx = direction === 'up' ? index - 1 : index + 1
    if (swapIdx < 0 || swapIdx >= updated.length) return

    // Swap order values
    const tmpOrder = updated[index].order
    updated[index] = { ...updated[index], order: updated[swapIdx].order }
    updated[swapIdx] = { ...updated[swapIdx], order: tmpOrder }

    // Swap positions
    ;[updated[index], updated[swapIdx]] = [updated[swapIdx], updated[index]]
    setSections(updated)

    try {
      await api.put('/privacy-policy-sections-reorder', {
        sections: updated.map((s) => ({ id: s.id, order: s.order })),
      })
    } catch (err) {
      console.error('Reorder failed', err)
      await fetchSections()
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" />
            Kebijakan Privasi
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola bagian-bagian konten halaman Kebijakan Privasi website.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tambah Bagian
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium">Memuat data kebijakan privasi...</p>
        </div>
      ) : sections.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Belum ada bagian kebijakan privasi.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={handleOpenCreate}
          >
            <Plus className="w-4 h-4 mr-1" /> Tambah Bagian Pertama
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, i) => (
            <Card
              key={section.id}
              className={`transition-all duration-200 ${
                !section.is_active ? 'opacity-50' : 'hover:shadow-md'
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  {/* Left: order controls + title */}
                  <div className="flex items-start gap-2 min-w-0">
                    {/* Reorder buttons */}
                    <div className="flex flex-col gap-0.5 shrink-0 mt-0.5">
                      <button
                        onClick={() => handleReorder(i, 'up')}
                        disabled={i === 0}
                        className="p-0.5 rounded text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed"
                        title="Pindah ke atas"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReorder(i, 'down')}
                        disabled={i === sections.length - 1}
                        className="p-0.5 rounded text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed"
                        title="Pindah ke bawah"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    <GripVertical className="w-4 h-4 text-gray-300 mt-1 shrink-0" />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-gray-400 shrink-0">
                          #{section.order}
                        </span>
                        <CardTitle className="text-base font-semibold text-gray-800 leading-tight">
                          {section.title}
                        </CardTitle>
                        <Badge
                          variant={section.is_active ? 'default' : 'secondary'}
                          className="text-[10px] shrink-0"
                        >
                          {section.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">
                        /{section.slug}
                      </p>
                    </div>
                  </div>

                  {/* Right: action buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Toggle active */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-gray-700"
                      onClick={() => handleToggleActive(section)}
                      title={section.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                      {section.is_active ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600"
                      onClick={() => handleOpenEdit(section)}
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                      onClick={() => handleOpenDelete(section)}
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Content preview */}
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                  {section.content.replace(/<[^>]+>/g, '').substring(0, 180)}
                  {section.content.length > 180 ? '…' : ''}
                </p>
                {section.last_updated_label && (
                  <p className="text-xs text-gray-400 mt-2">
                    Label terakhir diperbarui:{' '}
                    <span className="font-medium">
                      {new Date(section.last_updated_label).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-700 space-y-1">
              <p className="font-semibold">Panduan Kebijakan Privasi</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-600 font-normal">
                <li>Gunakan tombol <strong>↑ ↓</strong> untuk mengatur urutan tampil bagian.</li>
                <li>Tombol <strong>mata</strong> untuk mengaktifkan/menonaktifkan bagian tanpa menghapus.</li>
                <li>Slug dibuat otomatis dari judul jika dibiarkan kosong.</li>
                <li>Perubahan langsung tampil di halaman publik <strong>/privacy-policy</strong>.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Form Dialog (Create / Edit) ─────────────────────────────────── */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeSection ? (
                <>
                  <Edit2 className="w-4 h-4" /> Edit Bagian — {activeSection.title}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Tambah Bagian Baru
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Perubahan akan langsung tampil di halaman Kebijakan Privasi website.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* General error */}
            {formErrors.general && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {formErrors.general}
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Judul <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Contoh: Pendahuluan"
                className={formErrors.title ? 'border-red-400' : ''}
              />
              {formErrors.title && (
                <p className="text-xs text-red-500">{formErrors.title}</p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Slug{' '}
                <span className="text-gray-400 font-normal">(otomatis jika kosong)</span>
              </label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="Contoh: pendahuluan"
                className="font-mono text-sm"
              />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Konten <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Tulis isi kebijakan privasi untuk bagian ini..."
                rows={8}
                className={`resize-y font-sans text-sm leading-relaxed ${formErrors.content ? 'border-red-400' : ''}`}
              />
              {formErrors.content && (
                <p className="text-xs text-red-500">{formErrors.content}</p>
              )}
              <p className="text-xs text-gray-400">
                Mendukung Markdown: **tebal**, *miring*, - daftar, [teks](url)
              </p>
            </div>

            {/* Order + Last Updated side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Urutan</label>
                <Input
                  type="number"
                  min="0"
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                  placeholder="Otomatis jika kosong"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Label "Terakhir Diperbarui"
                </label>
                <Input
                  type="date"
                  value={form.last_updated_label}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, last_updated_label: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={form.is_active}
                onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  form.is_active ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                    form.is_active ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-gray-700">
                {form.is_active
                  ? 'Aktif — tampil di halaman publik'
                  : 'Nonaktif — tersembunyi dari publik'}
              </span>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={submitting}
              >
                <X className="w-4 h-4 mr-1" /> Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-1" />
                )}
                {submitting
                  ? 'Menyimpan...'
                  : activeSection
                  ? 'Simpan Perubahan'
                  : 'Tambah Bagian'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ───────────────────────────────────────── */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Hapus Bagian?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bagian{' '}
              <strong className="text-gray-800">&quot;{activeSection?.title}&quot;</strong>{' '}
              akan dihapus permanen dan tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-1" /> Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

