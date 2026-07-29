import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';
import { loadSequence, nearestLoaded, esPantallaChica } from '../utils/frameSequence';

// En un teléfono no se sirve la secuencia grande: son 110 fotogramas de
// 1600×900, que decodificados pesan 634 MB y Safari en iOS no los sostiene.
// `scene_1_m` trae 56 fotogramas ya recortados y a 640 px — 77 MB — con el
// mismo recorrido y el mismo centro, así que el encuadre no cambia.
const ESCRITORIO = { dir: '/assets/sequences/scene_1', frames: 110 };
const MOVIL = { dir: '/assets/sequences/scene_1_m', frames: 56 };
const EAGER_FRAMES = 12;

// Ventanas de scroll [entrada, salida] para cada bloque de texto
const WINDOWS = [
  [0, 0.1],
  [0.13, 0.31],
  [0.34, 0.52],
  [0.55, 0.72],
  [0.78, 1.001],
];

export default function Hero() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);
  const sizeRef = useRef({ width: 0, height: 0 });
  const progressRef = useRef(0);
  const stepsRef = useRef([]);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);
  // Se decide una sola vez, al montar: cambiar de secuencia a mitad de scroll
  // no aporta nada y obligaría a recargarlo todo.
  const [SEQ] = useState(() => (esPantallaChica() ? MOVIL : ESCRITORIO));
  const framePath = (i) => `${SEQ.dir}/frame_${String(i).padStart(3, '0')}.webp`;

  const draw = (index) => {
    const canvas = canvasRef.current;
    // Mientras la secuencia termina de llegar dibujamos el vecino cargado más
    // cercano. Si aquí saliéramos sin pintar, el lienzo se congelaría en el
    // último fotograma disponible y la escena se vería como una foto fija.
    const img = nearestLoaded(imagesRef.current, index);
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = sizeRef.current;
    ctx.clearRect(0, 0, width, height);

    const p = progressRef.current;
    const portrait = height / width > 1.15;

    if (portrait) {
      // Vertical: "cover" agrandaría al personaje hasta tapar el texto, y
      // ajustar por ancho lo dejaría diminuto. Lo encajamos en la franja
      // superior y dejamos la inferior libre para el copy.
      //
      // Medido sobre los 110 fotogramas: el personaje se mantiene centrado en
      // el 50% del cuadro (entre 47.8 y 51.7), nunca en el 60% que se suponía
      // antes — por eso quedaba descuadrado y se salía por un lado.
      const CHAR_X = 0.5;
      // Y encoge con el scroll en vez de crecer: al final del recorrido el
      // copy ocupa el tercio inferior, así que el personaje tiene que haberse
      // recogido para no quedar debajo del texto.
      const alto = 0.62 - 0.13 * p;
      const scale = (height * alto) / img.height;
      const w = img.width * scale;
      const h = img.height * scale;
      // El ancho nunca debe quedar corto: si no, se ven franjas negras al lado.
      const dx = Math.min(0, Math.max(width - w, width / 2 - w * CHAR_X));
      ctx.drawImage(img, dx, height * 0.02, w, h);
      return;
    }

    // Horizontal: conforme avanza el scroll encuadramos al personaje hacia la
    // derecha para dejar libre la mitad izquierda, donde entra el texto final.
    // El zoom tiene que ser mayor que el doble del desplazamiento, o el encuadre
    // se sale del lienzo y aparece la franja negra del fondo de la sección.
    const SHIFT = 0.17;
    const zoom = 1 + 2.2 * SHIFT * p;
    const scale = Math.max(width / img.width, height / img.height) * zoom;
    const w = img.width * scale;
    const h = img.height * scale;
    const shift = SHIFT * p * width;
    // Clamp de seguridad: el dibujo siempre cubre el lienzo completo.
    const dx = Math.min(0, Math.max(width - w, (width - w) / 2 + shift));
    ctx.drawImage(img, dx, (height - h) / 2, w, h);
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    sizeRef.current = { width: rect.width, height: rect.height };
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(currentFrameRef.current);
  };

  // Carga progresiva. El orden y la concurrencia los resuelve
  // `loadSequence`: barre toda la escena con paso grueso y lo va afinando, en
  // vez de pedir 0·1·2·3 (que dejaba el hero clavado en un teléfono).
  useEffect(() => {
    const images = new Array(SEQ.frames);
    imagesRef.current = images;

    return loadSequence({
      total: SEQ.frames,
      eager: EAGER_FRAMES,
      src: framePath,
      images,
      onReady: (ok) => {
        if (!ok) {
          setMissing(true);
          return;
        }
        setReady(true);
        resizeCanvas();
      },
      onFrame: () => draw(currentFrameRef.current),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useGSAP(
    () => {
      if (!ready) return undefined;
      const mm = gsap.matchMedia();

      const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
      const win = (p, s, e) => clamp((p - s) / (e - s), 0, 1);
      const band = (p, s, e, f) => Math.min(win(p, s, s + f), 1 - win(p, e - f, e));

      const applySteps = (p) => {
        stepsRef.current.forEach((el, i) => {
          if (!el) return;
          const [s, e] = WINDOWS[i];
          let o;
          if (i === 0) o = 1 - win(p, 0.05, 0.11);
          else if (i === 4) o = win(p, s, 0.9);
          else o = band(p, s, e, 0.05);
          el.style.opacity = String(o);
          el.style.transform = `translateY(${((1 - o) * 26).toFixed(1)}px)`;
          el.style.filter = `blur(${((1 - o) * 5).toFixed(1)}px)`;
        });
      };

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const trigger = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=560%',
          pin: true,
          scrub: 1,
          // El pin añade 560vh y desplaza todo lo que viene abajo. Como este
          // trigger se crea tarde (al cargar los frames), sin prioridad las
          // secciones siguientes quedan calculadas sin ese desplazamiento y
          // llegan a su progreso final antes de tiempo.
          refreshPriority: 1,
          onUpdate: (self) => {
            const p = self.progress;
            progressRef.current = p;
            const index = Math.min(
              SEQ.frames - 1,
              Math.round(p * (SEQ.frames - 1)),
            );
            currentFrameRef.current = index;
            draw(index);
            applySteps(p);
          },
        });
        applySteps(0);

        // El pin del hero se crea recién cuando cargan los frames y añade
        // 560vh al documento: sin este refresh, todos los ScrollTrigger de
        // las secciones de abajo quedan calculados sobre la altura vieja.
        ScrollTrigger.refresh();

        return () => trigger.kill();
      });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        progressRef.current = 1;
        draw(SEQ.frames - 1);
        stepsRef.current.forEach((el, i) => {
          if (el) el.style.opacity = i === 4 ? '1' : '0';
        });
      });

      return () => mm.revert();
    },
    { dependencies: [ready], scope: sectionRef },
  );

  const setStep = (i) => (el) => {
    stepsRef.current[i] = el;
  };

  return (
    // El fondo empata con el borde del propio video (azul marino, no negro),
    // así cualquier costura del encuadre pasa desapercibida.
    <section id="top" ref={sectionRef} className="relative h-[100dvh] w-full overflow-hidden bg-[#1d2230]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* viñeta */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 55%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.72) 100%)',
        }}
      />

      {/* Scrim de legibilidad. En móvil el copy va abajo, así que el degradado
          sube desde el pie; en desktop no hace falta (el personaje va derecha). */}
      <div
        className="pointer-events-none absolute inset-0 lg:hidden"
        style={{
          background:
            'linear-gradient(180deg, rgba(5,5,6,0) 30%, rgba(5,5,6,.55) 52%, rgba(5,5,6,.92) 72%, #050506 100%)',
        }}
      />

      {/* Si la secuencia no llega a cargar, el lienzo se queda vacío y la
          sección se ve rota. Un solo fotograma de respaldo la deja legible
          aunque no haya animación. */}
      {missing && (
        <img
          src={framePath(0)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[50%_35%]"
        />
      )}

      <div className="pointer-events-none absolute inset-0 grid place-items-center px-[clamp(24px,7vw,140px)]">
        <div className="relative h-full w-[min(1560px,100%)]">
          {/* 0 — intro */}
          <div ref={setStep(0)} className="absolute inset-0 grid content-center justify-center gap-[22px] text-center">
            <div
              className="text-[12px] uppercase"
              style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '.42em', color: 'rgba(237,234,228,.42)' }}
            >
              Grupo Espacio Creativo
            </div>
            <div
              className="text-[clamp(13px,1.1vw,15px)]"
              style={{ fontFamily: 'Poppins, sans-serif', color: 'rgba(237,234,228,.30)' }}
            >
              Desliza para encender la idea
            </div>
            <div
              className="mx-auto h-14 w-px"
              style={{ background: 'linear-gradient(180deg, rgba(245,179,1,.7), rgba(245,179,1,0))' }}
            />
          </div>

          {/* 1 */}
          <div ref={setStep(1)} className="absolute top-1/2 left-0 max-w-[640px] pr-4 opacity-0">
            <p
              className="m-0 text-[clamp(26px,5.4vw,60px)] leading-[1.08] font-semibold text-[#EDEAE4]"
              style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-.02em', textWrap: 'pretty' }}
            >
              El crecimiento que buscas <em className="not-italic text-[#F5B301]">afuera</em>
            </p>
          </div>

          {/* 2 */}
          <div ref={setStep(2)} className="absolute top-[44%] right-0 max-w-[620px] pl-4 text-right opacity-0">
            <p
              className="m-0 text-[clamp(26px,5.4vw,60px)] leading-[1.08] font-semibold text-[#EDEAE4]"
              style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-.02em' }}
            >
              inicia cuando lo construyes
            </p>
          </div>

          {/* 3 */}
          <div ref={setStep(3)} className="absolute top-[22%] right-0 left-0 text-center opacity-0">
            <p
              className="m-0 text-[clamp(30px,6.4vw,74px)] leading-[1.04] font-bold text-white"
              style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-.025em' }}
            >
              desde adentro.
            </p>
          </div>

          {/* 4 — cierre con CTA */}
          <div
            ref={setStep(4)}
            // En desktop no se centra con translate (el bloque es alto y se
            // metía bajo el header): ocupa la franja que va DESDE debajo del
            // menú hasta abajo, y centra su contenido dentro de esa franja.
            className="pointer-events-auto absolute bottom-[7%] left-0 flex w-full flex-col items-start justify-center gap-[18px] text-left opacity-0 sm:gap-[24px] md:w-[72%] lg:top-[104px] lg:bottom-[6%] lg:w-[min(520px,42%)]"
          >
            <h1
              className="m-0 text-[clamp(30px,6vw,56px)] leading-[1.04] font-bold text-white"
              style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-.03em', textWrap: 'balance' }}
            >
              Somos una agencia de <span className="text-[#F5B301]">Crecimiento Creativo Empresarial</span>.
            </h1>
            <p
              className="m-0 max-w-[52ch] text-[clamp(14px,1.1vw,17px)] leading-[1.7]"
              style={{ color: 'rgba(237,234,228,.74)' }}
            >
              Ayudamos a las empresas a crecer desde adentro hacia afuera con estrategia,
              producción, formación, soluciones y experiencias en un solo ecosistema.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#ecosistema"
                className="rounded-full bg-[#F5B301] px-7 py-[15px] text-sm font-semibold text-[#0B0B0C] transition-colors hover:bg-[#FFD24A]"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Conocer el ecosistema
              </a>
              <a
                href="#contacto"
                className="rounded-full border border-white/20 px-7 py-[15px] text-sm font-medium text-[#EDEAE4] transition-colors hover:border-[#F5B301] hover:text-[#F5B301]"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Agendar una conversación
              </a>
            </div>
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute right-0 bottom-0 left-0 h-[120px]"
        style={{ background: 'linear-gradient(180deg, rgba(6,6,7,0) 0%, #060607 100%)' }}
      />
    </section>
  );
}
