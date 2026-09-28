# CORTEX SCROLLYTELLING — ARCHITECTURE & EXECUTION MANIFESTO

## Core Philosophy
This is not a website; it is an immersive cinematic narrative. 
Performance is non-negotiable: Locked 60 FPS, zero layout shifts, sub-second initial paint, invisible technology, and organic micro-sensory audio feedback.

---

## TECHNICAL GUARDRAILS & STANDARDS

### 1. Rendering Architecture (Canvas & Motion)
- **Scrubbing Engine:** Interactive scroll-driven scenes MUST use HTML5 `<canvas>` rendering pre-decoded WebP image sequences (`frame_000.webp`). NEVER use `video.currentTime` on MP4 files for interactive scrubbing.
- **Progressive Sequence Loading:** Eagerly preload the first ~10-15 frames of a scene's sequence for instant paint; load the rest lazily in the background so initial paint never waits on the full sequence.
- **Retina Display Scaling:** Set both axes and rescale the drawing context — not just `canvas.width`:
  ```js
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  ctx.scale(dpr, dpr);
  ```
- **Scroll Layer:** Use `lenis` (the package formerly published as `@studio-freight/lenis`, now deprecated in favor of this name) for physics-based smooth scrolling. Sync it to GSAP explicitly — Lenis and ScrollTrigger do not talk to each other by default:
  ```js
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  ```
- **GSAP Protocol:** Wrap all animations inside `useGSAP()` hooks using refs (`useRef`). NEVER trigger React state re-renders (`useState`) during active scroll events.
- **Reduced Motion:** Respect `prefers-reduced-motion` via `gsap.matchMedia()` — swap scrubbed/staggered animations for simple crossfades, and skip the audio engine's auto-unlock, when the user has this OS-level preference set.

### 2. Micro-Sensory Experience (Procedural Web Audio)
- **Procedural Audio Engine:** Implement `src/utils/audioEngine.js` using Web Audio API to synthesize a dynamic sub-bass ambient hum (55Hz-110Hz) modulated by GSAP scroll progress.
- **Milestone Sound Triggers:** Trigger procedural triangle-wave sub-pulses at key scroll intervals (0%, 25%, 50%, 75%, 100%).
- **Audio Gesture Unlock:** Bind `audioEngine.init()` / `audioEngine.resume()` to the first user click or scroll interaction to comply with browser autoplay policies.
- **Muted by Default:** The experience must be fully coherent with audio off. Audio is an enhancement the user opts into via the toggle in `<Header />`, never a requirement — and it must stay off automatically when `prefers-reduced-motion` is set.
- **Lifecycle Cleanup:** `audioEngine` must expose a `dispose()` that stops all active oscillators and calls `ctx.close()`. Call it on `<ScrollyCanvas />` unmount to avoid leaking `AudioContext` instances across route changes or React Strict Mode double-invokes.

### 3. Glassmorphism UI & Optics
- Dark mode baseline (`#050505`). Panels use `backdrop-filter: blur(12px)` with subtle `1px` translucent borders (`rgba(255,255,255,0.08)`).
- Mobile Viewport: Use `h-[100dvh]` (Dynamic Viewport Height) to eliminate mobile browser navigation bar jumps.

---

## 🎬 STORYBOARD & INTERACTIVE SCENE DEFINITION WORKFLOW

To optimize asset generation and allow flexible motion types across ANY section, follow this interactive protocol:

1. **Centralized Storyboard Data (`src/data/storyboard.json`):**
   Before generating assets, create `src/data/storyboard.json` defining all scenes, prompts, text overlays, and scroll thresholds.

2. **Scene Classification Prompting (Mandatory Question):**
   Before creating or generating assets for ANY scene in `src/data/storyboard.json`, Claude Code MUST ask the user:
   > *"For Scene [N] ('[Scene Title]'): Should this be an **Interactive Scrubbing Sequence** (scroll controls 3D motion frame-by-frame) or an **Ambient Loop** (video plays continuously while scroll triggers UI layers)?"*

3. **Technical Pipeline by Scene Type:**
   - **Type A — SCRUBBING (Continuous 3D Scroll):**
     * Generate video with Higgsfield MCP.
     * Extract/Convert into a WebP image sequence stored in `/public/assets/sequences/scene_[N]/frame_000.webp`.
     * Render on HTML5 `<canvas>` synced to GSAP ScrollTrigger (`scrub: true`).
   - **Type B — AMBIENT LOOP:**
     * Generate MP4 loop video in `/public/assets/videos/scene_[N].mp4`.
     * Render as `<video loop autoplay muted>` background layer with GSAP text/card overlays at milestone thresholds (10%, 25%, 50%, 75%).

4. **Sequential Validation Protocol:**
   Process scenes ONE BY ONE. Never generate assets for Scene N+1 until Scene N is rendered, tested on `http://localhost:5173`, and approved by the user.

---

## 🗺️ EXECUTION ROADMAP

### Phase 1: Environment, Canvas Core & Audio Engine
- Initialize React + Vite + Tailwind CSS + Lucide Icons + GSAP + Lenis.
- Build `src/utils/audioEngine.js` for zero-file-size procedural sound synthesis.
- Build `<ScrollyCanvas />` with High-DPI support, WebP sequence loader, and GSAP ScrollTrigger scrubbing connected to `audioEngine.updateScrollAudio()`.
- Implement LQIP (Low-Quality Image Placeholder) for instant initial render.

### Phase 2: Narrative Overlays & Micro-Interactions
- Build `<Header />` with capsule aesthetics, audio toggle button (Mute/Unmute), and glow states.
- Construct floating text overlays with staggered GSAP fade-in/out transitions synced to frame thresholds (0% -> 25% -> 50% -> 75% -> 100%). Trigger `audioEngine.playMilestoneChime()` on scene transitions.

### Phase 3: Asset Integration & Sequential Scenes (Higgsfield MCP)
- Create `src/data/storyboard.json`.
- Sequentially prompt the user for Scene Type (Scrubbing vs. Ambient Loop) and generate assets via Higgsfield MCP one by one.

### Phase 4: Production Build & Deployment
- Audit performance to guarantee steady 60 FPS and clean Web Audio node memory management.
- Deploy to Cloudflare Pages via GitHub repository.

---

## 🔊 REFERENCE IMPLEMENTATION: AUDIO ENGINE (`src/utils/audioEngine.js`)

When executing Phase 1, create the file `src/utils/audioEngine.js` using the exact Web Audio API architecture below:

```javascript
// src/utils/audioEngine.js

class SyntheticAudioEngine {
  constructor() {
    this.ctx = null;
    this.droneOsc = null;
    this.droneGain = null;
    this.filter = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();

    // Drone Sub-bass (55Hz - Note A1)
    this.droneOsc = this.ctx.createOscillator();
    this.droneGain = this.ctx.createGain();
    this.filter = this.ctx.createBiquadFilter();

    this.droneOsc.type = 'sine';
    this.droneOsc.frequency.setValueAtTime(55, this.ctx.currentTime); 

    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(120, this.ctx.currentTime);

    this.droneGain.gain.setValueAtTime(0.02, this.ctx.currentTime); 

    this.droneOsc.connect(this.filter);
    this.filter.connect(this.droneGain);
    this.droneGain.connect(this.ctx.destination);

    this.droneOsc.start();
    this.isInitialized = true;
  }

  updateScrollAudio(progress) {
    if (!this.isInitialized || this.ctx.state !== 'running') return;

    const targetFreq = 55 + progress * 55;
    this.droneOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);

    const targetCutoff = 120 + progress * 350;
    this.filter.frequency.setTargetAtTime(targetCutoff, this.ctx.currentTime, 0.1);
  }

  playMilestoneChime(frequency = 220) {
    if (!this.isInitialized || this.ctx.state !== 'running') return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 1.4);
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  dispose() {
    if (!this.isInitialized) return;

    this.droneOsc.stop();
    this.droneOsc.disconnect();
    this.filter.disconnect();
    this.droneGain.disconnect();
    this.ctx.close();

    this.ctx = null;
    this.droneOsc = null;
    this.droneGain = null;
    this.filter = null;
    this.isInitialized = false;
  }
}

export const audioEngine = new SyntheticAudioEngine();
```

