/**
 * Cargador de secuencias de fotogramas para las escenas de scrubbing.
 *
 * La regla que gobierna este archivo, aprendida a golpes en un iPhone real:
 * **el teléfono no redimensiona nada**. Se le sirve una secuencia que ya viene
 * pequeña (ver `SECUENCIA_MOVIL` en los componentes) y aquí solo se descarga y
 * se decodifica. Todo intento de ahorrar memoria en el navegador falló:
 *
 *   · `createImageBitmap(blob, { resizeWidth })` — Safari **lanza excepción**
 *     por debajo de la 17. No lo ignora: revienta. Y al reventar el fotograma 0,
 *     no se creaba el ScrollTrigger, el hero no se anclaba y el scroll pasaba
 *     de largo con el lienzo vacío.
 *   · Reducir cada fotograma dibujándolo en un `<canvas>` — iOS limita cuántos
 *     lienzos puede tener viva una página. Pasado el cupo, `getContext('2d')`
 *     devuelve null, el `drawImage` siguiente revienta dentro del `onload`, la
 *     promesa **nunca se resuelve** y el obrero se queda colgado para siempre.
 *     Con ocho obreros colgados la carga muere en silencio a los ~15 fotogramas
 *     — todos del arranque, que en el hero son nuca en primer plano. De ahí que
 *     pareciera "una foto fija" por más que el copy sí avanzara.
 *
 * Lo que sí se conserva:
 *
 * 1. ORDEN POR REFINAMIENTO, no 0·1·2·3. Pedirlos en orden es lo peor posible:
 *    quien baja rápido recorre la escena entera antes de que lleguen los
 *    fotogramas del final y la animación se queda clavada. En vez de eso
 *    barremos toda la secuencia con paso grueso y lo vamos partiendo, así hay
 *    material repartido por todo el recorrido desde el primer segundo.
 * 2. VARIAS PETICIONES A LA VEZ, en lugar de un `await` por fotograma.
 * 3. `nearestLoaded`: mientras falten fotogramas se dibuja el vecino disponible
 *    en lugar de no dibujar nada.
 * 4. NINGÚN OBRERO PUEDE COLGARSE. Cada carga lleva un plazo máximo; si se pasa,
 *    se da por perdida y se sigue. Un fotograma menos es un detalle, la cola
 *    detenida se lleva la escena entera por delante.
 */

const CONCURRENCIA = 6;
const PLAZO_MS = 15000;

/**
 * Orden de carga: barridos cada vez más finos sobre toda la secuencia.
 */
export function refinementOrder(total, firstStride = 16) {
  const orden = [];
  const visto = new Set();
  const push = (i) => {
    if (i >= 0 && i < total && !visto.has(i)) {
      visto.add(i);
      orden.push(i);
    }
  };

  push(0);
  push(total - 1);
  for (let paso = firstStride; paso >= 1; paso = Math.floor(paso / 2)) {
    for (let i = 0; i < total; i += paso) push(i);
    if (paso === 1) break;
  }
  // Red de seguridad por si el paso nunca llegó a cubrir algún índice.
  for (let i = 0; i < total; i += 1) push(i);
  return orden;
}

/**
 * Devuelve el fotograma cargado más cercano al pedido. Esto es lo que evita
 * que el lienzo se congele mientras la secuencia termina de llegar.
 */
export function nearestLoaded(images, index) {
  if (images[index]) return images[index];
  for (let d = 1; d < images.length; d += 1) {
    const antes = index - d;
    const despues = index + d;
    if (antes >= 0 && images[antes]) return images[antes];
    if (despues < images.length && images[despues]) return images[despues];
  }
  return null;
}

/** Pantallas donde se sirve la secuencia ligera. */
export const esPantallaChica = () =>
  typeof window !== 'undefined' && window.innerWidth < 768;

