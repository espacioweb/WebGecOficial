# Actualizar Nuestra promesa de valor

Autorizado por el usuario el 11 de octubre de 2026. Alcance: solo el bloque Manifiesto del Home, con el contenido de GEC_Cambios_Web_Promesa_de_Valor.md.

1. [x] Localizar estructura y respaldar Sections.jsx en .backups/promesa-valor-20261011/. Evidencia: Home monta Manifiesto; video actual precede al texto y no hay CTA.
2. [x] Sustituir titular y tres tarjetas con copy literal, colocar texto antes del video y añadir CTA dorado hacia el video y cierre aprobado. Demostración: diff limitado al bloque y cotejo con documento.
3. [x] Revisar sin editar mediante subagente; ejecutar build y lint. Demostración: leer resultados e identificar cualquier fallo previo.
4. [x] Verificar escritorio y móvil en navegador: orden, desbordamiento, CTA, doble activación, reproducción y recarga. Demostración: capturas y comprobaciones DOM/video.

Conservar Poppins, negro #060607, blanco #EDEAE4, gris y acción #F5B301. Mantener tres tarjetas, animaciones y video existente; no añadir dependencias. El titular y la secuencia 01–03 llevan la jerarquía visual.

No hacer commit ni publicar sin confirmación. Si un paso falla dos veces, detenerlo y replantear aquí.

Replanteo verificación de scroll normal: dos intentos enfocaron el reproductor pero la posición final no quedó visible. Ambos usaron auto-scroll de Playwright (click/scrollIntoViewIfNeeded), que puede desincronizar Lenis. Detener ese método; repetir con rueda real exclusivamente hasta que el CTA esté visible y después click sin auto-scroll. Si persiste, corregir la causa del CTA y verificar de nuevo. Movimiento reducido, reproducción, recarga y tamaños 1440/390 ya pasan.

Resultado: copy cotejado y revisor conforme. Build pasa (aviso de bundle >500 kB); lint de Sections.jsx pasa, igual que su versión respaldada. Lint general falla en archivos ajenos (172 problemas). UI inspeccionada en capturas .playwright-mcp/promesa-desktop.png y promesa-mobile.png; sin desbordamiento a 1440/390 px. CTA enfoca reproductor; doble activación no duplica video; video avanza, sin error, y recarga restaura póster. Entrada vacía no aplica: este bloque no contiene formulario.

Replanteo resuelto: con rueda real y clic por coordenadas, Lenis deja el video a 24 px del borde superior y enfoca reproducción. Los resultados anteriores eran interferencia del auto-scroll de Playwright; no fue necesario cambiar código. No commit ni publicación.
