# Ajustes UX: promesa de valor y programas Educa

Autorizado el 11 de octubre de 2026. Respaldos en .backups/ux-programas-20261011/.

1. [x] Reproducir: CTA lleva al video contiguo; separación entre cierre y siguiente bloque 219 px a 1440 px; Wellness navega a /cuentanos-tu-reto/?pilar=educa&tema=wellness, sin modal.
2. [x] Quitar exclusivamente CTA redundante y reducir padding acumulado entre Manifiesto y Pilares. Evidencia: diff y medida en navegador.
3. [x] Abrir formularios de audiovisual, Wellness y Cultura en modal amplio reutilizando el formulario interno, con tema correcto, cierre visible/Escape, foco y scroll conservados. CompañIA conserva su sitio externo. Evidencia: URL permanece /educa/, formulario operable, fondo bloqueado y retorno al activador.
4. [x] Revisión solo lectura por subagente, build y lint de archivos tocados; verificar móvil/escritorio, formulario vacío, doble apertura, cierre, cambio de tema, recarga y ruta del brief independiente. No enviar datos reales.

Sin dependencias nuevas ni cambios de contenido del formulario. Lessons actualizadas por la corrección del usuario. Si un paso falla dos veces, registrar y replantear.
Commit y producción pendientes de aprobación para esta corrección.

Replanteo de verificación visual: dos lecturas en servidor dev dieron dialog sin estilos nuevos (radio0, margin0), aunque build genera CSS correcto. El primer script además esperaba Comenzar exacto sin contemplar flecha/progreso. Detener pruebas sobre ese servidor; iniciar preview del build y verificar el artefacto compilado. Foco retorna al activador en la prueba ejecutada.

Resultados: build pasa (aviso existente bundle >500 kB), eslint de los cuatro archivos pasa y diff --check limpio. Revisado estáticamente por revisor sin cambios. Capturas inspeccionadas: .playwright-mcp/programa-desktop.png y programa-mobile.png. Modal ancho 1100 px escritorio, 358 px móvil; no desborda. URL/título se mantienen en Educa, borradores separados Wellness/Cultura y programa audiovisual precargado. X/Escape/fondo cierran, foco vuelve, recarga cierra; doble apertura produce un solo dialog. Campo vacío bloquea avance con «Elige al menos un área». Ciclo de 12 Tab permanece en el modal. Con rueda real y Lenis activo: scroll 1409.5 antes/durante/después cierre y rueda vuelve a funcionar. Ruta del brief independiente conserva main y metadatos. No se enviaron datos ni se comprobó envío al backend (sin cambios en endpoint).
Separación cierre→pilares reducida de219 a86 px escritorio y48 px móvil. CTA redundante ausente. Estilos correctos en preview del build; problema dev descartado. Listo para revisión del usuario; no commit ni publicación de esta corrección.
