import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, KeyRound, Shield, UserCheck } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { User, UserRole } from '../types';

interface AuthPageProps {
  onAuthenticated: (user: User) => void;
}

type AuthTab = 'login' | 'register' | 'recover';

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthenticated }) => {
  const { login, loginDemo, register } = useAuth();
  const [tab, setTab] = useState<AuthTab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('turista');

  // Recover state
  const [recoverEmail, setRecoverEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const user = await login(loginEmail, loginPassword);
      onAuthenticated(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const user = await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        phone: regPhone,
        city: regCity,
      });
      onAuthenticated(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.recoverPassword(recoverEmail);
      setSuccess(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async (role: UserRole) => {
    setError('');
    setLoading(true);
    try {
      const user = await loginDemo(role);
      onAuthenticated(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en el acceso rápido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Auth Forms */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#24313A]/10 p-6 sm:p-8 space-y-6">
          <div className="flex gap-1 p-1 bg-[#F7F8F5] rounded-lg">
            {(
              [
                { id: 'login', label: 'Iniciar sesión' },
                { id: 'register', label: 'Crear cuenta' },
                { id: 'recover', label: 'Recuperar clave' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id);
                  setError('');
                  setSuccess('');
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  tab === item.id
                    ? 'bg-white text-[#173B57] shadow-sm'
                    : 'text-[#24313A]/70 hover:text-[#173B57]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/25 text-xs text-[#991B1B] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-lg bg-[#779B75]/15 border border-[#779B75]/30 text-xs text-[#173B57] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#779B75] shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-semibold text-[#173B57]">
                  Ingresá a Serrano Reservas
                </h1>
                <p className="text-sm text-[#24313A]/70 mt-1">
                  Gestioná tus viajes, establecimientos o reservas en Villa Carlos Paz.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#24313A]/75 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="nombre@correo.com"
                  className="w-full h-11 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397B91]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#24313A]/75 mb-1.5">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#397B91]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#173B57] hover:bg-[#102B40] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-semibold text-[#173B57]">
                  Creá tu cuenta gratuita
                </h1>
                <p className="text-sm text-[#24313A]/70 mt-1">
                  Elegí si querés reservar como turista o publicar tus cabañas y hoteles.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRegRole('turista')}
                  className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                    regRole === 'turista'
                      ? 'border-[#173B57] bg-[#173B57]/5'
                      : 'border-[#24313A]/12'
                  }`}
                >
                  <div className="text-sm font-semibold text-[#173B57]">Soy Turista</div>
                  <div className="text-xs text-[#24313A]/65">Quiero buscar y reservar</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('propietario')}
                  className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                    regRole === 'propietario'
                      ? 'border-[#173B57] bg-[#173B57]/5'
                      : 'border-[#24313A]/12'
                  }`}
                >
                  <div className="text-sm font-semibold text-[#173B57]">Soy Propietario</div>
                  <div className="text-xs text-[#24313A]/65">Quiero publicar alojamientos</div>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#24313A]/75 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ej. Laura Méndez"
                    className="w-full h-11 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#24313A]/75 mb-1">
                    Ciudad de origen
                  </label>
                  <input
                    type="text"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="Ej. Córdoba Capital"
                    className="w-full h-11 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#24313A]/75 mb-1">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="laura@correo.com"
                    className="w-full h-11 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#24313A]/75 mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+54 9 351 000-0000"
                    className="w-full h-11 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#24313A]/75 mb-1">
                  Contraseña (mínimo 6 caracteres) *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#173B57] hover:bg-[#102B40] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Creando cuenta...' : 'Registrarme en Serrano Reservas'}
              </button>
            </form>
          )}

          {tab === 'recover' && (
            <form onSubmit={handleRecover} className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-semibold text-[#173B57]">
                  Recuperar contraseña
                </h1>
                <p className="text-sm text-[#24313A]/70 mt-1">
                  Ingresá tu correo y te enviaremos un enlace para generar una nueva clave.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#24313A]/75 mb-1.5">
                  Correo electrónico registrado
                </label>
                <input
                  type="email"
                  required
                  value={recoverEmail}
                  onChange={(e) => setRecoverEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full h-11 px-3 text-sm bg-[#F7F8F5] border border-[#24313A]/15 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#173B57] hover:bg-[#102B40] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar instrucciones de recuperación'}
              </button>
            </form>
          )}
        </div>

        {/* Demo Roles Panel */}
        <aside className="lg:col-span-5 bg-white rounded-xl border border-[#24313A]/10 p-6 space-y-5">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#173B57]">
              Acceso rápido de demostración
            </h2>
            <p className="text-xs text-[#24313A]/70 mt-1 leading-relaxed">
              Explorá los tres perfiles diferenciados de la plataforma con datos reales precargados de Villa Carlos Paz.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoAccess('turista')}
              className="w-full text-left p-4 rounded-xl border border-[#24313A]/12 hover:border-[#397B91] hover:bg-[#F7F8F5] transition-colors flex items-start gap-3 cursor-pointer"
            >
              <UserCheck className="w-5 h-5 text-[#397B91] shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-[#173B57]">
                  Ingresar como Turista
                </div>
                <div className="text-xs text-[#24313A]/70 mt-0.5">
                  Sofía Martínez · Ver reservas realizadas, códigos y saldos.
                </div>
              </div>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoAccess('propietario')}
              className="w-full text-left p-4 rounded-xl border border-[#24313A]/12 hover:border-[#397B91] hover:bg-[#F7F8F5] transition-colors flex items-start gap-3 cursor-pointer"
            >
              <KeyRound className="w-5 h-5 text-[#779B75] shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-[#173B57]">
                  Ingresar como Propietario
                </div>
                <div className="text-xs text-[#24313A]/70 mt-0.5">
                  Martín Echeverría · Editar tarifas, calendario de disponibilidad y reservas recibidas.
                </div>
              </div>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoAccess('administrador')}
              className="w-full text-left p-4 rounded-xl border border-[#24313A]/12 hover:border-[#397B91] hover:bg-[#F7F8F5] transition-colors flex items-start gap-3 cursor-pointer"
            >
              <Shield className="w-5 h-5 text-[#173B57] shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-[#173B57]">
                  Ingresar como Administrador
                </div>
                <div className="text-xs text-[#24313A]/70 mt-0.5">
                  Carolina Salgado · Métricas globales, gestión de usuarios, complejos y reservas.
                </div>
              </div>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
