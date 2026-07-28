import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';
import { audioEngine } from '../utils/audioEngine';

const EAGER_FRAMES = 15;

export default function ScrollyCanvas({ sceneId = 1, frameCount = 90 }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);
  const sizeRef = useRef({ width: 0, height: 0 });
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const [sequenceMissing, setSequenceMissing] = useState(false);

  const sequenceDir = `/assets/sequences/scene_${sceneId}`;
  const framePath = (index) =>
    `${sequenceDir}/frame_${String(index).padStart(3, '0')}.webp`;

  const draw = (index) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = sizeRef.current;
    ctx.clearRect(0, 0, width, height);

    const scale = Math.min(width / img.width, height / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const dx = (width - drawW) / 2;
    const dy = (height - drawH) / 2;
    ctx.drawImage(img, dx, dy, drawW, drawH);
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
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(currentFrameRef.current);
  };

  // Progressive sequence loading: eager frames first, rest lazily in background
  useEffect(() => {
    let cancelled = false;
    const images = new Array(frameCount);
    imagesRef.current = images;
    setFirstFrameReady(false);
    setSequenceMissing(false);

    const loadFrame = (index) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = framePath(index);
      });

    (async () => {
      const eagerCount = Math.min(EAGER_FRAMES, frameCount);
      const eager = await Promise.all(
        Array.from({ length: eagerCount }, (_, i) => loadFrame(i)),
      );
      if (cancelled) return;

      eager.forEach((img, i) => {
        images[i] = img;
      });

      if (!images[0]) {
        setSequenceMissing(true);
        return;
      }

      setFirstFrameReady(true);
      resizeCanvas();

      for (let i = eagerCount; i < frameCount; i += 1) {
        if (cancelled) return;
        images[i] = await loadFrame(i);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId, frameCount]);

  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useGSAP(
    () => {
      if (!firstFrameReady) return undefined;

      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const trigger = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            const index = Math.min(
              frameCount - 1,
              Math.round(self.progress * (frameCount - 1)),
            );
            currentFrameRef.current = index;
            draw(index);
            audioEngine.updateScrollAudio(self.progress);
          },
        });

        return () => trigger.kill();
      });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        draw(0);
      });

      return () => mm.revert();
    },
    { dependencies: [firstFrameReady, frameCount], scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative h-[100dvh] w-full overflow-hidden bg-[#050505]"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {sequenceMissing && (
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-white/40">
          No frame sequence found in {sequenceDir}/ — add frame_000.webp
          onward (Phase 3).
        </div>
      )}
    </section>
  );
}
