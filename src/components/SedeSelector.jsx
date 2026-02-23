import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSedeStore } from '../stores/sedeStore';
import { MapPin, ChevronDown, Check } from 'lucide-react';

export default function SedeSelector() {
    const { currentSede, sedesDisponibles, cargarSedes, marcarSede, isLoading } = useSedeStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const [dropdownCurrentPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

    // Cargar sedes al montar
    useEffect(() => {
        cargarSedes();
    }, [cargarSedes]);

    // Calcular posición del dropdown
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + window.scrollY + 8, // 8px de margen
                left: rect.left + window.scrollX,
                width: 240 // Ancho fijo o rect.width si prefieres
            });
        }
    }, [isOpen]);

    // Cerrar al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event) {
            // Verificar si el click fue en el botón (para no reabrirlo al cerrar)
            if (buttonRef.current && buttonRef.current.contains(event.target)) {
                return;
            }
            // Verificar si el click fue dentro del dropdown (portal)
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            // También cerrar al hacer scroll para evitar desalineación
            window.addEventListener("scroll", () => setIsOpen(false), true);
            window.addEventListener("resize", () => setIsOpen(false));
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", () => setIsOpen(false), true);
            window.removeEventListener("resize", () => setIsOpen(false));
        };
    }, [isOpen]);

    const handleSedeChange = async (sedeId) => {
        if (currentSede?.id === sedeId) {
            setIsOpen(false);
            return;
        }
        const changed = await marcarSede(sedeId);
        if (changed) {
            setIsOpen(false);
            // Forzar recarga completa para asegurar contexto limpio
            window.location.reload();
        }
    };

    const sedesList = Array.isArray(sedesDisponibles) ? sedesDisponibles : [];

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    group inline-flex items-center gap-x-2 
                    px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 
                    bg-transparent
                    hover:bg-gray-100 dark:hover:bg-gray-700/50 
                    rounded-md
                    transition-all duration-200 ease-in-out
                    ${isOpen ? 'bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-white' : ''}
                `}
            >
                <MapPin size={16} className={`${isOpen ? 'text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'} transition-colors`} />

                <span className="truncate max-w-[150px]">
                    {isLoading ? '...' : (currentSede?.nombre || 'Seleccionar Sede')}
                </span>

                <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-gray-600' : ''}`}
                />
            </button>

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    style={{
                        top: dropdownCurrentPos.top,
                        left: dropdownCurrentPos.left - (240 - buttonRef.current?.offsetWidth || 0), // Alinear a la derecha del botón
                        position: 'absolute',
                        zIndex: 9999,
                        opacity: dropdownCurrentPos.top === 0 ? 0 : 1,
                        pointerEvents: dropdownCurrentPos.top === 0 ? 'none' : 'auto'
                    }}
                    className="w-60 bg-white dark:bg-gray-800 rounded-lg shadow-xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none animate-in fade-in zoom-in-95 duration-100 p-1"
                >
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {sedesList.map((sede) => {
                            const isActive = currentSede?.id === sede.id;
                            return (
                                <button
                                    key={sede.id}
                                    onClick={() => handleSedeChange(sede.id)}
                                    className={`
                                        relative flex w-full items-center justify-between px-3 py-2 text-sm rounded-md transition-all duration-150
                                        ${isActive
                                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'}
                                    `}
                                >
                                    <div className="flex flex-col items-start text-left">
                                        <span>{sede.nombre}</span>
                                    </div>

                                    {isActive && (
                                        <Check size={14} className="text-gray-900 dark:text-white" strokeWidth={2} />
                                    )}
                                </button>
                            );
                        })}

                        {sedesList.length === 0 && !isLoading && (
                            <div className="px-4 py-3 text-center text-xs text-gray-500">
                                No hay sedes disponibles
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
