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