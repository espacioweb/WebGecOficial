import { ScrollTrigger } from './gsapSetup';

// "Volver al punto": cuando alguien entra a una página de pilar desde su
// tarjeta del Home y quiere regresar, debe aterrizar en esa misma tarjeta —
// no al inicio del Home, que obliga a recorrer otra vez el Hero pineado
// (5940 px) para encontrar dónde iba.
//
// Se guarda el id de la tarjeta (no un scrollY): la altura del Home cambia
// mientras cargan los fotogramas y videos, así que un número de píxeles
// guardado no apuntaría al mismo lugar al volver; el id sí.
const CLAVE = 'gec-retorno';

export function guardarRetorno(pilar) {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify({ id: pilar.id, nombre: pilar.name }));
  } catch {
    /* modo privado: simplemente no se ofrece el botón */
  }
}

export function leerRetorno() {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE) || 'null');
  } catch {
    return null;
  }
}

// Lleva el Home hasta la tarjeta `id`. Espera a que exista el pin del Hero:
// sin él, la tarjeta está ~6000 px más arriba de donde termina quedando y el
// scroll aterriza en el lugar equivocado. Primero salta en seco a poco antes
// de la tarjeta (no tiene sentido "volar" por todo el Hero) y recorre el
// último tramo con Lenis, suave. Al llegar, la tarjeta da un destello dorado
// breve para que el ojo sepa dónde quedó.
// Probado: medir apenas aparece el `.pin-spacer` no basta — el pin del Hero
// se crea primero con altura parcial y crece cuando ScrollTrigger refresca,
// así que el primer cálculo caía ~6000 px antes (a mitad del Hero). Ahora se
// espera a que la posición de la tarjeta deje de moverse entre dos lecturas
// seguidas, y al terminar el recorrido se vuelve a medir y se corrige si el
// layout cambió en el camino.
const absTop = (el) => el.getBoundingClientRect().top + window.scrollY;

export function irATarjeta(id, lenis) {
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let intentos = 0;
  let previo = null;

  const llegar = (el, correcciones = 0) => {
    const destino = absTop(el) - 24;
    const verificar = () => {
      const desfase = Math.abs(absTop(el) - 24 - window.scrollY);
      if (desfase > 40 && correcciones < 3) llegar(el, correcciones + 1);
      else destellar(el);
    };
    if (lenis && !reducido) {
      if (correcciones === 0) lenis.scrollTo(destino - 420, { immediate: true });
      lenis.scrollTo(destino, {
        duration: correcciones === 0 ? 1.4 : 0.6,
        easing: (t) => 1 - Math.pow(1 - t, 4),
        onComplete: () => setTimeout(verificar, 120),
      });
    } else {
      window.scrollTo(0, destino);
      setTimeout(verificar, 200);
    }
  };

  const esperarEstable = () => {
    const el = document.getElementById(id);
    const pin = document.querySelector('.pin-spacer');
    const listo = el && pin && pin.offsetHeight > window.innerHeight * 2;
    const pos = el ? absTop(el) : null;
    if ((!listo || pos !== previo) && intentos++ < 60) {
      previo = pos;
      if (listo) ScrollTrigger.refresh();
      setTimeout(esperarEstable, 150);
      return;
    }
    if (el) llegar(el);
  };

  esperarEstable();
}

function destellar(el) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  el.animate(
    [
      { boxShadow: '0 0 0 0 rgba(245,179,1,0)' },
      { boxShadow: '0 0 0 3px rgba(245,179,1,.75), 0 0 60px 0 rgba(245,179,1,.35)' },
      { boxShadow: '0 0 0 0 rgba(245,179,1,0)' },
    ],
    { duration: 1400, easing: 'cubic-bezier(.2,.8,.2,1)' },
  );
}
