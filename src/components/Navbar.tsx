import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type AppView =
  | 'home'
  | 'explore'
  | 'detail'
  | 'booking'
  | 'auth'
  | 'tourist-bookings'
  | 'owner-dashboard'
  | 'admin-dashboard';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView, sectionId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLink = (view: AppView, sectionId?: string) => {
    setMobileOpen(false);
    onNavigate(view, sectionId);
  };

  const getDashboardView = (): AppView => {
    if (!user) return 'auth';
    if (user.role === 'administrador') return 'admin-dashboard';
    if (user.role === 'propietario') return 'owner-dashboard';
    return 'tourist-bookings';
  };

  const getAccountLabel = () => {
    if (!user) return 'Iniciar sesión';
    if (user.role === 'administrador') return 'Panel Admin';
    if (user.role === 'propietario') return 'Panel Propietario';
    return 'Mis reservas';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#24313A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleLink('home')}
          className="font-display text-xl font-semibold tracking-tight text-[#173B57] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#397B91] rounded-sm"
        >
          Serrano Reservas
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#24313A]/80">
          <button
            type="button"
            onClick={() => handleLink('home')}
            className={`whitespace-nowrap shrink-0 cursor-pointer transition-colors hover:text-[#173B57] underline-offset-4 ${
              currentView === 'home' ? 'text-[#173B57] underline' : 'hover:underline'
            }`}
          >
            Inicio
          </button>
          <button
            type="button"
            onClick={() => handleLink('explore')}
            className={`whitespace-nowrap shrink-0 cursor-pointer transition-colors hover:text-[#173B57] underline-offset-4 ${
              currentView === 'explore' ? 'text-[#173B57] underline' : 'hover:underline'
            }`}
          >
            Alojamientos
          </button>
          <button
            type="button"
            onClick={() => handleLink('home', 'destinos')}
            className="whitespace-nowrap shrink-0 cursor-pointer transition-colors hover:text-[#173B57] hover:underline underline-offset-4"
          >
            Destinos
          </button>
          <button
            type="button"
            onClick={() => handleLink('home', 'como-funciona')}
            className="whitespace-nowrap shrink-0 cursor-pointer transition-colors hover:text-[#173B57] hover:underline underline-offset-4"
          >
            Cómo funciona
          </button>
          <button
            type="button"
            onClick={() => handleLink(getDashboardView())}
            className={`whitespace-nowrap shrink-0 cursor-pointer transition-colors hover:text-[#173B57] underline-offset-4 ${
              currentView === 'auth' ||
              currentView === 'tourist-bookings' ||
              currentView === 'owner-dashboard' ||
              currentView === 'admin-dashboard'
                ? 'text-[#173B57] underline font-semibold'
                : 'hover:underline'
            }`}
          >
            {getAccountLabel()}
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          {user && (
            <button
              type="button"
              onClick={() => {
                logout();
                onNavigate('home');
              }}
              className="text-xs font-medium text-[#24313A]/70 hover:text-[#173B57] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Salir
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (user?.role === 'propietario') {
                handleLink('owner-dashboard');
              } else if (user?.role === 'administrador') {
                handleLink('admin-dashboard');
              } else {
                handleLink('auth');
              }
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-[#173B57] hover:bg-[#102B40] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#397B91]"
          >
            Publicá tu alojamiento
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          className="lg:hidden p-2 rounded-lg text-[#173B57] hover:bg-[#F7F8F5] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#24313A]/10 bg-white px-4 py-4 space-y-2">
          <button
            type="button"
            onClick={() => handleLink('home')}
            className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#24313A] hover:bg-[#F7F8F5] rounded-lg"
          >
            Inicio
          </button>
          <button
            type="button"
            onClick={() => handleLink('explore')}
            className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#24313A] hover:bg-[#F7F8F5] rounded-lg"
          >
            Alojamientos
          </button>
          <button
            type="button"
            onClick={() => handleLink('home', 'destinos')}
            className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#24313A] hover:bg-[#F7F8F5] rounded-lg"
          >
            Destinos
          </button>
          <button
            type="button"
            onClick={() => handleLink('home', 'como-funciona')}
            className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#24313A] hover:bg-[#F7F8F5] rounded-lg"
          >
            Cómo funciona
          </button>
          <button
            type="button"
            onClick={() => handleLink(getDashboardView())}
            className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#173B57] hover:bg-[#F7F8F5] rounded-lg"
          >
            {getAccountLabel()}
          </button>
          {user && (
            <button
              type="button"
              onClick={() => {
                logout();
                setMobileOpen(false);
                onNavigate('home');
              }}
              className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#24313A]/70 hover:bg-[#F7F8F5] rounded-lg"
            >
              Cerrar sesión ({user.name})
            </button>
          )}
          <div className="pt-2">
            <button
              type="button"
              onClick={() =>
                handleLink(user?.role === 'propietario' ? 'owner-dashboard' : 'auth')
              }
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-[#173B57] hover:bg-[#102B40] rounded-lg transition-colors"
            >
              Publicá tu alojamiento
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
