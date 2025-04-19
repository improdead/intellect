'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  BarChart2,
  Clock,
  Brain,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard/intelect', icon: <Brain className="h-5 w-5" /> },
    { name: 'Quiz', href: '/dashboard/quiz', icon: <HelpCircle className="h-5 w-5" /> },
    { name: 'Progress', href: '/dashboard/progress', icon: <BarChart2 className="h-5 w-5" /> },
    { name: 'History', href: '/dashboard/history', icon: <Clock className="h-5 w-5" /> },
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      {!collapsed && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-40"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transition-all duration-300 ${
          collapsed ? 'w-[60px]' : 'w-[250px]'
        } font-rubik`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and collapse button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                  <span className="text-white font-bold">I</span>
                </div>
                <span className="font-semibold text-lg">Intelect</span>
              </div>
            )}

            {collapsed && (
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center mx-auto">
                <span className="text-white font-bold">I</span>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full ${collapsed ? 'absolute -right-3 top-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800' : ''}`}
              onClick={toggleSidebar}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation links */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <span className={isActive ? 'text-primary' : ''}>{item.icon}</span>
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User profile and settings */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <div className={`flex ${collapsed ? 'flex-col' : 'items-center'} gap-3`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src="/abstract-user-icon.png" />
                <AvatarFallback className="bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </AvatarFallback>
              </Avatar>

              {!collapsed && (
                <div className="flex-1">
                  <p className="font-medium text-sm">Li Dekai</p>
                  <p className="text-xs text-muted-foreground">View profile</p>
                </div>
              )}
            </div>

            <div className={`mt-4 flex ${collapsed ? 'flex-col' : ''} gap-2`}>
              <Button
                variant="ghost"
                size={collapsed ? "icon" : "sm"}
                className="w-full justify-start"
              >
                <Settings className="h-4 w-4 mr-2" />
                {!collapsed && <span>Settings</span>}
              </Button>

              <Button
                variant="ghost"
                size={collapsed ? "icon" : "sm"}
                className="w-full justify-start"
                onClick={() => window.location.href = "/api/auth/logout"}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {!collapsed && <span>Logout</span>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