/**
 * Arranca la carga de una secuencia.
 *
 * @param {number}   total    cantidad de fotogramas
 * @param {Function} src      (i) => url del fotograma
 * @param {Array}    images   arreglo destino; se rellena en el sitio
 * @param {number}   eager    primeros fotogramas, pedidos de corrido
 * @param {Function} onReady  se llama al tener los `eager` (recibe si hay 0)
 * @param {Function} onFrame  cada vez que llega uno nuevo: sirve para repintar
 * @returns {Function} cancelar
 */
export function loadSequence({ total, src, images, eager = 12, onReady, onFrame }) {
  let cancelado = false;
  let usarBitmap = typeof createImageBitmap === 'function';

  // Sin opciones: es la única forma que soportan todas las versiones de Safari.
  // A cambio de eso, el mapa que devuelve no se puede purgar — al contrario que
  // el de un `<img>`, que Safari sí descarta cuando va justa de memoria y deja
  // a `drawImage` pintando nada.
  const desdeBitmap = async (i) => {
    try {
      const res = await fetch(src(i));
      if (!res.ok || cancelado) return null;
      const blob = await res.blob();
      if (cancelado) return null;
      const bmp = await createImageBitmap(blob);
      if (cancelado) {
        bmp.close?.();
        return null;
      }
      images[i] = bmp;
      return bmp;
    } catch {
      return null;
    }
  };

  // Reserva. `decode()` antes de guardarla evita que `drawImage` reciba una
  // imagen a medio decodificar y no pinte nada.
  const desdeImg = (i) =>
    new Promise((resolve) => {
      const img = new Image();
      const listo = () => {
        if (cancelado) return resolve(null);
        images[i] = img;
        return resolve(img);
      };
      img.onload = () => {
        if (img.decode) img.decode().then(listo, listo);
        else listo();
      };
      img.onerror = () => resolve(null);
      img.src = src(i);
    });

  // Nada de esto puede quedarse esperando para siempre.
  const conPlazo = (promesa) =>
    new Promise((resolve) => {
      let hecho = false;
      const t = setTimeout(() => {
        if (!hecho) {
          hecho = true;
          resolve(null);
        }
      }, PLAZO_MS);
      promesa.then(
        (v) => {
          if (!hecho) {
            hecho = true;
            clearTimeout(t);
            resolve(v);
          }
        },
        () => {
          if (!hecho) {
            hecho = true;
            clearTimeout(t);
            resolve(null);
          }
        },
      );
    });

  const load = async (i) => {
    if (usarBitmap) {
      const r = await conPlazo(desdeBitmap(i));
      if (r) return r;
      if (cancelado) return null;
      // Si el bitmap no sale, se abandona ese camino para toda la secuencia.
      usarBitmap = false;
    }
    return conPlazo(desdeImg(i));
  };

  (async () => {
    // Arranque: los primeros de corrido y en paralelo, para pintar cuanto antes.
    await Promise.all(Array.from({ length: Math.min(eager, total) }, (_, i) => load(i)));
    if (cancelado) return;
    onReady?.(Boolean(images[0]));

    const cola = refinementOrder(total).filter((i) => !images[i]);
    let cursor = 0;

    const obrero = async () => {
      while (!cancelado) {
        const i = cola[cursor];
        cursor += 1;
        if (i === undefined) return;
        if (images[i]) continue;
        await load(i);
        if (cancelado) return;
        // Repintamos aunque el usuario no se mueva: el fotograma que se está
        // viendo puede ser un vecino y el recién llegado ser el exacto.
        onFrame?.();
      }
    };

    await Promise.all(Array.from({ length: CONCURRENCIA }, obrero));
  })();

  return () => {
    cancelado = true;
    // Los ImageBitmap no los recoge el GC solo: hay que soltarlos a mano o la
    // memoria se queda ocupada entre montajes (React Strict Mode los duplica).
    images.forEach((f, i) => {
      f?.close?.();
      images[i] = null;
    });
  };
}