---

# 📌 ESTADO DEL PROYECTO — bitácora (última actualización: 27 jul 2026)

> Registro de lo construido y, sobre todo, de **por qué** está hecho así.
> Varios puntos son cicatrices de bugs reales: no revertirlos sin leer la razón.

## Qué es hoy el sitio

Sitio de una sola página para **GEC (Grupo Espacio Creativo)**, protagonizado por la
mascota **Meraki**. Portado desde dos bosquejos HTML del Design Canvas que siguen en el
repo como fuente de la verdad del contenido:

- `Estructura Hero con Personajes Meraki/GEC Website.dc.html` — la home
- `Estructura Hero con Personajes Meraki/Landing educativo con tabs animadas/GEC IA Landing.dc.html` — el módulo interno GEC IA

Stack: **React 19 + Vite 8 + Tailwind v4 + GSAP/ScrollTrigger + Lenis**. Dev en
`http://localhost:5173`.

## Mapa de archivos

| Archivo | Rol |
|---|---|
| `src/App.jsx` | Lenis, refresh global de ScrollTrigger, estado de menú y panel |
| `src/components/Header.jsx` | Islas flotantes: logo · Hablemos · hamburguesa |
| `src/components/NavOverlay.jsx` | Menú a pantalla completa con revelado por `clip-path` |
| `src/components/Hero.jsx` | Canvas de scrubbing (110 frames) + 5 bloques de copy |
| `src/components/Sections.jsx` | Manifiesto, Pilares, Inside, Valor, Portafolio, Marcas, Testimonios, Familia, Contacto, Footer |
| `src/components/PanelEduca.jsx` | Módulo GEC IA completo (catálogo de 3 modos + modal comparativo) |
| `src/components/GateForm.jsx` | Muro de acceso del catálogo (correo empresarial + WhatsApp) |
| `src/components/ScrollRail.jsx` | Riel de progreso lateral derecho con magnificación tipo ola |
| `src/components/SocialIcons.jsx` | Iconos de marca en SVG inline |
| `src/data/site.js` | Todo el contenido de la home |
| `src/data/gecIA.js` | Datos y lógica del módulo GEC IA |
| `src/data/paises.js` | Códigos de país, máscaras y validación de correo corporativo |
| `src/data/storyboard.json` | Registro de escenas: prompts, IDs de Higgsfield, estado |

**Huérfanos**: `src/components/ScrollyCanvas.jsx` y `src/utils/audioEngine.js` ya no se
importan (el Hero absorbió el canvas y el audio se retiró). Se pueden borrar.

## Generación de assets con Higgsfield — reglas duras

Se usa el **MCP** (`mcp__claude_ai_Gec_Higgsfield__*`), no el CLI: `higgsfield` no está
instalado. `ffmpeg` y `cwebp` sí (vía Homebrew).

1. **Nunca describir a Meraki por texto.** El personaje entra como *reference element*
   incrustando `<<<element_id>>>` dentro del prompt. Describirlo hacía que el modelo lo
   *reconstruyera*: inventaba rasgos faciales en la nuca y mostraba dos caras a mitad de
   un giro. El prompt describe **solo** cámara, luz, acción y fondo.
2. **Elementos registrados** (workspace del usuario):

   | Nombre | ID |
   |---|---|
   | Meraki-Base-(oficial-con-isotipo) | `88c4a5c2-9f4d-4502-8e80-eeae70aab17b` |
   | Meraki-Educa | `1dee86f7-0001-4db4-bd76-aca8f426ee64` |
   | Meraki-Sistemas | `eff8160e-8ab5-489c-abef-a03fc7e2a0e1` |
   | Meraki-Super-Heroe-(oficial-con-isotipo) | `7983ca2f-bd97-4630-91e8-6d76a263c67f` |
   | Meraki-Artista | `53719200-0e2e-4616-b344-4c7d01607ca0` |
   | Meraki-Gamer | `fdbfbb42-d969-433d-9610-acc06ff0727d` |

3. **`start_image` = la pose cuyo ángulo coincide con el frame 0**, así el arranque es
   correcto por construcción. Poses de referencia en `Pose & posture consistenc/`.
4. **Bucles perfectos**: pasar *la misma imagen* como `start_image` **y** `end_image`.
   Medido: 0.6–2.2 sobre 255 de diferencia entre primer y último frame (imperceptible).
5. **Fondos** — política *bodegón con gradiente*: ciclorama infinito en el color del
   bloque, más luminoso detrás del personaje y cayendo a oscuro en los bordes. Sin
   escenografía, props ni piso. Nunca reusar los fondos de estudio de `merakis/*.webp`.
6. Modelo `seedance_2_0`, 1080p, `mode: std`, sin audio. Declinar los presets que sugiere
   el MCP para conservar el control. Si el socket se corta, **verificar el balance antes
   de reintentar**: los cortes de socket no cobran, pero un reintento ciego sí duplica.
7. **Mostrar siempre un still de preview** (≈5 créditos) antes de gastar en el video (≈72).
8. **Coherencia de props.** Si el personaje "lee" una tablet, la pantalla debe mirar hacia
   él y el espectador ve la **tapa con el isotipo GEC** — con la pantalla apuntando a
   cámara la escena se lee falsa. Y si sostiene algo, hay que repetir en el prompt que
   **ambas manos no se mueven**: al menor margen, el modelo lo suelta para señalar.
9. **El giro 3/4 marcado de cabeza es difícil de conseguir**: el modelo tiende a centrar la
   cara aunque se pida explícitamente. Costó 3 intentos y aun así quedó frontal-inclinado.
10. **Fundido sin alfa.** Los renders traen su propio fondo; no hay video con canal alfa.
    Para integrarlos se usan máscaras CSS (`mask-image`) que desvanecen los bordes, y el
    fondo del render se genera del mismo color/degradado que la sección destino.

## Escenas (todas terminadas)

| # | Sección | Personaje | Tipo | Asset |
|---|---|---|---|---|
| 1 | Hero | Meraki-Base | scrubbing | 110 frames WebP, 16:9 |
| 2 | Marketing | Artista | loop 5s | `scene_2.mp4` |
| 3 | Studio | Super-Heroe | loop 5s | `scene_3.mp4` |
| 4 | Educa | Educa | loop 5s | `scene_4.mp4` |
| 5 | Soluciona | Sistemas | loop 5s | `scene_5.mp4` |
| 6 | Experience | Gamer | loop 5s | `scene_6.mp4` |
| 7 | Familia | los 5 juntos | scrubbing | 110 frames, drone FPV |
| 8 | Contacto | Meraki-Base | loop 5s | `scene_8.mp4`, fondo piedra + halo |
| — | Panel GEC IA (hero) | Educa | loop 5s | `educa-hero.mp4`, plano medio |

Colores reasignados por el usuario (difieren del bosquejo): **Educa → verde aqua**,
**Soluciona → azul oscuro**.

Pipeline: descargar mp4 → `ffmpeg` extrae PNG a 11 fps → `cwebp -q 82` → 
`public/assets/sequences/scene_N/frame_000.webp`. Los loops se codifican a 1440 de ancho,
crf 24, `+faststart`, sin audio.

## Bugs resueltos — no reintroducir

1. **`ScrollTrigger.refreshPriority: 1` en el pin del Hero.** El pin añade 560vh y se crea
   *tarde* (al cargar los frames). Sin prioridad, Inside/Valor/Portafolio quedaban
   calculados sin ese desplazamiento y aparecían siempre en su último paso.
2. **Nada de `ScrollTrigger.snap` mientras Lenis esté activo.** Ambos mueven el scroll y
   pelean; la sección saltaba al final.
