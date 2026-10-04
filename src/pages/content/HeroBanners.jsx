import { useState, useEffect } from 'react'
import { Plus, Search, Image as ImageIcon, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import api from '@/api/axios'

export default function HeroBanners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const res = await api.get('/hero-banners')
      setBanners(res.data?.data || res.data || [])
    } catch (err) {
      console.error('Failed to load hero banners', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  const filteredBanners = banners.filter((b) =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.subtitle?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hero Banners</h1>
          <p className="text-sm text-muted-foreground">
            Kelola banner slider utama yang tampil di beranda website.
          </p>
        </div>
        <Button className="gap-2 cursor-pointer">
          <Plus className="h-4 w-4" />
          <span>Tambah Banner</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari banner..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <span className="text-xs text-muted-foreground">
              Total: <strong>{filteredBanners.length}</strong> banner
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-y border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Banner</th>
                  <th className="px-4 py-3">Judul & Subtitle</th>
                  <th className="px-4 py-3">Tombol Aksi</th>
                  <th className="px-4 py-3">Urutan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-muted-foreground">
                      Memuat data banner...
                    </td>
                  </tr>
                ) : filteredBanners.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-muted-foreground">
                      Belum ada banner ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredBanners.map((banner) => (
                    <tr key={banner.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="h-12 w-20 rounded-md bg-muted overflow-hidden border border-border flex items-center justify-center">
                          {banner.image ? (
                            <img
                              src={banner.image.startsWith('http') ? banner.image : `${import.meta.env.VITE_STORAGE_URL}/${banner.image}`}
                              alt={banner.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        <div className="font-semibold text-foreground">{banner.title}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-xs">{banner.subtitle || '-'}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {banner.button_text ? (
                          <span className="font-medium text-foreground">{banner.button_text} ({banner.button_url || '#'})</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono">{banner.order ?? 0}</td>
                      <td className="px-4 py-3">
                        {banner.is_active ? (
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
