import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FolderKanban,
  Briefcase,
  Users2,
  Image,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/api/axios'
import { useAuth } from '@/context/AuthContext'

// Static chart data – proyek selesai per bulan
const projectChartData = [
  { month: 'Jan', selesai: 4 },
  { month: 'Feb', selesai: 6 },
  { month: 'Mar', selesai: 9 },
  { month: 'Apr', selesai: 5 },
  { month: 'Mei', selesai: 8 },
  { month: 'Jun', selesai: 3 },
  { month: 'Jul', selesai: 7 },
  { month: 'Ags', selesai: 10 },
  { month: 'Sep', selesai: 6 },
]

// Static recent projects
const recentProjects = [
  {
    id: 1,
    name: 'Villa Sunset Seminyak',
    category: 'Residential',
    client: 'Budi Santoso',
    status: 'Selesai',
    date: '2026-09-15',
  },
  {
    id: 2,
    name: 'Office Tower Denpasar',
    category: 'Commercial',
    client: 'PT. Karya Mandiri',
    status: 'Berjalan',
    date: '2026-09-20',
  },
  {
    id: 3,
    name: 'Resort Ubud Hills',
    category: 'Hospitality',
    client: 'Wayan Arta',
    status: 'Selesai',
    date: '2026-09-10',
  },
  {
    id: 4,
    name: 'Rumah Tradisional Bali',
    category: 'Residential',
    client: 'Made Sari',
    status: 'Perencanaan',
    date: '2026-09-25',
  },
  {
    id: 5,
    name: 'Café & Restaurant Canggu',
    category: 'Commercial',
    client: 'Ni Luh Dewi',
    status: 'Selesai',
    date: '2026-09-05',
  },
]