3. **Estilos base dentro de `@layer base`.** En Tailwind v4 las utilidades viven en capas y
   *el CSS sin capa siempre les gana*: `a { color: inherit }` anulaba cualquier color
   aplicado a un enlace.
4. **`html { overflow-x: clip }`, nunca `hidden`.** `hidden` convierte a `<html>` en
   contenedor de scroll y rompe `position: sticky` en los descendientes.
5. **`data-lenis-prevent`** en el panel GEC IA y en los modales: Lenis captura el wheel de
   toda la página y si no, no scrollean.
6. **El Hero debe cubrir el lienzo entero.** El zoom se deriva del desplazamiento
   (`1 + 2.2 × shift`) más un *clamp* de `dx`; con zoom fijo quedaba ~9% del canvas sin
   pintar y se veía el fondo negro. El fondo de la sección es `#1d2230` (el azul del
   propio video) para que ninguna costura se note.
7. **Logos con `self-start`/`mx-auto`.** En un `flex-col` los hijos se estiran: el logo del
   footer salía deformado a 357×30.
8. **Cuidado con `items-center` en la columna de Inside.** Deja el contenedor de las
   palabras en ancho 0 (sus hijos son absolutos) y descentra todo.
9. **Inside Your Brand va con driver continuo, no con pasos discretos.** Con
   `Math.floor(progress * n)` el cambio era un salto seco y, con la inercia de Lenis,
   un solo flick se comía hasta 3 pasos (Tendencias nunca llegaba a verse). Hoy cada
   paso tiene un peso continuo por distancia (`RADIO = 0.55`), las descripciones van
   apiladas para poder cruzarse, y la sección mide **640vh** para dar recorrido real.
   Ojo con el radio del cruce: si se agranda, dos palabras se leen encima.
10. **Playwright**: `window.scrollTo` no sirve para verificar — Lenis lo revierte y las
   capturas salen negras. Usar rueda real (`page.mouse.wheel`) o emular
   `reducedMotion: 'reduce'` para desactivar Lenis.
11. **Nunca pedir los fotogramas en orden 0·1·2·3.** El hero se veía como una foto fija
   en teléfono. Medido a 1.6 Mbps: el usuario cruzaba los 560vh del pin **a los 2.2 s**
   con solo 26 de 110 fotogramas cargados — y todos del principio, así que la segunda
   mitad de la escena no existía. Además `draw()` salía sin pintar cuando faltaba el
   fotograma, congelando el lienzo. Hoy `src/utils/frameSequence.js` resuelve las tres
   cosas: **orden por refinamiento** (barrido grueso 0·16·32… y se va partiendo el paso,
   así hay material repartido por toda la escena desde el primer segundo),
   **8 peticiones concurrentes** (antes ~7 fotogramas/s pasara lo que pasara con el ancho
   de banda) y **`nearestLoaded()`**, que dibuja el vecino disponible en vez de nada.
   Medido después: con 71 cargados el hueco mayor entre fotogramas es de **2**.
   «La familia» disimulaba el fallo porque está al final y le sobraba tiempo de carga.
12b. **REGLA DURA: el teléfono no redimensiona nada.** Costó tres intentos
   fallidos. Se le sirve una secuencia **ya pequeña** (`scene_N_m/`: 56
   fotogramas recortados a 640×562, 77 MB decodificados frente a 634 MB) y el
   navegador solo descarga y decodifica. Los dos atajos que parecían listos y
   rompieron iOS —los dos con el mismo síntoma: hero clavado en la nuca:
   · `createImageBitmap(blob, { resizeWidth })` **lanza excepción** en Safari
     < 17. No lo ignora. Sin fotograma 0 no hay ScrollTrigger, el hero no se
     ancla y el scroll pasa de largo con el lienzo vacío.
   · Reducir cada fotograma en un `<canvas>` — **iOS limita cuántos lienzos
     tiene vivos una página**. Pasado el cupo `getContext('2d')` devuelve null,
     el `drawImage` revienta dentro del `onload`, la promesa **nunca se
     resuelve** y el obrero se cuelga. Con los obreros colgados la carga muere
     callada a los ~15 fotogramas, todos del arranque.
   De ahí que `loadSequence` lleve ahora **plazo máximo por fotograma**: nada
   puede dejar la cola detenida. Las secuencias `_m` se generan con
   `crop=1024:900:288:0,scale=640:562` — recorte **simétrico**, así el centro
   del personaje no se mueve y el encuadre del canvas no cambia.
   Y el `<link rel=preload>` del fotograma 0 va duplicado con `media`, uno por
   secuencia, para no bajar en el teléfono el que no se usa.
13. **En un iPhone de verdad no basta con cargar rápido: hay que decodificar
   poco.** El simulador de escritorio mentía — ahí el hero iba bien y en el
   teléfono se quedaba clavado en el fotograma 0 con el copy final encima.
   Dos causas, las dos en `frameSequence.js`:
   · **Memoria.** Cada fotograma mide 1600×900 = **5.76 MB decodificado**; los
     110 son **634 MB** por escena. Safari en iOS descarta los mapas de bits.
     Hoy se usa `createImageBitmap` con `resizeWidth` (800 px por debajo de
     768 px de ancho): 1.37 MB por fotograma, **151 MB** la escena. Ojo:
     Safari solo respeta `resizeWidth` desde la **17**; antes lo ignora en
     silencio, así que si el mapa vuelve grande se reduce a mano en un lienzo.
   · **`<img decoding="async">` puede pintar NADA.** Si el mapa aún no está
     decodificado, `drawImage` no dibuja y el lienzo se queda con lo último que
     sí pintó. `createImageBitmap` devuelve el mapa ya listo; la reserva para
     navegadores sin él hace `await img.decode()` antes de guardarlo.
   Además **la secuencia de La familia no arranca hasta estar a dos pantallas**
   (`IntersectionObserver`, `rootMargin: '200%'`): si las dos escenas cargan a
   la vez, en un teléfono compiten por la memoria y no termina ninguna.
   Y los `ImageBitmap` **no los recoge el GC**: hay que `close()` al desmontar.
13. **El personaje del hero está centrado al 50% del cuadro, no al 60%.**
   Medido sobre los 110 fotogramas: oscila entre 47.8 y 51.7. El encuadre
   vertical suponía 60% y por eso se salía por un lado. Y la escala **encoge**
   con el scroll (`0.62 - 0.13·p`) en vez de crecer: al final el copy ocupa el
   tercio inferior y con el personaje creciendo le quedaba debajo del texto.
14. **Los pilares no pueden llevar el loop a sangre en móvil.** El video es 16:9 y en
   vertical `object-cover` recorta justo por donde está el personaje: en el sitio
   publicado no se veía ninguno de los cinco. Y no cabía arreglarlo dentro del `sticky`:
   medido, el copy solo ya ocupa **678 de los 784 px** de la tarjeta. Solución: en móvil
   la tarjeta suelta el `sticky` y toma su altura natural, con el personaje en su propia
   franja (`h-[min(44vh,420px)]`) y el copy debajo. En `lg` el apilado sigue igual.
   Cada pilar lleva un `focus` en `site.js` (centro horizontal del personaje dentro del
   cuadro) que alimenta `--foco` → `object-position`; sin él quedan fuera de cámara.
   El valor se afina **mirando capturas**, no calculándolo: medir el centroide del cuerpo
   da resultados que contradicen lo que se ve, porque props y destellos desvían la cuenta.

## Muro de acceso del catálogo GEC IA

El catálogo (las tres guías) está detrás de un formulario en `src/components/GateForm.jsx`.

- **Solo correo empresarial.** `src/data/paises.js` trae la lista de dominios personales
  bloqueados (gmail, hotmail, outlook, yahoo, icloud, proton…). Se rechaza con un mensaje
  que explica el motivo, no con un error genérico.
