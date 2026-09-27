import { createContext } from 'react';

// Expone el Lenis global para que cualquier página pueda pausarlo (p. ej. al
// abrir un panel o modal) sin tener que reinstanciar el scroll suave por ruta.
export const LenisContext = createContext(null);