const statusColors = {
  Selesai: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Berjalan: 'bg-blue-100 text-blue-700 border-blue-200',
  Perencanaan: 'bg-amber-100 text-amber-700 border-amber-200',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-foreground text-background text-xs rounded-lg px-3 py-2 shadow-lg">
        <p className="font-semibold">{label}</p>
        <p>{payload[0].value} proyek selesai</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    projects: 0,
    services: 0,
    teamMembers: 0,
    heroBanners: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const today = new Date()
  const currentMonth = today.toLocaleString('id-ID', { month: 'long', year: 'numeric' })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projects, services, team, banners] = await Promise.allSettled([
          api.get('/projects'),
          api.get('/services'),
          api.get('/team-members'),
          api.get('/hero-banners'),
        ])
        setStats({
          projects: projects.status === 'fulfilled' ? (projects.value.data?.data?.length ?? projects.value.data?.length ?? 0) : 0,
          services: services.status === 'fulfilled' ? (services.value.data?.data?.length ?? services.value.data?.length ?? 0) : 0,
          teamMembers: team.status === 'fulfilled' ? (team.value.data?.data?.length ?? team.value.data?.length ?? 0) : 0,
          heroBanners: banners.status === 'fulfilled' ? (banners.value.data?.data?.length ?? banners.value.data?.length ?? 0) : 0,
        })
      } catch (err) {
        console.error('Failed to load dashboard stats', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    {
      title: 'Total Proyek',
      value: loading ? '...' : stats.projects,
      icon: FolderKanban,
      sub: '+3 dari bulan lalu',
      link: '/projects',
    },
    {
      title: 'Layanan Aktif',
      value: loading ? '...' : stats.services,
      icon: Briefcase,
      sub: '+1.2% dari bulan lalu',
      link: '/services',
    },
    {
      title: 'Tim & Arsitek',
      value: loading ? '...' : stats.teamMembers,
      icon: Users2,
      sub: 'Staf profesional aktif',
      link: '/team-members',
    },
    {
      title: 'Hero Banners',
      value: loading ? '...' : stats.heroBanners,
      icon: Image,
      sub: 'Promosi & headline aktif',
      link: '/hero-banners',
    },
  ]

  // Highlight highest month in chart
  const maxSelesai = Math.max(...projectChartData.map(d => d.selesai))

  return (
    <div className="space-y-5">

      {/* ── TOP STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.title} to={card.link} className="group">
              <div className="rounded-2xl p-5 border border-border/60 bg-card text-foreground transition-all duration-200 group-hover:bg-foreground group-hover:border-foreground group-hover:text-background">
                <p className="text-xs font-medium mb-2 text-muted-foreground transition-colors duration-200 group-hover:text-background/60">
                  {card.title}
                </p>
                <p className="text-3xl font-bold tracking-tight mb-1 transition-colors duration-200">
                  {card.value}
                </p>
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 transition-colors duration-200 group-hover:text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>{card.sub}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* ── CHART + CALENDAR ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Bar Chart – Proyek Selesai */}
        <Card className="lg:col-span-3 border-border/60 rounded-2xl shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Proyek Selesai</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Statistik proyek selesai per bulan – 2026</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" asChild>
              <Link to="/projects">
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={projectChartData} barCategoryGap="30%" margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="selesai" radius={[6, 6, 0, 0]} maxBarSize={44} activeBar={false}>
                  {projectChartData.map((entry) => (
                    <Cell
                      key={entry.month}
                      fill={entry.selesai === maxSelesai ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground) / 0.35)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Calendar + Ring */}
        <Card className="lg:col-span-2 border-border/60 rounded-2xl shadow-none flex flex-col">
          <CardHeader className="pb-1">
            <CardTitle className="text-base font-semibold">Kalender</CardTitle>
            <p className="text-xs text-muted-foreground">{currentMonth}</p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 pt-0">
            {/* Calendar widget */}
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                className="rounded-xl p-0 [--cell-size:--spacing(8)] text-sm"
                classNames={{
                  month_caption: 'hidden',
                  nav: 'hidden',
                }}
              />
            </div>

            {/* Progress ring – proyek selesai */}
            <div className="mt-auto flex items-center justify-between bg-muted/40 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Penyelesaian Proyek</p>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-0.5">
                  <TrendingUp className="h-3 w-3" />
                  <span>+0.9% dari bulan lalu</span>
                </div>
              </div>
              {/* SVG donut ring */}
              <div className="relative flex items-center justify-center" style={{ width: 56, height: 56 }}>
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                  <circle
                    cx="28" cy="28" r="22"
                    fill="none"
                    stroke="hsl(var(--foreground))"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 22 * 0.72} ${2 * Math.PI * 22}`}
                    transform="rotate(-90 28 28)"
                  />
                </svg>
                <span className="absolute text-[11px] font-bold text-foreground">72%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── RECENT PROJECTS TABLE ── */}
      <Card className="border-border/60 rounded-2xl shadow-none">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Proyek Terbaru</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Daftar proyek aktif & selesai</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" asChild>
              <Link to="/projects">
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 px-6 py-2.5 border-b border-border/60 bg-muted/30">
            {['Nama Proyek', 'Kategori', 'Klien', 'Tanggal', 'Status'].map(h => (
              <span key={h} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</span>
            ))}
          </div>

          {/* Table rows */}
          {recentProjects.map((project, idx) => (
            <div
              key={project.id}
              className={`grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 items-center px-6 py-3.5 transition-colors hover:bg-muted/30 ${idx !== recentProjects.length - 1 ? 'border-b border-border/40' : ''}`}
            >
              {/* Name + icon */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground/8 border border-border/50">
                  <Layers className="h-3.5 w-3.5 text-foreground/70" />
                </div>
                <span className="text-sm font-medium text-foreground truncate">{project.name}</span>
              </div>

              <span className="text-sm text-muted-foreground truncate">{project.category}</span>
              <span className="text-sm text-muted-foreground truncate">{project.client}</span>
              <span className="text-sm text-muted-foreground">
                {new Date(project.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>

              {/* Status badge */}
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${statusColors[project.status]}`}
              >
                {project.status === 'Selesai' && <CheckCircle2 className="h-3 w-3" />}
                {project.status === 'Berjalan' && <Clock className="h-3 w-3" />}
                {project.status}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
