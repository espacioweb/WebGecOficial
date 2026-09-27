import { useState } from 'react';
import { LayoutGrid, GalleryHorizontal, Play } from 'lucide-react';
import { P } from '../utils/textStyles';
import { track } from '../utils/analytics';
import VideoModal from './VideoModal';

function VideoCard({ video, color, onOpen, className = '' }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(video)}
      className={`group flex cursor-pointer flex-col text-left ${className}`}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/[.08] bg-[#10161D]">
        <img
          src={video.thumbnail}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div
          className="absolute inset-0 grid place-items-center opacity-90 transition-opacity duration-200 group-hover:opacity-100"
        >
          <div className="grid h-12 w-12 place-items-center rounded-full backdrop-blur-sm" style={{ background: `${color}e6` }}>
            <Play size={18} strokeWidth={2.5} className="translate-x-[1px] text-[#10131A]" fill="#10131A" />
          </div>
        </div>
      </div>
      <p className="m-0 mt-3 line-clamp-2 text-[13.5px] leading-[1.45] font-semibold text-white" style={P}>
        {video.title}
      </p>
    </button>
  );
}

// Carrusel/grid de episodios de Inside Your Brand con opción de vista y
// modal premium al abrir uno. `videos` llega ya resuelto por quien lo usa
// (fetch en vivo + respaldo fusionados) — este componente solo presenta.
export default function VideoCarousel({ videos, color = '#F5B301' }) {
  const [vista, setVista] = useState('carrusel'); // carrusel · grid
  const [abierto, setAbierto] = useState(null);

  if (!videos.length) return null;

  const abrir = (video) => {
    setAbierto(video);
    track('content_opened', { tipo: 'video', id: video.id, titulo: video.title });
  };

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <div className="inline-flex rounded-full border border-white/[.12] p-1">
          {[
            { id: 'carrusel', label: 'Carrusel', icon: GalleryHorizontal },
            { id: 'grid', label: 'Grid', icon: LayoutGrid },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setVista(id)}
              aria-pressed={vista === id}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-colors"
              style={{
                ...P,
                background: vista === id ? color : 'transparent',
                color: vista === id ? '#10131A' : 'rgba(242,239,233,.6)',
              }}
            >
              <Icon size={14} strokeWidth={2.5} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {vista === 'carrusel' ? (
        <div data-lenis-prevent className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} color={color} onOpen={abrir} className="w-[240px] flex-none snap-start sm:w-[300px]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} color={color} onOpen={abrir} />
          ))}
        </div>
      )}

      <VideoModal video={abierto} onClose={() => setAbierto(null)} />
    </div>
  );
}
