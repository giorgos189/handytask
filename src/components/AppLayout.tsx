
// src/components/AppLayout.tsx
"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, PlusSquare, Wrench, Menu, Users, LogOut, UserCircle } from 'lucide-react'; // Added UserCircle
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { logout, type UserRole } from '@/auth/auth';
import { useAuth } from '@/context/AuthContext';


interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  tooltip: string;
  allowedRoles?: UserRole[];
}

const allNavItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, tooltip: 'Task Dashboard', allowedRoles: ['admin', 'employee'] },
  { href: '/profile', label: 'Profile', icon: UserCircle, tooltip: 'Edit Profile', allowedRoles: ['admin', 'employee'] },
  { href: '/submit-ticket', label: 'Submit Ticket', icon: PlusSquare, tooltip: 'Submit New Ticket', allowedRoles: ['admin'] },
  { href: '/admin/create-user', label: 'Create User', icon: Users, tooltip: 'Create New User', allowedRoles: ['admin'] },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const visibleNavItems = allNavItems.filter(item => {
    if (!item.allowedRoles) return true;
    if (!user) return false;
    return item.allowedRoles.includes(user.role);
  });

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const sidebarContent = (
    <>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-sidebar-primary hover:text-sidebar-primary/90 transition-colors">
          <Wrench className="h-6 w-6" />
          <span>HandyTask</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {visibleNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.tooltip}
                  className="justify-start"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      {user && ( // Check if any user is logged in to show logout
        <SidebarFooter className="p-2 mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                tooltip="Log Out"
                className="justify-start w-full"
              >
                <LogOut className="h-5 w-5" />
                <span>Log Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </>
  );

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        {!isMobile && (
          <Sidebar variant="sidebar" collapsible="icon">
            {sidebarContent}
          </Sidebar>
        )}
        <SidebarInset className="flex flex-col">
          {isMobile && (
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline" className="sm:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs bg-sidebar p-0">
                  <nav className="flex flex-col h-full">
                    {sidebarContent}
                  </nav>
                </SheetContent>
              </Sheet>
               <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary sm:hidden">
                  <Wrench className="h-6 w-6" />
                  <span>HandyTask</span>
                </Link>
            </header>
          )}
          {!isMobile && (
             <header className="sticky top-0 z-30 flex h-14 items-center justify-end gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                {/* Placeholder for potential header actions like user profile dropdown */}
            </header>
          )}
          <main className="flex-1 overflow-auto p-4 sm:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
