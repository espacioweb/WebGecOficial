/**
 * Cargador de secuencias de fotogramas para las escenas de scrubbing.
 *
 * Tres decisiones que parecen detalles y son la diferencia entre que la escena
 * se vea o no en un teléfono:
 *
 * 1. ORDEN POR REFINAMIENTO, no 0·1·2·3. Pedirlos en orden es lo peor posible:
 *    quien baja rápido recorre la escena entera antes de que lleguen los
 *    fotogramas del final y la animación se queda clavada en el arranque.
 *    Medido en el hero a 1.6 Mbps: el usuario cruzaba los 560vh a los 2.2 s
 *    con 26 de 110 fotogramas cargados, todos del principio.
 *    En vez de eso barremos TODA la secuencia con paso grueso (0, 16, 32…) y
 *    luego partimos el paso a la mitad una y otra vez. Desde el primer segundo
 *    hay material repartido a lo largo de todo el recorrido: el movimiento se
 *    lee completo, solo que a saltos, y cada pasada lo afina.
 *
 * 2. VARIAS PETICIONES A LA VEZ. El cargador anterior hacía `await` fotograma
 *    a fotograma — unos 7 por segundo, sin importar el ancho de banda libre.
 *
 * 3. `createImageBitmap` EN LUGAR DE `<img>`, y decodificando a un ancho
 *    acotado. Aquí se caía el hero en un iPhone de verdad, no en el simulador:
 *    · MEMORIA. Cada fotograma mide 1600×900 → 5.76 MB ya decodificado; los
 *      110 son 634 MB para una sola escena. Safari en iOS no sostiene eso y
 *      descarta los mapas de bits.
 *    · DECODIFICACIÓN. Con `<img decoding="async">`, si el mapa de bits aún no
 *      está listo `drawImage` no pinta NADA — y el lienzo se queda con lo
 *      último que sí pintó, el fotograma 0. Es exactamente el síntoma que se
 *      veía: la última pantalla del hero con la primera imagen de la secuencia.
 *    `createImageBitmap` devuelve el mapa ya decodificado (nunca pinta vacío) y
 *    `resizeWidth` deja el coste de memoria fijado por nosotros, no por el
 *    tamaño del archivo.
 *
 * El cuarto pilar vive en `nearestLoaded`: mientras falten fotogramas hay que
 * dibujar el vecino disponible en lugar de no dibujar nada.
 */

const CONCURRENCIA = 8;

/**
 * Orden de carga: barridos cada vez más finos sobre toda la secuencia.
 * Con 110 fotogramas y paso 16 sale 0·109·16·32… y va cerrando huecos.
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
 * que el lienzo se congele mientras la secuencia termina de llegar: en vez de
 * no pintar nada, pinta el vecino que sí está.
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

// Ancho al que decodificamos en pantallas pequeñas. En vertical solo se ve
// algo más de la mitad del cuadro, así que 800 px de origen bastan para el
// ancho de un teléfono; a cambio la escena entera baja de 634 MB a 158 MB.
export const ANCHO_MOVIL = 800;

export const anchoDeDecodificado = () =>
  typeof window !== 'undefined' && window.innerWidth < 768 ? ANCHO_MOVIL : null;

/**
 * Arranca la carga de una secuencia.
 *
 * @param {number}   total     cantidad de fotogramas
 * @param {Function} src       (i) => url del fotograma
 * @param {Array}    images    arreglo destino; se rellena en el sitio
 * @param {number}   eager     primeros fotogramas, pedidos de corrido
 * @param {number}   maxWidth  ancho al que decodificar (null = tamaño nativo)
 * @param {Function} onReady   se llama al tener los `eager` (recibe si hay 0)
 * @param {Function} onFrame   cada vez que llega uno nuevo: sirve para repintar
 * @returns {Function} cancelar
 */
export function loadSequence({ total, src, images, eager = 12, maxWidth = null, onReady, onFrame }) {
  let cancelado = false;

  const soportaBitmap = typeof createImageBitmap === 'function';

  // Reserva para navegadores sin createImageBitmap. `decode()` antes de
  // guardarla evita el otro fallo: que `drawImage` reciba una imagen a medio
  // decodificar y no pinte nada.
  const cargarConImg = (i) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const listo = () => {
          images[i] = img;
          resolve(img);
        };
        if (img.decode) img.decode().then(listo, listo);
        else listo();
      };
      img.onerror = () => resolve(null);
      img.src = src(i);
    });

  // Safari solo respeta `resizeWidth` desde la 17. En versiones anteriores lo
  // ignora en silencio y devuelve el mapa a tamaño completo — justo el caso que
  // nos interesa acotar. Si vuelve grande, lo reducimos nosotros a un lienzo:
  // `drawImage` acepta un canvas igual que un bitmap, y así el techo de memoria
  // lo ponemos nosotros en cualquier navegador.
  const reducir = (bmp) => {
    const alto = Math.round(bmp.height * (maxWidth / bmp.width));
    const lienzo = document.createElement('canvas');
    lienzo.width = maxWidth;
    lienzo.height = alto;
    lienzo.getContext('2d').drawImage(bmp, 0, 0, maxWidth, alto);
    bmp.close?.();
    return lienzo;
  };

  const cargarConBitmap = async (i) => {
    try {
      const res = await fetch(src(i));
      if (!res.ok) return null;
      const blob = await res.blob();
      if (cancelado) return null;
      const bmp = await createImageBitmap(
        blob,
        maxWidth ? { resizeWidth: maxWidth, resizeQuality: 'high' } : undefined,
      );
      if (cancelado) {
        bmp.close?.();
        return null;
      }
      images[i] = maxWidth && bmp.width > maxWidth * 1.1 ? reducir(bmp) : bmp;
      return images[i];
    } catch {
      return null;
    }
  };

  const load = soportaBitmap ? cargarConBitmap : cargarConImg;

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
