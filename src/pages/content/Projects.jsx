import { useState, useEffect } from 'react'
import { Plus, Search, FolderKanban, Edit2, Trash2, CheckCircle2, XCircle, Star, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import api from '@/api/axios'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const res = await api.get('/projects')
      setProjects(res.data?.data || res.data || [])
    } catch (err) {
      console.error('Failed to load projects', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const filteredProjects = projects.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.client?.toLowerCase().includes(search.toLowerCase()) ||
    p.location?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Kelola portofolio karya arsitektur, foto galeri, dan rincian proyek.
          </p>
        </div>
        <Button className="gap-2 cursor-pointer">
          <Plus className="h-4 w-4" />
          <span>Tambah Proyek</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, klien, lokasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <span className="text-xs text-muted-foreground">
              Total: <strong>{filteredProjects.length}</strong> proyek
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-y border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Sampul</th>
                  <th className="px-4 py-3">Judul Proyek</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Klien & Lokasi</th>
                  <th className="px-4 py-3">Tahun</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-muted-foreground">
                      Memuat data proyek...
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-muted-foreground">
                      Belum ada proyek ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="h-12 w-16 rounded-md bg-muted overflow-hidden border border-border flex items-center justify-center">
                          {project.cover_image ? (
                            <img
                              src={project.cover_image.startsWith('http') ? project.cover_image : `${import.meta.env.VITE_STORAGE_URL}/${project.cover_image}`}
                              alt={project.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        <div className="font-semibold text-foreground">{project.title}</div>
                        <div className="text-xs text-muted-foreground">/{project.slug}</div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <Badge variant="secondary" className="font-normal text-[11px]">
                          {project.category?.name || 'Umum'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <div>{project.client || '-'}</div>
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
                        {project.is_active ? (
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
