import { useState, useEffect } from 'react'
import { Plus, Search, Briefcase, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import api from '@/api/axios'

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchServices = async () => {
    try {
      setLoading(true)
      const res = await api.get('/services')
      setServices(res.data?.data || res.data || [])
    } catch (err) {
      console.error('Failed to load services', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const filteredServices = services.filter((s) =>
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.short_description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-sm text-muted-foreground">
            Kelola daftar layanan & jasa arsitektur yang ditawarkan.
          </p>
        </div>
        <Button className="gap-2 cursor-pointer">
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
                placeholder="Cari layanan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <span className="text-xs text-muted-foreground">
              Total: <strong>{filteredServices.length}</strong> layanan
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-y border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Icon / Gambar</th>
                  <th className="px-4 py-3">Nama Layanan</th>
                  <th className="px-4 py-3">Ringkasan</th>
                  <th className="px-4 py-3">Urutan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-muted-foreground">
                      Memuat data layanan...
                    </td>
                  </tr>
                ) : filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-muted-foreground">
                      Belum ada layanan ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-semibold">
                          <Briefcase className="h-5 w-5" />
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        <div className="font-semibold text-foreground">{service.title}</div>
                        <div className="text-xs text-muted-foreground">/{service.slug}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-sm truncate">
                        {service.short_description || service.description || '-'}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono">{service.order ?? 0}</td>
                      <td className="px-4 py-3">
                        {service.is_active ? (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-[11px] gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Aktif
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground border-border text-[11px] gap-1">
                            <XCircle className="h-3 w-3" /> Nonaktif
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
