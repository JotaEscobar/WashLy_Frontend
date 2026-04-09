import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axiosConfig';

export const useSedeStore = create(
    persist(
        (set, get) => ({
            currentSede: null,
            sedesDisponibles: [],
            isLoading: false,

            setCurrentSede: (sede) => set({ currentSede: sede }),

            setSedesDisponibles: (sedes) => set({ sedesDisponibles: sedes }),

            cargarSedes: async () => {
                set({ isLoading: true });
                try {
                    const response = await api.get('core/sedes/');
                    // Manejar paginación de DRF
                    const sedes = Array.isArray(response.data) ? response.data : (response.data.results || []);
                    set({ sedesDisponibles: sedes });

                    // Si no hay sede seleccionada, seleccionar la primera
                    const { currentSede } = get();
                    // console.log('🔍 [SEDE STORE] cargarSedes - currentSede:', currentSede?.id, ...);

                    if (!currentSede && sedes.length > 0) {
                        // console.log('🔍 [SEDE STORE] No hay sede seleccionada, asignando primera:', ...);
                        set({ currentSede: sedes[0] });
                    } else if (currentSede) {
                        // Validar que la sede actual siga siendo accesible
                        const sigueAccesible = sedes.find(s => s.id === currentSede.id);
                        // console.log('🔍 [SEDE STORE] ¿Sede actual accesible?', !!sigueAccesible, ...);
                        if (!sigueAccesible && sedes.length > 0) {
                            console.warn('⚠️ [SEDE STORE] Sede actual NO accesible, reseteando a primera:', sedes[0].id, sedes[0].nombre);
                            set({ currentSede: sedes[0] });
                        }
                    }
                } catch (error) {
                    console.error('Error al cargar sedes:', error);
                } finally {
                    set({ isLoading: false });
                }
            },

            marcarSede: async (sedeId) => {
                const { sedesDisponibles } = get();
                const sede = sedesDisponibles.find(s => s.id === sedeId);
                if (sede) {
                    set({ currentSede: sede });
                    // Disparar evento para que otros componentes recarguen si es necesario
                    window.dispatchEvent(new Event('sede-changed'));
                    return true;
                }
                return false;
            }
        }),
        {
            name: 'sede-storage',
        }
    )
);
