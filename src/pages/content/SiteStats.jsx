import { useState, useEffect } from 'react'
import {
  BarChart3,
  Edit2,
  Loader2,
  AlertCircle,
  Check,
  X,
  Lock,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import api from '@/api/axios'

export default function SiteStats() {
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [activeStat, setActiveStat] = useState(null)
  const [formLabel, setFormLabel] = useState('')
  const [formValue, setFormValue] = useState('')
  const [formSuffix, setFormSuffix] = useState('')
  const [formSortOrder, setFormSortOrder] = useState('0')
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [successKey, setSuccessKey] = useState(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await api.get('/site-stats')
      setStats(res.data?.data || res.data || [])
    } catch (err) {
      console.error('Failed to load stats', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  // Helper: preview rendered value
  function previewValue(stat) {
    if (!stat) return ''
    if (stat.key === 'years_founded') {
      const year = parseInt(stat.value, 10)
      if (!isNaN(year)) {
        return `${new Date().getFullYear() - year}+`
      }
    }
    const num = parseInt(stat.value, 10)
    if (stat.key === 'customers' && num >= 1000) {
      const cleanSuffix = (stat.suffix || '+').replace(/^k+/i, '')
      return `${Math.floor(num / 1000)}k${cleanSuffix || '+'}`
    }
    return `${stat.value}${stat.suffix || ''}`
  }

  const handleOpenEdit = (stat) => {
    if (stat.key === 'projects' || stat.is_editable === false) return
    setActiveStat(stat)
    setFormLabel(stat.label || '')
    setFormValue(stat.value || '')
    setFormSuffix(stat.suffix || '')
    setFormSortOrder(String(stat.sort_order ?? 0))
    setFormErrors({})
    setIsEditOpen(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!activeStat) return

    const errors = {}
    if (!formLabel.trim()) errors.label = 'Label wajib diisi.'
    if (!formValue.trim()) errors.value = 'Nilai wajib diisi.'
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      setSubmitting(true)
      setFormErrors({})
      await api.put(`/site-stats/${activeStat.id}`, {
        label: formLabel.trim(),
        value: formValue.trim(),
        suffix: formSuffix.trim() || null,
        sort_order: parseInt(formSortOrder, 10) || 0,
      })
      setIsEditOpen(false)
      setSuccessKey(activeStat.key)
      setTimeout(() => setSuccessKey(null), 2500)
      await fetchStats()
    } catch (err) {
      console.error('Error updating stat:', err)
      const message = err.response?.data?.message || 'Gagal menyimpan perubahan.'
      setFormErrors({ general: message })
    } finally {
      setSubmitting(false)
    }
  }

  // Descriptions for each stat key (for admin guidance)
  const KEY_INFO = {
    customers: { hint: 'Total pelanggan/klien (angka penuh, misal: 35000)', icon: '👥' },
    years_founded: { hint: 'Tahun berdiri (misal: 2010) — ditampilkan sebagai "X+ Years"', icon: '📅' },
    projects: { hint: 'Total proyek diambil otomatis dari data modul Projects (tidak dapat diedit manual)', icon: '🏛️' },
    awards: { hint: 'Jumlah penghargaan desain yang diterima', icon: '🏆' },
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Statistik Website
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola angka statistik yang ditampilkan di halaman Home dan About.
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium">Memuat data statistik...</p>
        </div>
      ) : stats.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Belum ada data statistik.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat) => {
            const info = KEY_INFO[stat.key] || { hint: '', icon: '📊' }
            const isSuccess = successKey === stat.key
            const isAuto = stat.key === 'projects' || stat.is_editable === false

            return (
              <Card
                key={stat.id}
                className={`relative overflow-hidden transition-all duration-300 ${isSuccess ? 'ring-2 ring-green-500 ring-offset-1' : 'hover:shadow-md'
                  }`}
              >
                {isSuccess && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-2xl">{info.icon}</span>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">
                        {stat.label}
                      </p>
                    </div>
                    {isAuto ? (
                      <div
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-medium shadow-xs select-none"
                        title="Nilai dihitung otomatis dari modul Projects dan tidak dapat diedit secara manual"
                      >
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>Otomatis</span>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(stat)}
                        className="shrink-0 h-8 w-8 p-0 text-gray-400 hover:text-gray-800"
                        title="Edit Statistik"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Preview as displayed on website */}
                  <p className="text-4xl font-bold text-gray-900 tracking-tight">
                    {previewValue(stat)}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                    {info.hint}
                  </p>
                  {/* Raw values */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <span className="font-mono bg-gray-50 px-1.5 py-0.5 rounded text-gray-700">
                        value: {stat.value}
                      </span>
                      {stat.suffix && (
                        <span className="font-mono bg-gray-50 px-1.5 py-0.5 rounded text-gray-700">
                          suffix: {stat.suffix}
                        </span>
                      )}
                    </div>
                    {isAuto && (
                      <span className="text-[10px] font-medium text-amber-600 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Terkunci
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-700 space-y-1">
              <p className="font-semibold">Panduan Pengisian Nilai</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-600 font-normal">
                <li><strong>Customers</strong>: Isi angka penuh (misal: <code>35000</code>) — akan otomatis ditampilkan sebagai <strong>35k+</strong></li>
                <li><strong>Years Founded</strong>: Isi tahun berdiri (misal: <code>2010</code>) — akan otomatis dihitung sebagai <strong>16+ Years</strong></li>
                <li><strong>Projects</strong>: Dihitung <strong>otomatis dari modul Projects</strong> (tidak dapat diedit manual) sehingga selalu sinkron dengan total proyek yang ada</li>
                <li><strong>Design Awards</strong>: Isi angka langsung, tambahkan suffix jika diperlukan (misal: <code>+</code>)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-4 h-4" />
              Edit Statistik — {activeStat?.label}
            </DialogTitle>
            <DialogDescription>
              Perubahan akan langsung tampil di website setelah disimpan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            {formErrors.general && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {formErrors.general}
              </div>
            )}

            {/* Label */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Label <span className="text-red-500">*</span>
              </label>
              <Input
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="misal: Customers"
                className={formErrors.label ? 'border-red-400' : ''}
              />
              {formErrors.label && (
                <p className="text-xs text-red-500">{formErrors.label}</p>
              )}
            </div>

            {/* Value */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Nilai <span className="text-red-500">*</span>
              </label>
              <Input
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                placeholder={
                  activeStat?.key === 'years_founded'
                    ? 'Tahun berdiri, misal: 2010'
                    : activeStat?.key === 'customers'
                      ? 'Angka penuh, misal: 35000'
                      : 'misal: 450'
                }
                className={formErrors.value ? 'border-red-400' : ''}
              />
              {formErrors.value && (
                <p className="text-xs text-red-500">{formErrors.value}</p>
              )}
              {/* Live preview */}
              {formValue && activeStat && (
                <p className="text-xs text-gray-500">
                  Preview di website:{' '}
                  <strong className="text-gray-800">
                    {previewValue({ ...activeStat, value: formValue, suffix: formSuffix })}
                  </strong>
                </p>
              )}
            </div>

            {/* Suffix (hidden for years_founded and customers) */}
            {activeStat?.key !== 'years_founded' && activeStat?.key !== 'customers' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Suffix <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <Input
                  value={formSuffix}
                  onChange={(e) => setFormSuffix(e.target.value)}
                  placeholder="misal: + atau k+"
                  maxLength={10}
                />
              </div>
            )}

            {/* Sort Order */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Urutan Tampil</label>
              <Input
                type="number"
                value={formSortOrder}
                onChange={(e) => setFormSortOrder(e.target.value)}
                min="0"
                max="99"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={submitting}
              >
                <X className="w-4 h-4 mr-1" />
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-1" />
                )}
                {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
