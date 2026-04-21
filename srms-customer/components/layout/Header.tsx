"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, User, Phone, Home, LogOut, UserCircle, FileText, ChevronDown, AlertTriangle } from "lucide-react";
import Container from "./Container";
import Button from "../common/Button";
import NotificationBell from "../notifications/NotificationBell";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Services", href: "/services" },
    { name: "My Requests", href: "/my-requests" },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  const userMenuItems = [
    { name: "Profile", href: "/profile", icon: UserCircle },
    { name: "My Requests", href: "/my-requests", icon: FileText },
    { name: "Complaints", href: "/complaints", icon: AlertTriangle },
  ];

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLogin = () => {
    router.push("/login");
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <img
              src="/logo-1.png"
              alt="SRMS Logo"
              className="h-9 w-auto md:h-11"
            />
            <div className="hidden sm:block leading-tight">
              <span className="text-lg font-bold text-neutral-900 block">SRMS</span>
              <p className="text-xs text-neutral-500">Home Services</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-lg transition-colors font-medium",
                    isActive
                      ? "text-primary-600 bg-primary-50"
                      : "text-neutral-700 hover:text-primary-600 hover:bg-primary-50"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <Link href="/services">
                  <Button variant="primary" size="sm">
                    Book Service
                  </Button>
                </Link>
                <NotificationBell />
                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user?.firstName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="font-medium text-sm">{user?.firstName || 'User'}</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform",
                      userMenuOpen && "rotate-180"
                    )} />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-2">
                      <div className="px-4 py-3 border-b border-neutral-200">
                        <p className="text-sm font-semibold text-neutral-900">
                          {user?.firstName || ''} {user?.lastName || ''}
                        </p>
                        <p className="text-xs text-neutral-600 truncate">{user?.email || ''}</p>
                      </div>
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                        >
                          <item.icon className="w-4 h-4" />
                          {item.name}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors mt-1 border-t border-neutral-200"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={handleLogin}>
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Link href="/services">
                  <Button variant="primary" size="sm">
                    Book Service
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </Container>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden border-t border-neutral-200 bg-white",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <Container>
          <nav className="py-4 space-y-2">
            {/* User Info (Mobile) */}
            {isAuthenticated && user && (
              <div className="px-4 py-3 bg-neutral-50 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user?.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {user?.firstName || ''} {user?.lastName || ''}
                    </p>
                    <p className="text-xs text-neutral-600">{user?.email || ''}</p>
                  </div>
                </div>
              </div>
            )}

            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium",
                    isActive
                      ? "bg-primary-50 text-primary-600"
                      : "text-neutral-700 hover:bg-primary-50 hover:text-primary-600"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon && <item.icon className="w-5 h-5" />}
                  {item.name}
                </Link>
              );
            })}

            <div className="pt-4 space-y-2">
              {isAuthenticated && user ? (
                <>
                  <Link href="/services" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full" size="md">
                      Book Service
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-600 hover:bg-red-50"
                    size="md"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full" size="md" onClick={handleLogin}>
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                  <Link href="/services" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full" size="md">
                      Book Service
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </Container>
      </div>
    </header>
  );
}
