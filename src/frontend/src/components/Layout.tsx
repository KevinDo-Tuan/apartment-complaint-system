import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  Building2,
  ClipboardList,
  LogIn,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGetUserProfile } from "../hooks/useQueries";

interface LayoutProps {
  children: React.ReactNode;
}

const navLinks = [
  { to: "/", label: "Complaint Board", icon: ClipboardList },
  { to: "/host", label: "Host Dashboard", icon: Building2 },
  { to: "/profile", label: "My Profile", icon: User },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { identity, login, clear } = useInternetIdentity();
  const { data: userProfile } = useGetUserProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const roleLabel = userProfile
    ? "Host" in userProfile.role
      ? "Host"
      : "Tenant"
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link
              to="/"
              className="flex items-center gap-2.5 font-display font-semibold text-foreground text-lg hover:text-primary transition-colors duration-200"
              data-ocid="nav.logo_link"
            >
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <Building2 className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="hidden sm:inline">
                Apartment Complaint System
              </span>
              <span className="sm:hidden">ACS</span>
            </Link>

            {/* Desktop Nav */}
            <nav
              className="hidden md:flex items-center gap-1"
              data-ocid="nav.desktop_links"
            >
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  data-ocid={`nav.${label.toLowerCase().replace(/\s+/g, "_")}_link`}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive(to)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </nav>

            {/* Auth Area */}
            <div className="flex items-center gap-3">
              {identity ? (
                <div className="hidden md:flex items-center gap-2">
                  {roleLabel && (
                    <Badge variant="outline" className="text-xs font-medium">
                      {roleLabel}
                    </Badge>
                  )}
                  {userProfile && (
                    <span className="text-sm text-muted-foreground max-w-[120px] truncate">
                      {userProfile.name}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clear()}
                    className="gap-1.5 text-muted-foreground hover:text-foreground"
                    data-ocid="nav.logout_button"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => login()}
                  className="hidden md:flex gap-1.5"
                  data-ocid="nav.login_button"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in
                </Button>
              )}

              {/* Mobile menu toggle */}
              <button
                type="button"
                className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label="Toggle menu"
                data-ocid="nav.mobile_menu_toggle"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t border-border bg-card"
            data-ocid="nav.mobile_menu"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive(to)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
              <div className="pt-2 border-t border-border">
                {identity ? (
                  <div className="space-y-2">
                    {userProfile && (
                      <div className="flex items-center gap-2 px-3 py-1">
                        {roleLabel && (
                          <Badge variant="outline" className="text-xs">
                            {roleLabel}
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground truncate">
                          {userProfile.name}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        clear();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      data-ocid="nav.mobile_logout_button"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      login();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-md text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                    data-ocid="nav.mobile_login_button"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign in with Internet Identity
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-background">{children}</main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>Apartment Complaint System</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Apartment Complaint System. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
