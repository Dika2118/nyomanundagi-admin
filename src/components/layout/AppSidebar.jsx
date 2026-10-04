import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Image,
  Briefcase,
  FolderTree,
  FolderKanban,
  Users2,
  BookOpen,
  UserCog,
  Settings,
  LogOut,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/context/AuthContext'
import logoImg from '@/assets/images/logo_removebg.png'

const navigationItems = [
  {
    title: 'Utama',
    items: [
      {
        title: 'Dashboard',
        url: '/',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Content Management',
    items: [
      {
        title: 'Hero Banners',
        url: '/hero-banners',
        icon: Image,
      },
      {
        title: 'Services',
        url: '/services',
        icon: Briefcase,
      },
      {
        title: 'Project Categories',
        url: '/project-categories',
        icon: FolderTree,
      },
      {
        title: 'Projects',
        url: '/projects',
        icon: FolderKanban,
      },
      {
        title: 'Team Members',
        url: '/team-members',
        icon: Users2,
      },
      {
        title: 'Blogs / Artikel',
        url: '/blogs',
        icon: BookOpen,
      },
    ],
  },
  {
    title: 'User Management',
    items: [
      {
        title: 'Users',
        url: '/users',
        icon: UserCog,
      },
    ],
  },
  {
    title: 'General',
    items: [
      {
        title: 'Settings',
        url: '/settings',
        icon: Settings,
      },
    ],
  },
]

export function AppSidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()

  const getInitials = (name) => {
    if (!name) return 'AD'
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar">
      <SidebarHeader className="border-b border-border/50 h-16 flex items-center justify-center px-3 group-data-[collapsible=icon]:px-0">
        <Link
          to="/"
          className="flex items-center gap-3 w-full px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background border border-border/60 p-1.5 shadow-xs transition-transform hover:scale-105">
            <img
              src={logoImg}
              alt="Nyoman Undagi Logo"
              className="h-full w-full object-contain dark:invert"
            />
          </div>
          <div className="flex flex-col gap-0.5 leading-none min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-sm tracking-tight text-foreground truncate">
              Nyoman Undagi
            </span>
            <span className="text-[11px] text-muted-foreground font-medium truncate">
              Admin Portal
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-2">
        {navigationItems.map((group) => (
          <SidebarGroup key={group.title} className="py-1">
            <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/90 px-2 group-data-[collapsible=icon]:hidden">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.url === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.url)

                  const Icon = item.icon

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={<Link to={item.url} />}
                        isActive={isActive}
                        tooltip={item.title}
                        className={`transition-colors duration-150 rounded-lg font-medium text-sm ${
                          isActive
                            ? 'bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary hover:text-primary-foreground'
                            : 'text-foreground/80 hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon
                          className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                            isActive
                              ? 'text-primary-foreground'
                              : 'text-foreground/70 group-hover/menu-button:text-foreground'
                          }`}
                        />
                        <span className="truncate">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-2 group-data-[collapsible=icon]:p-1.5">
        <SidebarMenu>
          <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 w-full group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:justify-center">
              <div className="flex items-center gap-2.5 overflow-hidden group-data-[collapsible=icon]:justify-center">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={user?.avatar_url || ''} />
                  <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 truncate group-data-[collapsible=icon]:hidden">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {user?.name || 'Administrator'}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {user?.email || 'admin@nyomanundagi.com'}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors group-data-[collapsible=icon]:hidden cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
