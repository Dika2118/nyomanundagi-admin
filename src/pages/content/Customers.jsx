import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Search,
  Contact2,
  Edit2,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Building2,
  FolderKanban,
  ExternalLink,
  MessageCircle,
  FileText,
  AlertCircle,
  Loader2,
  UserCheck,
  Sparkles,
  ArrowRight,
  X,
  Calendar,
  Layers,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import api from '@/api/axios'

const CLIENT_TYPES = [
  { value: 'personal', label: 'Pribadi / Personal', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' },
  { value: 'business', label: 'Bisnis / Komersial', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
  { value: 'adat', label: 'Adat / Pura / Banjar', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' },
  { value: 'government', label: 'Instansi / Pemerintah', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20' },
]

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('')

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Active Customer data
  const [activeCustomer, setActiveCustomer] = useState(null)
  const [detailCustomer, setDetailCustomer] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    client_type: 'personal',
    notes: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Fetch list of customers
  const fetchCustomers = async (searchQuery = '', type = '') => {
    try {
      setLoading(true)
      const params = { all: true }
      if (searchQuery.trim()) params.search = searchQuery.trim()
      if (type) params.client_type = type

      const res = await api.get('/customers', { params })
      const data = res.data?.data || res.data || []
      setCustomers(data)
    } catch (err) {
      console.error('Failed to fetch customers', err)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(search, selectedType)
    }, 250)
    return () => clearTimeout(timer)
  }, [search, selectedType])

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      company_name: '',
      phone: '',
      email: '',
      city: '',
      address: '',
      client_type: 'personal',
      notes: '',
    })
    setFormErrors({})
  }

  // Handle open Add modal
  const handleOpenAdd = () => {
    resetForm()
    setIsAddOpen(true)
  }

  // Handle open Edit modal
  const handleOpenEdit = (customer) => {
    setActiveCustomer(customer)
    setFormData({
      name: customer.name || '',
      company_name: customer.company_name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      city: customer.city || '',
      address: customer.address || '',
      client_type: customer.client_type || 'personal',
      notes: customer.notes || '',
    })
    setFormErrors({})
    setIsEditOpen(true)
  }

  // Handle open Detail modal (Fetch fresh full data with projects)
  const handleOpenDetail = async (customer) => {
    setIsDetailOpen(true)
    setLoadingDetail(true)
    try {
      const res = await api.get(`/customers/${customer.id}`)
      setDetailCustomer(res.data?.data || res.data)
    } catch (err) {
      console.error('Failed to load customer detail', err)
      setDetailCustomer(customer)
    } finally {
      setLoadingDetail(false)
    }
  }

  // Handle open Delete modal
  const handleOpenDelete = (customer) => {
    setActiveCustomer(customer)
    setIsDeleteOpen(true)
  }

  // Validate form
  const validate = () => {
    const errs = {}
    if (!formData.name.trim()) errs.name = 'Nama customer wajib diisi'
    return errs
  }

  // Submit Add
  const handleAddSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs)
      return
    }

    try {
      setSubmitting(true)
      await api.post('/customers', formData)
      setIsAddOpen(false)
      resetForm()
      fetchCustomers(search, selectedType)
    } catch (err) {
      const respErr = err.response?.data?.errors
      if (respErr) {
        setFormErrors(respErr)
      } else {
        setFormErrors({ general: 'Gagal menambahkan customer. Silakan coba lagi.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Submit Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!activeCustomer) return
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs)
      return
    }

    try {
      setSubmitting(true)
      await api.put(`/customers/${activeCustomer.id}`, formData)
      setIsEditOpen(false)
      resetForm()
      fetchCustomers(search, selectedType)
      if (detailCustomer && detailCustomer.id === activeCustomer.id) {
        handleOpenDetail(activeCustomer)
      }
    } catch (err) {
      const respErr = err.response?.data?.errors
      if (respErr) {
        setFormErrors(respErr)
      } else {
        setFormErrors({ general: 'Gagal memperbarui customer. Silakan coba lagi.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Confirm Delete
  const handleDeleteSubmit = async () => {
    if (!activeCustomer) return
    try {
      setDeleting(true)
      await api.delete(`/customers/${activeCustomer.id}`)
      setIsDeleteOpen(false)
      setActiveCustomer(null)
      fetchCustomers(search, selectedType)
    } catch (err) {
      console.error('Failed to delete customer', err)
    } finally {
      setDeleting(false)
    }
  }

  // Quick stats calculations
  const totalCustomers = customers.length
  const repeatClients = customers.filter((c) => (c.projects_count || 0) >= 2).length
  const totalCustomerProjects = customers.reduce((acc, c) => acc + (c.projects_count || 0), 0)

  // Helper for WhatsApp link
  const getWhatsAppLink = (phone) => {
    if (!phone) return null
    let clean = phone.replace(/[^0-9]/g, '')
    if (clean.startsWith('0')) clean = '62' + clean.slice(1)
    return `https://wa.me/${clean}`
  }

  const getTypeBadge = (type) => {
    const item = CLIENT_TYPES.find((t) => t.value === type) || CLIENT_TYPES[0]
    return (
      <Badge variant="outline" className={`font-normal text-[11px] ${item.color}`}>
        {item.label}
      </Badge>
    )
  }

  const getInitials = (name) => {
    if (!name) return 'C'
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Contact2 className="h-7 w-7 text-primary" />
            <span>Data Customer / Klien</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Kelola profil klien, riwayat proyek pengerjaan arsitektur, dan database kontak repeat order.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 shadow-xs cursor-pointer">
          <Plus className="h-4 w-4" />
          <span>Tambah Customer</span>
        </Button>
      </div>

      {/* ── STATS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Customer Terdaftar</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{totalCustomers}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Database klien Nyoman Undagi</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Klien Repeat Order (&ge;2 Proyek)</p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {repeatClients}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Klien setia dengan lebih dari 1 proyek</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Proyek Terhubung</p>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {totalCustomerProjects}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Proyek yang ditautkan ke customer</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FolderKanban className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── FILTER & SEARCH ── */}
      <Card className="border-border/60 shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, kontak, kota, perusahaan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full sm:w-48 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Semua Tipe Klien</option>
                {CLIENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>

              {(search || selectedType) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch('')
                    setSelectedType('')
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer h-9 px-2"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── CUSTOMER TABLE ── */}
      <Card className="border-border/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-semibold border-b border-border/80">
              <tr>
                <th className="px-4 py-3 text-center w-12">No</th>
                <th className="px-4 py-3">Nama Customer / Klien</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">Kontak</th>
                <th className="px-4 py-3">Domisili / Kota</th>
                <th className="px-4 py-3 text-center">Riwayat Proyek</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    <p className="text-xs text-muted-foreground mt-2">Memuat data customer...</p>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Contact2 className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-semibold text-foreground">Belum ada customer</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {search || selectedType
                        ? 'Tidak ada data customer yang sesuai dengan filter pencarian.'
                        : 'Mulai catat data klien untuk melacak proyek repeat order.'}
                    </p>
                    {!search && !selectedType && (
                      <Button onClick={handleOpenAdd} size="sm" className="mt-3 gap-1.5 text-xs">
                        <Plus className="h-3.5 w-3.5" />
                        Tambah Customer Pertama
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                customers.map((customer, index) => {
                  const pCount = customer.projects_count || 0
                  const waLink = getWhatsAppLink(customer.phone)

                  return (
                    <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-center text-xs font-mono text-muted-foreground">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                            {getInitials(customer.name)}
                          </div>
                          <div className="min-w-0">
                            <div
                              onClick={() => handleOpenDetail(customer)}
                              className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer truncate"
                            >
                              {customer.name}
                            </div>
                            {customer.company_name && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                <span className="truncate">{customer.company_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">{getTypeBadge(customer.client_type)}</td>

                      <td className="px-4 py-3 text-xs">
                        <div className="space-y-1">
                          {customer.phone ? (
                            <div className="flex items-center gap-1.5">
                              {waLink ? (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium hover:underline"
                                  title="Chat via WhatsApp"
                                >
                                  <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                                  <span>{customer.phone}</span>
                                </a>
                              ) : (
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Phone className="h-3 w-3" /> {customer.phone}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}

                          {customer.email && (
                            <div className="text-muted-foreground flex items-center gap-1 text-[11px] truncate max-w-[180px]">
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate">{customer.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {customer.city ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                            <span>{customer.city}</span>
                          </div>
                        ) : (
                          <span>-</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(customer)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all hover:scale-105 active:scale-95 bg-muted hover:bg-primary/10 hover:text-primary"
                          title="Klik untuk melihat riwayat proyek customer ini"
                        >
                          <FolderKanban className="h-3.5 w-3.5" />
                          <span>
                            {pCount} {pCount === 1 ? 'Proyek' : 'Proyek'}
                          </span>
                        </button>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDetail(customer)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary cursor-pointer"
                            title="Detail Riwayat Proyek"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(customer)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Edit Customer"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDelete(customer)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                            title="Hapus Customer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── MODAL: DETAIL CUSTOMER & RIWAYAT PROYEK ── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {loadingDetail || !detailCustomer ? (
            <div className="py-12 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              <p className="text-xs text-muted-foreground mt-2">Memuat riwayat klien...</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-base">
                      {getInitials(detailCustomer.name)}
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-bold text-foreground">
                        {detailCustomer.name}
                      </DialogTitle>
                      {detailCustomer.company_name && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Building2 className="h-3 w-3" />
                          <span>{detailCustomer.company_name}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div>{getTypeBadge(detailCustomer.client_type)}</div>
                </div>
              </DialogHeader>

              <div className="space-y-5 py-3">
                {/* Info Kontak & Alamat */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/80 text-xs">
                  <div className="space-y-1.5">
                    <div className="text-muted-foreground font-medium">Informasi Kontak:</div>
                    {detailCustomer.phone ? (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{detailCustomer.phone}</span>
                        {getWhatsAppLink(detailCustomer.phone) && (
                          <a
                            href={getWhatsAppLink(detailCustomer.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-semibold inline-flex items-center gap-0.5 ml-1"
                          >
                            <MessageCircle className="h-3 w-3" />
                            <span>WA</span>
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="text-muted-foreground">Tidak ada nomor telepon</div>
                    )}
                    {detailCustomer.email && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span>{detailCustomer.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-muted-foreground font-medium">Domisili / Lokasi:</div>
                    <div className="flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <span>
                        {detailCustomer.city || detailCustomer.address
                          ? [detailCustomer.city, detailCustomer.address].filter(Boolean).join(' — ')
                          : 'Tidak ada informasi alamat'}
                      </span>
                    </div>
                  </div>

                  {detailCustomer.notes && (
                    <div className="sm:col-span-2 pt-2 border-t border-border/60">
                      <div className="text-muted-foreground font-medium mb-1">Catatan Khusus / Preferensi:</div>
                      <p className="text-foreground bg-background/50 p-2.5 rounded-lg border border-border/50 text-[11px] leading-relaxed">
                        {detailCustomer.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Riwayat Proyek Yang Dikerjakan */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <FolderKanban className="h-4 w-4 text-primary" />
                      <span>Riwayat Proyek ({detailCustomer.projects?.length || 0})</span>
                    </h4>
                    <Link
                      to="/projects"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <span>Buka Manajemen Proyek</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  {detailCustomer.projects && detailCustomer.projects.length > 0 ? (
                    <div className="space-y-2.5">
                      {detailCustomer.projects.map((proj) => {
                        const thumbUrl = proj.thumbnail_url || (proj.thumbnail ? `/storage/${proj.thumbnail}` : null)
                        return (
                          <div
                            key={proj.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-border/70 bg-card hover:bg-muted/20 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-12 w-16 rounded bg-muted overflow-hidden shrink-0 border border-border flex items-center justify-center">
                                {thumbUrl ? (
                                  <img
                                    src={thumbUrl}
                                    alt={proj.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <FolderKanban className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-semibold text-xs sm:text-sm text-foreground truncate">
                                  {proj.title}
                                </h5>
                                <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                                  {proj.category?.name && (
                                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                                      {proj.category.name}
                                    </Badge>
                                  )}
                                  {proj.location && (
                                    <span className="flex items-center gap-0.5">
                                      <MapPin className="h-2.5 w-2.5" />
                                      {proj.location}
                                    </span>
                                  )}
                                  {proj.year && (
                                    <span className="flex items-center gap-0.5 font-mono">
                                      <Calendar className="h-2.5 w-2.5" />
                                      {proj.year}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0 ml-3 text-right">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                  proj.status === 'Selesai'
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                    : proj.status === 'Berjalan'
                                    ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                                    : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                                }`}
                              >
                                {proj.status || 'Berjalan'}
                              </Badge>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed rounded-xl bg-muted/10 text-xs text-muted-foreground">
                      <FolderKanban className="h-8 w-8 mx-auto text-muted-foreground/40 mb-1.5" />
                      <p className="font-medium text-foreground">Belum ada proyek yang ditautkan</p>
                      <p className="mt-0.5">Saat menginput proyek baru, pilih nama klien ini untuk menghubungkannya.</p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDetailOpen(false)
                    handleOpenEdit(detailCustomer)
                  }}
                  className="gap-1.5 text-xs"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit Customer</span>
                </Button>
                <Button type="button" onClick={() => setIsDetailOpen(false)}>
                  Tutup
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── MODAL: TAMBAH CUSTOMER ── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Customer Baru</DialogTitle>
            <DialogDescription>
              Catat profil klien untuk mendata riwayat pekerjaan arsitektur &amp; portfolio.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
            {formErrors.general && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formErrors.general}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Nama Customer / Klien <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Misal: Bpk. Wayan Sukadana"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={formErrors.name ? 'border-destructive' : ''}
              />
              {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Perusahaan / Badan Usaha</label>
                <Input
                  placeholder="Opsional, misal: PT Villa Bali"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Tipe Klien</label>
                <select
                  value={formData.client_type}
                  onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {CLIENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">No. WhatsApp / HP</label>
                <Input
                  placeholder="Misal: 081234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="Misal: wayan@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Kota / Domisili</label>
                <Input
                  placeholder="Misal: Denpasar, Ubud, Gianyar"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Alamat Lengkap</label>
                <Input
                  placeholder="Misal: Jl. Raya Ubud No. 88"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Catatan Khusus / Preferensi Arsitektur
              </label>
              <textarea
                rows={3}
                placeholder="Misal: Menyukai gaya arsitektur Bali klasik, tata ruang Asta Kosala Kosali, ornamen bata ekspos..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Simpan Customer</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: EDIT CUSTOMER ── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Data Customer</DialogTitle>
            <DialogDescription>Perbarui informasi profil atau kontak customer.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            {formErrors.general && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formErrors.general}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Nama Customer / Klien <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Misal: Bpk. Wayan Sukadana"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={formErrors.name ? 'border-destructive' : ''}
              />
              {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Perusahaan / Badan Usaha</label>
                <Input
                  placeholder="Opsional, misal: PT Villa Bali"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Tipe Klien</label>
                <select
                  value={formData.client_type}
                  onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {CLIENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">No. WhatsApp / HP</label>
                <Input
                  placeholder="Misal: 081234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="Misal: wayan@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Kota / Domisili</label>
                <Input
                  placeholder="Misal: Denpasar, Ubud, Gianyar"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Alamat Lengkap</label>
                <Input
                  placeholder="Misal: Jl. Raya Ubud No. 88"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Catatan Khusus / Preferensi Arsitektur
              </label>
              <textarea
                rows={3}
                placeholder="Misal: Menyukai gaya arsitektur Bali klasik, tata ruang Asta Kosala Kosali, ornamen bata ekspos..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Perbarui Customer</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: HAPUS CUSTOMER ── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>Hapus Customer</span>
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data customer{' '}
              <strong className="text-foreground">{activeCustomer?.name}</strong>?
            </DialogDescription>
          </DialogHeader>

          <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/60">
            Catatan: Menghapus customer tidak akan menghapus proyek-proyek yang pernah dikerjakan. Proyek terkait akan tetap tersimpan namun tautan ke customer ini akan dilepas.
          </p>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteSubmit}
              disabled={deleting}
              className="gap-2"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Ya, Hapus Customer</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
