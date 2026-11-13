import React, { useCallback, useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './lib/api';
import { getDefaultCheckInISO, getDefaultCheckOutISO } from './lib/format';
import type { Accommodation, AccommodationDetail, SearchFilters, User } from './types';
import { Navbar, type AppView } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { AccommodationDetailPage } from './pages/AccommodationDetailPage';
import { BookingFlowPage } from './pages/BookingFlowPage';
import { AuthPage } from './pages/AuthPage';
import { TouristBookingsPage } from './pages/TouristBookingsPage';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const DEFAULT_FILTERS: SearchFilters = {
  destination: 'Todos',
  checkIn: getDefaultCheckInISO(),
  checkOut: getDefaultCheckOutISO(),
  guests: 2,
  minPrice: 0,
  maxPrice: 250000,
  type: 'Todos',
  amenities: [],
  sortBy: 'recommended',
};

const SerranoAppContent: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<AppView>('home');
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [homeAccommodations, setHomeAccommodations] = useState<Accommodation[]>([]);
  const [exploreAccommodations, setExploreAccommodations] = useState<Accommodation[]>([]);
  const [loadingHome, setLoadingHome] = useState(true);
  const [loadingExplore, setLoadingExplore] = useState(false);

  const [selectedAccommodationId, setSelectedAccommodationId] = useState<string>('acc-los-aromos');
  const [bookingDraft, setBookingDraft] = useState<{
    accommodation: AccommodationDetail;
    checkIn: string;
    checkOut: string;
    guestsCount: number;
  } | null>(null);

  // Load initial featured accommodations for Home
  useEffect(() => {
    setLoadingHome(true);
    api
      .listAccommodations()
      .then((res) => setHomeAccommodations(res.accommodations))
      .finally(() => setLoadingHome(false));
  }, []);

  // Load filtered accommodations when in Explore view or filters change
  const fetchExplore = useCallback(async (activeFilters: SearchFilters) => {
    setLoadingExplore(true);
    try {
      const res = await api.listAccommodations(activeFilters);
      setExploreAccommodations(res.accommodations);
    } finally {
      setLoadingExplore(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'explore') {
      fetchExplore(filters);
    }
  }, [view, filters, fetchExplore]);

  const navigateTo = (nextView: AppView, sectionId?: string) => {
    setView(nextView);
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFiltersChange = (patch: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const handleSelectDestination = (destination: string) => {
    setFilters((prev) => ({ ...prev, destination, type: 'Todos' }));
    navigateTo('explore');
  };

  const handleSelectAccommodation = (id: string) => {
    setSelectedAccommodationId(id);
    navigateTo('detail');
  };

  const handleAuthenticated = (loggedUser: User) => {
    if (loggedUser.role === 'administrador') {
      navigateTo('admin-dashboard');
    } else if (loggedUser.role === 'propietario') {
      navigateTo('owner-dashboard');
    } else {
      navigateTo('tourist-bookings');
    }
  };

  // Protect role-specific views gracefully if user logs out
  const renderMain = () => {
    if (view === 'owner-dashboard') {
      if (!user || (user.role !== 'propietario' && user.role !== 'administrador')) {
        return <AuthPage onAuthenticated={handleAuthenticated} />;
      }
      return <OwnerDashboardPage />;
    }

    if (view === 'admin-dashboard') {
      if (!user || user.role !== 'administrador') {
        return <AuthPage onAuthenticated={handleAuthenticated} />;
      }
      return <AdminDashboardPage />;
    }

    if (view === 'tourist-bookings') {
      if (!user) {
        return <AuthPage onAuthenticated={handleAuthenticated} />;
      }
      return (
        <TouristBookingsPage
          onExplore={() => navigateTo('explore')}
          onSelectAccommodation={handleSelectAccommodation}
        />
      );
    }

    if (view === 'auth') {
      return <AuthPage onAuthenticated={handleAuthenticated} />;
    }

    if (view === 'detail') {
      return (
        <AccommodationDetailPage
          accommodationId={selectedAccommodationId}
          initialCheckIn={filters.checkIn}
          initialCheckOut={filters.checkOut}
          initialGuests={filters.guests}
          onBack={() => navigateTo('explore')}
          onStartBooking={(draft) => {
            setBookingDraft(draft);
            navigateTo('booking');
          }}
        />
      );
    }

    if (view === 'booking' && bookingDraft) {
      return (
        <BookingFlowPage
          accommodation={bookingDraft.accommodation}
          initialCheckIn={bookingDraft.checkIn}
          initialCheckOut={bookingDraft.checkOut}
          initialGuests={bookingDraft.guestsCount}
          onCancel={() => navigateTo('detail')}
          onCompleteToExplore={() => navigateTo('explore')}
          onGoToBookings={() => navigateTo('tourist-bookings')}
        />
      );
    }

    if (view === 'explore') {
      return (
        <ExplorePage
          accommodations={exploreAccommodations}
          loading={loadingExplore}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onApplySearch={() => fetchExplore(filters)}
          onResetFilters={() => setFilters(DEFAULT_FILTERS)}
          onSelectAccommodation={handleSelectAccommodation}
        />
      );
    }

    return (
      <HomePage
        accommodations={homeAccommodations}
        loading={loadingHome}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={() => navigateTo('explore')}
        onSelectAccommodation={handleSelectAccommodation}
        onSelectDestination={handleSelectDestination}
        onGoExplore={() => navigateTo('explore')}
        onGoAuth={() => navigateTo('auth')}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F5] text-[#24313A]">
      <Navbar currentView={view} onNavigate={navigateTo} />
      <main className="flex-1">{renderMain()}</main>
      <Footer onNavigate={navigateTo} onSelectDestination={handleSelectDestination} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SerranoAppContent />
    </AuthProvider>
  );
}
