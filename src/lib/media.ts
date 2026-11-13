import heroCarlosPaz from '../assets/images/hero_carlos_paz_1794613413245.jpg';
import cabanasLosAromos from '../assets/images/cabanas_los_aromos_1794613412540.jpg';
import hotelVistaLago from '../assets/images/hotel_vista_lago_1794613413512.jpg';
import complejoLasSierras from '../assets/images/complejo_las_sierras_1794613414022.jpg';
import cabanasDelSol from '../assets/images/cabanas_del_sol_1794613414376.jpg';
import apartCostaAzul from '../assets/images/apart_costa_azul_1794613414588.jpg';
import posadaElMirador from '../assets/images/posada_el_mirador_1794613415234.jpg';
import destinoRioSerrano from '../assets/images/destino_rio_serrano_1794613414852.jpg';

const MEDIA_MAP: Record<string, string> = {
  hero_carlos_paz: heroCarlosPaz,
  cabanas_los_aromos: cabanasLosAromos,
  hotel_vista_lago: hotelVistaLago,
  complejo_las_sierras: complejoLasSierras,
  cabanas_del_sol: cabanasDelSol,
  apart_costa_azul: apartCostaAzul,
  posada_el_mirador: posadaElMirador,
  destino_rio_serrano: destinoRioSerrano,
};

export function resolveMediaUrl(key: string): string {
  return MEDIA_MAP[key] || cabanasLosAromos;
}
