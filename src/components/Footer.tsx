import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import type { AppView } from './Navbar';

interface FooterProps {
  onNavigate: (view: AppView, sectionId?: string) => void;
  onSelectDestination: (destination: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectDestination }) => {
  const destinos = [
    'Villa Carlos Paz',
    'Tanti',
    'Cabalango',
    'Cuesta Blanca',
    'San Antonio de Arredondo',
  ];

  return (
    <footer className="bg-[#173B57] text-white/90 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/15">
          <div className="space-y-4">
            <h3 className="font-display text-xl font-semibold text-white">Serrano Reservas</h3>
            <p className="text-sm text-white/75 leading-relaxed">
              Plataforma regional de reservas turísticas en Villa Carlos Paz y el Valle de Punilla.
              Conectamos viajeros con anfitriones locales verificados.
            </p>
            <div className="flex items-center gap-4 pt-1 text-xs text-white/75">
              <a
                href="#instagram"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('home');
                }}
                className="hover:text-white underline-offset-4 hover:underline"
              >
                Instagram
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="#facebook"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('home');
                }}
                className="hover:text-white underline-offset-4 hover:underline"
              >
                Facebook
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="#whatsapp"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('home', 'como-funciona');
                }}
                className="hover:text-white underline-offset-4 hover:underline"
              >
                WhatsApp Turístico
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Navegación</h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('explore')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Explorar alojamientos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home', 'como-funciona')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Cómo funciona la seña del 20%
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('auth')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Acceso propietarios y turistas
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Destinos en Punilla</h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              {destinos.map((dest) => (
                <li key={dest}>
                  <button
                    type="button"
                    onClick={() => onSelectDestination(dest)}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {dest}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contacto regional</h4>
            <ul className="space-y-3 text-sm text-white/75">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#779B75]" />
                <span>Av. San Martín 450, Local 4, Villa Carlos Paz, Córdoba (CP 5152)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 shrink-0 text-[#779B75]" />
                <span className="tabular-nums">+54 9 3541 42-8190</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 shrink-0 text-[#779B75]" />
                <span>hola@serranoreservas.ar</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/65">
          <p>© 2026 Serrano Reservas · Villa Carlos Paz, Córdoba, Argentina.</p>
          <p>Tarifas expresadas en Pesos Argentinos (ARS) · Atención turística local.</p>
        </div>
      </div>
    </footer>
  );
};