- **WhatsApp con selector de país** (15 países, Honduras por defecto). Cada país define
  su cantidad de dígitos y su máscara; el input formatea mientras se escribe y valida el
  largo exacto.
- **Filtra con las mismas listas del contenido**: los selectores de *área* y de *punto de
  partida* se alimentan de `AREAS` y `PUERTAS` de `gecIA.js`, así el lead llega
  clasificado con el mismo vocabulario del catálogo.
- **Notificación a Telegram**: `POST` a `https://palabras-gec.operaciones-659.workers.dev/notify`
  con `{ type: 'custom', message }`. Es el worker que ya usaba el proyecto de grafología;
  responde con `access-control-allow-origin: *`, así que se llama directo desde el navegador
  sin worker intermedio.
- El acceso se guarda en `localStorage` (`gec-ia-acceso`) para no repetir el formulario.
  Si falla el guardado (modo privado) igual desbloquea.

## Riel de scroll (`src/components/ScrollRail.jsx`)

Indicador de progreso fijo al **lateral derecho**, centrado vertical. 19 marcas: una por
hito de sección (7) más 2 intermedias entre cada par.

- **Magnificación tipo ola**: el ancho, alto y opacidad de cada marca dependen de su
  distancia a la posición del scroll (`onda = 1 - d/2.6`), igual que el driver continuo de
  Inside Your Brand. Las marcas ya recorridas quedan en ámbar; las pendientes, atenuadas.
- **La etiqueta viaja pegada al marcador activo** (`offsetTop` del punto más cercano,
  animado con GSAP), no fija arriba: así replica la referencia donde el texto va al lado
  de la marca gruesa.
- Los hitos son clicables y llevan a su sección. Solo se muestra en `lg` y respeta
  `prefers-reduced-motion`.

## Decisiones de UX vigentes

- **Sin audio.** Se retiró el motor y el toggle; el video del hero no lleva sonido.
- **Pilares `sticky`**: cada tarjeta se estaciona y la siguiente sube encima.
- **Loops solo en pantalla**: `IntersectionObserver` + `preload="none"`; la imagen hace de
  póster hasta que el video pinta su primer frame.
- **Inside Your Brand**: 4 pasos (Tendencias · Herramientas · Ideas · Ver canal). El cuarto
  abre un modal con el episodio de YouTube embebido.
- `prefers-reduced-motion` respetado en todo: sin Lenis, sin loops, sin entradas.
- **Header en islas**: contenedor transparente con `pointer-events-none`; cada elemento
  (logo · Hablemos · hamburguesa) flota en su propia cápsula. Sin barra central ni enlaces
  de texto: la navegación vive en el menú hamburguesa.
- **Footer** con logo grande (215×82), dirección, ambos teléfonos con `tel:` y las 6 redes.
  Behance y Spotify van como SVG inline: lucide-react ya no trae iconos de marca.

## Pendiente / a decidir

- **CTA "Explorar GEC IA": revisado y aceptado como está.** Con los pilares en `sticky` el
  botón sólo es clicable durante una ventana de ~180px de scroll (medido: 4 de 43 muestras;
  el resto lo interceptan `p-soluciona` y `p-experience`). Es geométrico: el CTA va al fondo
  de la tarjeta Educa y la siguiente sube desde abajo tapándolo. Fuera de esa ventana el
  botón tampoco se ve, así que el comportamiento es coherente. **El usuario lo dio por
  bueno; no tocar sin que lo pida.** Nota para tests: Playwright no puede pulsarlo con
  `click()` — hay que abrir el panel por código o posicionarse dentro de esa ventana.
- Fase 4 del roadmap: build de producción y deploy a Cloudflare Pages.
- Consultado y sin responder: si Valor y Portafolio también deberían tener *snap* por
  tarjeta (hoy solo hacen scrub continuo).
- Borrar los dos archivos huérfanos si se confirma que el audio no vuelve.
- El giro 3/4 del Meraki Educa del panel quedó frontal-inclinado, no en perfil marcado como
  la referencia; queda pendiente si se sigue iterando.

---

## 📖 GUÍA DE IMPLEMENTACIÓN 2026 (`GEC_Guia_Implementacion_Web_2026.md`) — estado y pendientes

> Actualizado: 2026-09-20. Este documento **no vive en el repo** — el usuario lo pega
> completo en el chat cada cierto tiempo; es la fuente de verdad del contenido y la
> arquitectura del sitio. Tiene 7 fases (0 Preparación · 1 Sistema compartido · 2 Home ·
> 3 Páginas de pilares · 4 Inside Your Brand + Brief · 5 Educa privado · 6 SEO/medición ·
> 7 QA). Cada bloque trae "CONTENIDO APROBADO" (texto literal, no reinterpretar) e
> "IMPLEMENTACIÓN" (instrucciones — a veces piden redactar una descripción breve, ahí sí
> se puede). **Regla del usuario: sin textos inventados que el .md no traiga** — si hace
> falta más presencia visual en un bloque, se resuelve con jerarquía (ícono, tamaño,
> espaciado), no con más prosa.
>
> **Ojo:** no confundir con el "Fase 4 del roadmap" mencionado arriba en este mismo
> archivo (Production Build & Deployment) — es la numeración de fases de un documento
> distinto (el manifiesto original de este CLAUDE.md), no de la guía.

### Decisiones no negociables de la guía (no romper sin que el usuario lo pida)
- Sin página ni bloque "Nosotros".
- Sin testimonios hasta tener testimonios reales y autorizados.
- "CompañIA" es la grafía vigente del programa de Educa — no usar nombres anteriores.
- La oferta privada de Educa no se enlaza desde la navegación pública.
- Cada CTA principal de un pilar abre el brief con `?pilar=<nombre>` preseleccionado.

### ✅ Hecho
- **Fase 3 — Páginas de pilares: completa.** Las 5 existen (`/marketing/`, `/studio/`,
  `/educa/`, `/soluciona/`, `/experience/`), comparten `src/components/PilarPage.jsx`.
  Cada una tiene su Meraki en el hero (`HeroCharacter`, componente compartido) con halo
  del color de la división + máscara radial para fundir el render contra el `#0A0E13`
  de la página. Valor/Alcance usan `SlotCard` (ícono + slot punteado "captura / video"
  para media futura, sin inventar imágenes).
