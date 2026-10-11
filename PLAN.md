# Separación de video y contraste del modal

Autorizado el 11 de octubre de 2026. Respaldos .backups/modal-contraste-20261011/.

1. [x] Reproducir: medir gap tarjetas/video con animación normal y revisar preselección en modal limpio + borrador existente.
2. [x] Reservar aire tarjetas/video incluso durante animación; mantener compacta transición posterior a pilares. Verificar medidas y capturas móvil/escritorio.
3. [x] Modales abren desde intro con respuestas sin preselección ni restauración automática de borradores. Conservar contexto del programa separado de respuestas cuando corresponda y ruta independiente intacta. Verificar tres programas y selección manual.
4. [x] Modal gris más claro, borde/sombra definidos, backdrop oscuro desenfocado y opciones diferenciadas dentro del modal. Mantener identidad premium, dorado en acciones. Revisar captura real y cierre/foco/scroll.
5. [x] Revisor solo lectura, build, lint archivos y navegador: vacío, selección manual, reapertura, borrador anterior, X/Escape, responsive. Sin envío real.

Sin dependencias ni cambios ajenos. No commit/publicación sin aprobación. Si falla dos veces un paso, detener y replantear.

Resultados: reproducido gap -4 px con GSAP y48 y precarga audiovisual/educa en draft. Corrección verificada con GSAP activo: separación mínima64 px escritorio y56 px móvil; final88/80 px. Build pasa con aviso existente de bundle>500kB; eslint de3 JSX pasa y diff--check limpio. Revisor estático conforme; su cálculo de gap omitía gap44, comprobado en navegador por raíz.
Los3 programas abren intro y opciones sin selección incluso con draft viejo; vacío muestra error y selección manual se pinta dorada. Reapertura inicia limpio, draft antiguo permanece intacto. Ruta independiente conserva su conducta previa. Contexto pilar/tema sigue en fuente del payload (revisión estática; no envío real). Modal colores verificados y capturas desktop/mobile/contexto inspeccionadas; no desborda, X/Escape cierran y foco retorna. Superficie gris34,40,49, opciones51,61,73 y fondo85%+blur12. País telefónicoHN conserva default técnico previo; no se precargan respuestas de necesidad/área.
Listo localmente; pendiente aprobación de commit y producción.