- **Fase 4 — Brief (B-01 a B-05): completo.** `src/pages/BriefPage.jsx` reemplazó el
  placeholder. Rediseñado estilo Typeform tras feedback del usuario ("se volvió plano y
  feo"): una pregunta por pantalla de verdad (~13 pasos atómicos), avance automático al
  tocar una opción de selección única, tarjetas con badge de letra (A, B, C…), cursor
  parpadeante (`@keyframes blink` en `src/index.css`), barra de progreso fina fija arriba
  del viewport, transición GSAP entre preguntas (respeta `prefers-reduced-motion`).
  Precarga `?pilar=` y `?tema=` de los CTA de cada pilar. Progreso persistido en
  `localStorage` (`gec-brief-progreso`, se limpia de verdad al enviar — ver bug corregido
  abajo). Envía a `POST /api/brief` (`functions/api/brief.js`, nuevo — mismo patrón que
  `functions/api/otp/verificar.js`, mismo worker de Telegram). La clasificación interna
  (Prioritaria/En evaluación/Para desarrollar) se calcula **server-side**, nunca llega al
  cliente. Resultado (B-05) con resumen enriquecido (Empresa, Contacto, Necesidad, Pilar
  recomendado, Etapa, Tiempo) + modal "Explorar otros servicios" (`ModalServicios`, mismo
  patrón que `VideoModal` de Inside Your Brand) con las 5 tarjetas de pilar.
  - *Bug corregido:* el efecto que persiste `{paso, r}` en `localStorage` se disparaba
    también al llegar a `paso: 'resultado'` y pisaba el `removeItem()` de `enviarBrief()`
    un instante antes — el brief nunca quedaba realmente limpio tras enviarse. Fix: ese
    efecto ahora se salta tanto en `'intro'` como en `'resultado'`.
- **Menú y footer**: el hamburguesa (`NavOverlay.jsx`) y el footer (`footerCols` en
  `site.js`) ahora enlazan a los 5 pilares como rutas reales, no anclas.
- **Riesgo de contenido sin autorizar — resuelto por ahora (2026-09-20).** `<Marcas />` y
  `<Testimonios />` se sacaron del render de `src/pages/Home.jsx` (el código y los datos
  siguen intactos en `src/components/Sections.jsx` y `src/data/site.js` — reactivarlos es
  solo devolver las dos líneas de import/render). Tenían testimonios inventados atribuidos
  a clientes reales (Grupo Flores, Supermercados La Colonia, UJCV, BCIE) y marcas sin
  autorización confirmada (Toyota, Ford, UNICEF, BCH, BCIE) — ambos prohibidos
  explícitamente por la guía. **No reactivar hasta tener testimonios y logos reales y
  autorizados por GEC.**
- **H-04 y H-05 construidos (2026-09-20).** `BriefCTA` (H-04, "¿Qué necesita tu empresa?"
  con los dos CTA aprobados hacia `/cuentanos-tu-reto/` y WhatsApp) y `Autoridad` (H-05,
  titular "12 años..." + los 7 sectores como chips — texto, sin fotos de stock ni
  estadísticas sin verificar) viven ahora en `Sections.jsx` y se renderizan en Home justo
  después de Pilares. `Autoridad` **reemplazó** a `ValorHorizontal` en el render (el
  componente viejo y sus datos `fuerzas` siguen intactos, sin usarse). El texto de
  evolución de `Autoridad` es redacción propia siguiendo la instrucción de la guía
  ("Añadir texto breve sobre evolución..."), no contenido literal aprobado — y el titular
  "12 años" lleva un comentario en el código recordando revisarlo cada año.
- **InsideYourBrand y Portafolio ocultos del Home (2026-09-21), a pedido del usuario.**
  Ninguno calzaba con el contenido aprobado (InsideYourBrand no trae los 4 tipos
  aprobados — usa "Tendencias", que no es uno de ellos; Portafolio usa la palabra "Blog",
  que la guía prohíbe en IYB-02, y fotos de stock genéricas). Mismo criterio que
  Marcas/Testimonios: componentes y datos siguen intactos en `Sections.jsx`, solo se
  sacaron del render de `Home.jsx`. Se limpiaron también las referencias que quedaban
  huérfanas: `nav` y `footerCols` (`site.js`) ya no tienen las entradas "Inside Your
  Brand"/"Valor"/"Portafolio" (`#inside`/`#valor`/`#portafolio` no existen en el DOM), y
  `HITOS` en `ScrollRail.jsx` (el riel lateral de progreso) tampoco las lista.
- **H1 del Hero de Educa — decidido (2026-09-21).** El usuario adjuntó `Educa.pdf` (un
  mockup de referencia) pidiendo mejorar el layout del hero según esa referencia. El PDF
  trae un titular corto de dos líneas — "Adopción de IA empresarial" — en vez de la
  oración larga que había ("Adopta la IA y haz crecer las habilidades que tu empresa
  necesita."), y con eso el hero queda mejor proporcionado (4 líneas de H1 pasan a 2).
  Se adoptó el titular del PDF tal cual. El resto de esa misma página (Valor, Capacidades,
  CompañIA, Audiovisual, Otras formas) ya calzaba con el PDF — mismo conteo de slots (10),
  mismo copy, mismas tarjetas "Ver más" en Marca/Programas corporativos.
- **Páginas de pilar cruzadas contra mockups de referencia — Marketing/Studio/Soluciona/
  Experience (2026-09-21).** El usuario adjuntó un PDF por pilar (`Marketing.pdf`,
  `Studio.pdf`, `Soluciona.pdf`, `Experience.pdf`), mismo criterio que `Educa.pdf`. Se
  comparó texto contra texto cada hero/valor/alcance/cierre:
  - **Marketing y Studio calzan al 100%** — ningún cambio.
  - **Soluciona**: el ítem de Alcance decía "Productos desarrollados por GEC"; el PDF trae
    "Productos con IA por GEC" — corregido. Además el PDF solo trae 3 tarjetas en esa
    sección; el código tenía una cuarta ("Soluciones con IA", sin descripción ni link, no
    presente en el mockup) — se quitó.
  - **Experience**: Valor tenía 4 tarjetas ("Coherencia con la marca" + las 3 del PDF); el
    mockup solo trae 3 ("Participación y conexión", "Información útil", "Tecnología fácil
    de utilizar") — se quitó la que sobraba.
  - Verificado en `localhost:5173` (`/soluciona/`, `/experience/`) tras el cambio: la
    grilla de 3 tarjetas queda 2+1, igual que en los mockups.
- **Fase 4 — Inside Your Brand: construida como página propia (2026-09-21), reemplazando
  por completo la versión original (scrollytelling "Tendencias/Herramientas/Ideas/Ver
  canal" embebido en Home).** El usuario pidió explícitamente hacerlo "como está en el
  plan y no como lo tenía yo al inicio". Nueva ruta `/inside-your-brand/`
  (`src/pages/InsideYourBrandPage.jsx`), enlazada desde el menú hamburguesa
  (`NavOverlay.jsx`, después de los 5 pilares) y desde el footer (columna "Contenido",
  antes muerta sin destino). Cubre IYB-01, IYB-02, IYB-03 y IYB-06 con el texto literal
  aprobado (Hero, los 4 "Tipos" — Ideas para crecer/Herramientas para aplicar/
  Conversaciones/Innovaciones con nuestros clientes —, los 7 "Temas", y el bloque
  Comunidad con sus 3 textos exactos). IYB-04 (Innovaciones) sigue con **estado vacío
  honesto** — no hay casos reales autorizados todavía, mismo criterio que los slots
  punteados de las páginas de pilar. No se implementaron filtros por tipo/tema (IYB-02 lo
  pide) porque con solo episodios de YouTube como contenido real un filtro por tema no
  tiene qué filtrar todavía — recuperarlo cuando IYB-03 tenga también artículos escritos.
  IYB-05 (plantilla editorial) tampoco aplica todavía por la misma razón.
- **IYB-03 (Archivo) — carrusel/grid de YouTube "sin admin" (2026-09-21).** El usuario
  pidió que los episodios de Inside Your Brand aparecieran solos cuando se publican en
  YouTube, sin tener que mantener un panel a mano, con vista carrusel y grid intercambiable
  y modal premium al abrir uno. Dio 4 URLs de episodios ya publicados.
  - **Sin API key ni panel de admin**: `functions/api/youtube.js` (`GET /api/youtube`) lee
    el feed RSS público del canal (`youtube.com/feeds/videos.xml?channel_id=...`, sin
    autenticación) y filtra por título que contenga "Inside Your Brand" — el canal mezcla
    episodios con producciones de clientes (Toyota, ATASA, Ford…), así que sin el filtro
    saldría contenido que no es de este bloque. El ID del canal (`UCjmI5Wo1_w83zw7o3Wgdyew`)
    se resolvió una sola vez desde `/@grupoespaciocreativo` y quedó hardcodeado (comentado
    en el archivo) — no hace falta resolverlo en cada request.
  - **Limitación real, documentada en el propio archivo**: el feed de canal solo trae los
    15 videos más recientes de *todo* el canal, no solo de Inside Your Brand — un episodio
    puede salir de esa ventana cuando se publican 15 cosas después (spots, reels de
    clientes, etc.). Se buscó una lista de reproducción pública dedicada a Inside Your
    Brand para evitar esto de raíz y no existe todavía — **recomendado pendiente**: que
    GEC cree una en YouTube Studio; ese día cambiar `FEED_URL` a `?playlist_id=` en
    `functions/api/youtube.js` resuelve el límite por completo (trae todo lo que esté en
    la lista, sin tope de 15 ni mezcla con otro contenido).
  - **Respaldo (`iybVideosSeed` en `site.js`)**: los 4 videos que dio el usuario, títulos
    verbatim verificados vía oEmbed de YouTube (no inventados). `useCanalVideos`
    (`src/hooks/useCanalVideos.js`) pinta este respaldo de inmediato (sin esperar red) y lo
    fusiona con lo que devuelva `/api/youtube` en vivo — si un episodio viejo sale de la
    ventana de 15, sigue apareciendo porque está en el respaldo; si hay uno nuevo, aparece
    solo. En `npm run dev` el fetch da 404 (esperado) y el componente se queda con el
    respaldo, coherente.
  - **UI** (`src/components/VideoCarousel.jsx`): toggle Carrusel/Grid (scroll horizontal
    con `snap-x` + `data-lenis-prevent` para que Lenis no le robe el wheel, ver bug #5 de
    esta bitácora) y grid responsive (`sm:grid-cols-2 lg:grid-cols-4`). Cada tarjeta usa el
    thumbnail real (`i.ytimg.com/vi/<id>/hqdefault.jpg`, sin API key) con overlay de play.
  - **Modal premium** (`src/components/VideoModal.jsx`, nuevo componente compartido):
    generalización del modal de video que ya existía solo para Home (`VideoModal` local en
    `Sections.jsx`, sin exportar) — mismo lenguaje visual (`fadeIn`/`modalIn`, ya globales
    en `index.css`), pero recibe cualquier `{id, title}` en vez de un solo episodio fijo.
    El viejo sigue intacto sin usarse (mismo criterio de no borrar código huérfano).
  - Verificado en `localhost:5173`, desktop y mobile: carrusel con scroll horizontal, toggle
    a grid, modal abre con autoplay y cierra con Escape/click fuera/botón X, sin errores de
    consola.
  - **"Suscribirme" (IYB-06) es funcional**, no solo un botón decorativo: nuevo endpoint
    `POST /api/suscribir` (`functions/api/suscribir.js`), mismo patrón que `/api/brief`
    (valida el correo, avisa a Telegram vía el worker ya existente, sin base de datos
    propia). Documentado en `functions/README.md`. En `npm run dev` da 404 igual que los
    demás endpoints — esperado, el formulario lo muestra como error sin romper la página.
  - `CtaPrimary` (compartido, `PilarPage.jsx`) ahora acepta anclas (`to="#tipos"`) además
    de rutas — antes solo envolvía `<Link>` de react-router, que interpretaría un ancla
    como una ruta nueva.
  - El componente viejo (`InsideYourBrand` en `Sections.jsx`, datos `proceso` en
    `site.js`) sigue intacto sin usarse, mismo criterio que `ValorHorizontal`/
    `Marcas`/`Testimonios` — no se borró por si hace falta revisar el enfoque anterior.
  - Verificado en `localhost:5173` (desktop 1440px y mobile 390px): hero, tipos, temas,
    archivo/innovaciones con estado vacío, comunidad con el formulario funcionando
    (incluido el error 404 esperado en dev), enlaces del menú y footer, sin errores de
    consola distintos a los ya documentados.
- **Fase 6 — SEO básico: robots.txt, sitemap.xml y Schema Organization (2026-09-21).**
  Parte barata de Fase 6 que no dependía de nada más pendiente:
  - `public/robots.txt`: permite todo, `Disallow: /acceso/` adelantado (esa ruta —
    oferta privada de Educa, Fase 5 — todavía no existe, pero la guía pide excluirla
    y así queda listo desde ya) y apunta al sitemap.
  - `public/sitemap.xml`: las 8 rutas públicas reales de `src/App.jsx` (Home + 5 pilares +
    `/inside-your-brand/` + `/cuentanos-tu-reto/`). **Es manual** — el sitio sigue siendo
    un SPA sin prerender/SSG, así que hay que agregar una línea a mano cada vez que se
    agregue una ruta nueva (el propio archivo lo recuerda en un comentario).
  - Schema Organization (JSON-LD) en `index.html`: `name`/`description` son el texto
    literal aprobado por la guía ("Grupo Espacio Creativo - Agencia de Crecimiento
    Creativo Empresarial."), el resto (teléfonos, dirección, redes) son los mismos datos
    reales que ya usa el Footer (`src/data/site.js`) — nada inventado. Logo:
    `/logos/gec-color.png`.
  - Verificado: JSON bien formado (parseable), XML bien formado, ambos archivos sirven
    200 en `localhost:5173`, sin errores de consola.
- **Fase 6 — capa de analítica + eventos del set fijo de la guía (2026-09-21).** GA4 en sí
  necesita un Measurement ID real que solo el usuario puede generar (crear la propiedad en
  Google Analytics) — no se puede inventar uno. Lo que sí se dejó listo, para que activarlo
  el día de mañana sea solo pegar el ID, sin tocar código:
  - `src/utils/analytics.js`: `initAnalytics()` (carga `gtag.js` **solo si**
    `VITE_GA_MEASUREMENT_ID` está configurada — variable de build de Vite, no de runtime
    de las Functions, documentada aparte en `functions/README.md` con su propio "ojo, esto
    muerde") y `track(evento, params)` (no hace nada si `window.gtag` no existe — sin ID
    configurado, cero llamadas, cero errores). Se llama una vez en `App.jsx` al montar.
  - **Eventos ya disparando en los puntos reales de interacción** (verificado con un
    `window.gtag` de prueba en `localhost:5173`, sin necesitar un ID real):
    `intro_completed` (Hero, una vez al llegar al final del scroll del pin, y también en
    la rama `prefers-reduced-motion`) y `hero_cta_clicked` (los dos CTA del Hero) —
    `intro_skipped` **no se implementó**, no hay botón "Saltar introducción" todavía
    (sigue pendiente, ítem 3 de abajo), sin botón no hay de dónde dispararlo.
    `brief_started`/`brief_step_completed` (un único punto de enganche en `ir()` de
    `BriefPage.jsx`, según el `paso` de salida), `brief_submitted` (en `enviarBrief()`,
    con las UTM adjuntas), `brief_abandoned` (`visibilitychange`, no `beforeunload` —
    más confiable en móvil — solo si ya salió de "intro" y no llegó a "resultado").
    `content_opened` (al abrir un video en `VideoCarousel.jsx`) — `innovation_opened`
    tampoco se implementó, IYB-04 sigue en estado vacío, no hay casos que abrir.
    `iyb_subscription_clicked` (submit del formulario de Suscribirme).
    `xpevent_clicked` (specific al link de XP Event en Experience, no genérico a
    cualquier link externo de pilar) y `social_clicked` (los 6 íconos del Footer, con
    qué red como parámetro).
  - Documentado en `functions/README.md` (nueva sección "GA4 — distinta de las
    anteriores") cómo activarlo cuando exista el Measurement ID.
- **Hero de Home — se quedaba clavado en la nuca en celular real (2026-09-27/28),
  reportado con capturas y grabación reales del usuario.** Dos causas distintas en
  `src/utils/frameSequence.js`, las dos reales, no simuladas:
  1. Ningún fotograma que fallara por un corte de red se reintentaba, y un solo fallo de
     `createImageBitmap` apagaba esa vía para el resto de la secuencia aunque el fallo
     fuera de red, no de compatibilidad (`createImageBitmap(blob)` sin opciones funciona
     en todo Safari desde hace tiempo). Fix: hasta 2 reintentos por fotograma, ya no se
     apaga bitmap de forma permanente.
  2. **La causa real, la que explicaba la captura del usuario**: el adelanto inicial
     (`eager`) cargaba los primeros N fotogramas **de corrido** (~20% de la secuencia). En
     un teléfono real, un solo flick recorre los 560vh del pin en pocos segundos — más
     rápido que la carga de fondo — así que el 80% restante del recorrido no tenía ningún
     fotograma cercano que pintar. Fix: el adelanto ahora usa el mismo orden por
     refinamiento que la cola de fondo (0%, 100%, 29%, 57%, 86%, 14%...), repartido por
     toda la línea de tiempo desde el primer pintado.
  - **Falso positivo descartado en el camino**: en un momento pareció que Modo de Bajo
    Consumo de iOS era la causa (ambas capturas del usuario lo mostraban activo, ese modo
    sí frena red/decodificación en segundo plano) — confirmado luego que no era la causa
    principal: en otro celular sin ese modo activo, con el fix de arriba, sí funcionó.
  - **Adicional, mismo reporte**: en móvil el personaje ocupaba muy poco alto (62%→49% con
    el scroll) dejando una franja vacía notable en los pasos intermedios ("se ve partida la
    pantalla"). Fix en `src/components/Hero.jsx`: el arranque sube a 78% (el paso 0 no
    tiene copy todavía, no hace falta dejarle tanto aire), pero el valor final se dejó
    exactamente en 49% — es el que evita que el personaje quede debajo del CTA de cierre,
    medido a propósito en un fix anterior (ver bug #13 de la bitácora original más arriba).
  - Los tres fixes verificados en `localhost:5173` y confirmados por el usuario en su
    celular real tras desplegar a producción.
- **Skill `impeccable` instalado (2026-09-27) y usado para una crítica formal de
  `/educa/`.** `.claude/skills/impeccable/` — el instalador oficial (`npx impeccable
  install`) está roto río arriba (su redirector apunta a una release `skill-v4.4.0` que no
  existe en GitHub, confirmado con `gh release list`); se instaló bajando la última
  release real (`skill-v4.3.1`) y pasándosela al mismo instalador por su variable de
  bypass (`IMPECCABLE_BUNDLE_PATH`) — mismo resultado, un patch atrás, se actualiza solo
  cuando el bug de ellos se resuelva. `/impeccable critique /educa/` corrió en modo
  dual-agent (Assessment A diseño + Assessment B detector/navegador) y dio 21/32
  (Aceptable) — snapshot en `.impeccable/critique/` (carpeta ahora en `.gitignore`, junto
  con `.codex/`). De ahí salieron y se aplicaron: color de CTA unificado, fix de los
  avatares del family-nav que cargaban en blanco, y reducción de 12 a 6 del placeholder
  "captura/video" repetido — más `/impeccable bolder` sobre el Hero (halo amplificado vía
  el prop `haloBold` de `HeroCharacter`, ver arriba).
- **`/educa/` reconstruida siguiendo un mockup nuevo del usuario ("Educa Landing v2",
  hecho en Claude Design) (2026-09-28).** El mockup traía notas explícitas de "Mejora"
  comparando contra la página vigente — se implementaron todas:
  - Un solo color de CTA en **toda** la página: dorado plano (`#F5B301`), no el turquesa
    de identidad de Educa. Corrige mi propia decisión anterior (el pase `/impeccable
    colorize` había unificado a turquesa) — el mockup mostró que el patrón correcto del
    sitio es "el color del pilar es para acentos/identidad, el dorado es el único color de
    acción", igual que Header/Home/Contacto.
  - Hero: H1 más grande (nuevo prop opcional `hero.h1Size` en `PilarPage.jsx`, sin tocar
    el tamaño de los otros 4 pilares), un solo párrafo en vez de dos (`hero.explicacion`
    ahora es opcional en el template compartido), CTA primario más corto.
  - Valor: de tarjetas con caja de media vacía a una lista numerada con divisores —
    mismos 4 atributos, sin placeholders.
  - Alcance + "Otras formas" **fusionados** en un solo bloque (`BloqueProgramas`): tenían
    Marca y Programas corporativos duplicados entre las dos secciones. Dos programas
    insignia (CompañIA, Audiovisual) + dos complementarios.
  - CompañIA: los 6 pasos pasan de una grilla 2 columnas dentro del texto a una línea de
    tiempo vertical en su propia columna (con descripción por paso, contenido nuevo del
    mockup) — reemplaza el panel de diagrama vacío que había ahí.
  - Audiovisual: los 4 rasgos ahora traen descripción (antes solo el título) — contenido
    nuevo del mockup, adoptado tal cual.
  - `PilarPage.jsx` ganó tres opciones retrocompatibles para esto: `hero.h1Size`,
    `hero.explicacion` opcional, y las secciones Valor/Alcance genéricas ahora solo se
    renderizan si se les pasa el prop — Educa ya no las usa (construye las suyas dentro de
    `extra`), los otros 4 pilares siguen exactamente igual.
  - **Una desviación deliberada del mockup, explicada**: el mockup dice "Ver formaciones"
    para el CTA secundario del hero, pero esta página no lista cursos — lleva a
    "Capacidades". Se dejó "Ver capacidades" en su lugar para no reintroducir el mismo
    desajuste CTA↔destino que ya se había corregido antes.
  - El header/nav/footer del mockup (genéricos, de la herramienta de diseño) y el bloque
    de Familia Meraki (el mockup usaba círculos placeholder; el real usa las fotos de los
    5 personajes) **no se tocaron** — se mantuvo el `PilarFamiliaNav.jsx` compartido real.
  - Verificado en `localhost:5173`, desktop y mobile, y confirmado que Marketing (que
    comparte `PilarPage.jsx`) sigue idéntico — sin errores de consola, detector en 0.
- **Cierre extendido a los 5 pilares: tarjeta dorada sólida (2026-09-28).** El usuario
  mostró una segunda captura (Soluciona) con el mismo patrón "CTA FINAL" del mockup de
  Educa — tarjeta dorada, texto oscuro, botones invertidos — y pidió extenderlo a los 5
  pilares, no solo Educa (confirmado explícitamente antes de tocar el componente
  compartido). Cambios en `PilarPage.jsx`:
  - Nuevas `CierrePrimary`/`CierreSecondary` (variantes oscuro-sobre-dorado de los CTA
    compartidos, mismo manejo de anclas vs. rutas que `CtaPrimary`).
  - El Cierre **reutiliza el personaje del hero** (`cloneElement(hero.media, {video:
    undefined, halo: false})`) en vez de pedir una foto nueva por pilar: nada de contenido
    inventado. Sin video (evita decodificar el mismo mp4 dos veces en una sección que
    arranca fuera de pantalla) y sin el halo de brillo (pensado para fondo oscuro; sobre
    dorado se veía como una mancha). El anillo oscuro que sigue notándose alrededor del
    personaje es el propio degradado de fondo de la foto (política del proyecto: fondo
    oscuro en los bordes), no algo que se pueda apagar por CSS.
  - `HeroCharacter` ganó el prop `halo` (booleano, default `true`) para este caso puntual.
  - **Dos bugs reales encontrados y corregidos en el camino**: (1) los textos de CTA en
    `EducaPage.jsx` traían su propia "→" y el componente ya agrega la suya — flecha
    duplicada visible ("Diseñemos tu formación → →"), corregido quitando la flecha del
    texto. (2) el personaje clonado se renderizaba a 0×0 — la celda del grid con
    `justify-self-end` se encoge a su contenido, y el `w-full` interno de `HeroCharacter`
    no tenía contra qué resolverse (problema circular); se arregló dándole a la celda un
    ancho explícito (`max-w-[340px]`) en vez de dejarla encogerse.
  - `CierreSilhouette` (el fantasma de Meraki detrás del cierre oscuro de Educa) quedó
    obsoleto con el fondo dorado — se borró del todo (no solo se ocultó): no tenía otros
    usos y el patrón nuevo ya no lo necesita.
  - Verificado en Educa y Marketing (desktop + mobile), detector en 0, sin errores de
    consola.
- **Pilares (personajes con loop) fuera del Home + ScrollRail corregido (2026-09-28).**
  El usuario mostró 6 capturas (chips desalineados, tarjeta de Educa, y una etiqueta
  "LA FAMILIA" del riel lateral superpuesta sobre la tarjeta de BriefCTA) y pidió (1)
  quitar el bloque de las 5 tarjetas con personaje del Home y (2) corregir el riel.
  - `Home.jsx`: se quitó `<Pilares />` del render (con `id="ecosistema"`, era el ancla al
    que apuntaban `nav` y el footer). Mismo criterio "ocultar, no borrar" del resto del
    proyecto: el componente y sus datos siguen intactos en `Sections.jsx`/`site.js`.
  - Limpieza de huérfanos en cascada: `nav` en `site.js` quedó `[]` (ya no tenía más
    entradas que "Ecosistema"); el link "Nosotros" del footer (mismo destino) se quitó;
    `NavOverlay.jsx` componía `links` con `nav[0]` fijo — con `nav` vacío eso metía
    `undefined` como primer ítem del menú y rompía `.map()`; se cambió a `[...nav, ...]`,
    que tolera un array vacío.
  - **La causa real del desajuste del riel no era solo el bug reportado en la captura —
    era el método de cálculo.** `ScrollRail.jsx` repartía sus puntos por fracción pareja
    de la altura total de la página, asumiendo que el tramo entre cada hito medía lo
    mismo. Nunca fue cierto (el Hero pineado por sí solo mide 5940px; Manifiesto+BriefCTA+
    Autoridad juntos apenas 1300 más), y empeoró al sacar Pilares porque cambió la altura
    total sin que el cálculo lo supiera. Reescrito para medir `offsetTop` real de cada
    hito (`document.getElementById(h.id)?.offsetTop`, re-medido en el `onRefresh` de
    ScrollTrigger porque las imágenes/videos que cargan después desplazan las secciones).
  - **Bug encontrado en la propia reescritura, verificado con Playwright antes de darlo
    por bueno**: al usar el offset real, la etiqueta cambiaba a mitad de camino entre dos
    hitos (p. ej. a los 4000px de 7952 entre "Inicio" y "La familia") — como ese tramo
    incluye el Hero completo (5940px), la etiqueta decía "La familia" con el usuario
    todavía dentro del Hero. Se separó el índice usado para interpolar el tamaño de los
    puntos (sigue necesitando redondeo/fracción) del índice usado para el TEXTO de la
    etiqueta, que ahora solo avanza cuando el scroll cruza de verdad el offset real del
    siguiente hito — confirmado con `scrollTo` en 11 puntos de prueba: la etiqueta cambia
    exactamente en 0, 7952 y 11552 (los tres offsets reales), ya no antes.
  - Verificado en `localhost:5173` (1440px y 390px): sin errores de consola, menú sin
    "Ecosistema"/"Nosotros", flujo Manifiesto→BriefCTA sin hueco, detector de `impeccable`
    en 0 sobre los 4 archivos tocados.
- **Corrección del punto anterior: Pilares vuelve al Home, solo se quitaron las pastillas
  (2026-09-29).** El pedido original ("quitemos todos estos bloques de la home princpoial
  donde aparecen los personajes") se interpretó como sacar la sección `<Pilares />`
  completa — el usuario aclaró después que solo pedía quitar las pastillas de texto (los
  chips `b.items`: "Branding y posicionamiento", "Campañas"...) dentro de cada tarjeta, no
  la sección entera.
  - `Home.jsx`: `<Pilares />` vuelve al render, en su posición original (después de
    Manifiesto, antes de BriefCTA).
  - `Sections.jsx`: se quitó solo el `<div>` que pintaba `b.items` como pastillas
    redondeadas. El dato `items` sigue en `site.js` sin usarse en ningún lado — no se
    borró, solo este render.
  - Deshecha la limpieza de huérfanos del punto anterior, ahora innecesaria: `nav` vuelve
    a traer `{ href: '#ecosistema', label: 'Ecosistema' }`, el footer recupera el link
    "Nosotros", y `ScrollRail.jsx` recupera el hito `ecosistema` en `HITOS` (con offset
    real ~6668px, entre Inicio y La familia).
  - El fix del riel (offsets reales del DOM en vez de fracción pareja, índice de
    etiqueta separado del de interpolación) **sigue vigente y correcto** — es un bug real
    independiente de si Pilares existe o no. Reverificado con 4 hitos (antes 3): la
    etiqueta cambia exactamente en los 4 offsets reales (0, 6668, 12693, 16293 en esta
    medición), confirmado con `scrollTo`.
  - Verificado en `localhost:5173` (1440px y 390px): sin errores de consola, tarjetas de
    pilar sin pastillas (captura tomada y revisada), detector de `impeccable` en 0.

### ❌ Pendiente

1. **Home — bloque aprobado que aún falta:**
   - H-06 "Innovaciones seleccionadas" (casos reales con `destacadas_home` — no hay casos
     reales todavía, mismo bloqueo que IYB-04 de Inside Your Brand).
   - *(H-04 y H-05 ya están — ver "Hecho" arriba.)*
2. **Home — bloque sin base en la guía que sigue ahí**: `Manifiesto` (decidir si se queda,
   se reconvierte o se borra). `ValorHorizontal`, `InsideYourBrand` y `Portafolio` ya
   salieron del render (ver "Hecho").
3. **Hero de Home (`src/components/Hero.jsx`)**: el copy no calza con el aprobado (H1 dice
   "Somos una agencia de..." en vez de "Agencia de Crecimiento Creativo Empresarial.";
   falta el "Momento 2" completo tal como lo da la guía; el CTA no dice "Encuentra la
   solución que necesita tu empresa"). Tampoco hay botón "Saltar introducción" — por eso
   `intro_skipped` (evento de analítica) sigue sin poder dispararse (ver "Hecho" arriba).
4. **Menú hamburguesa fuera de Home**: solo queda el ancla "Ecosistema" (`#ecosistema`),
   que no existe en las páginas de pilar, el brief ni Inside Your Brand — rota ahí. Es
   trabajo de Fase 1 (Header/Footer) que el usuario dijo que podía esperar.
5. **Fase 5 — Oferta privada de Educa**: el panel GEC IA (`PanelEduca.jsx`, catálogo detrás
   de `GateForm.jsx` con correo+WhatsApp y OTP, `functions/api/otp/`) **está desactivado**
   desde 2026-09-27 a pedido del usuario: no quiere que la gente entre con solo dejar un
   correo. Se ocultó sin borrar (quitados `panel`/`ctaLabel` del pilar Educa en `site.js`
   y el montaje en `pages/Home.jsx`; instrucciones para reactivarlo en el comentario de
   `Home.jsx`). La guía pide una página propia (`/acceso/educa/`), protegida con
   **contraseña** (no OTP), fuera del menú y del sitemap, con meta `noindex` — sigue sin
   construirse; decidir si se hace.
6. **Fase 6 — lo que falta tras el SEO básico y la capa de eventos de arriba**: el propio
   GA4 conectado de verdad (falta el Measurement ID real — pedírselo al usuario o que cree
   la propiedad), Search Console verificado, Schema Service por pilar, BreadcrumbList en
   páginas internas, y los dos eventos que quedaron sin punto de enganche
   (`intro_skipped`, `innovation_opened` — ver ítems 3 y 1). El sitio sigue siendo un SPA
   sin prerender/SSR — riesgo real de indexación, ya anotado como TODO en el propio
   `src/hooks/useDocumentMeta.js`.
7. **Fase 7 — QA**: depende de que lo anterior avance.

### Siguiente paso sugerido
Por orden de impacto/costo: (1) pedir al usuario el Measurement ID de GA4 (o ayudarlo a
crear la propiedad) para activar de verdad lo que ya quedó construido; (2) H-06
Innovaciones, IYB-03/IYB-04 con contenido real y el Hero de Home, cuando haya
casos/publicaciones reales y se defina el copy exacto de "Momento 2".