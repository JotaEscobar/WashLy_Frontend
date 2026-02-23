// Constantes para estados de tickets
export const TICKET_ESTADOS = {
    RECIBIDO: 'RECIBIDO',
    EN_PROCESO: 'EN_PROCESO',
    LISTO: 'LISTO',
    ENTREGADO: 'ENTREGADO',
    CANCELADO: 'CANCELADO'
};

// Labels legibles para estados
export const TICKET_ESTADOS_LABELS = {
    [TICKET_ESTADOS.RECIBIDO]: 'Recibido',
    [TICKET_ESTADOS.EN_PROCESO]: 'En Proceso',
    [TICKET_ESTADOS.LISTO]: 'Listo',
    [TICKET_ESTADOS.ENTREGADO]: 'Entregado',
    [TICKET_ESTADOS.CANCELADO]: 'Cancelado'
};

// Constantes para prioridades
export const TICKET_PRIORIDADES = {
    NORMAL: 'NORMAL',
    EXPRESS: 'EXPRESS',
    URGENTE: 'URGENTE'
};

// Colores para UI
export const TICKET_ESTADOS_COLORS = {
    [TICKET_ESTADOS.RECIBIDO]: 'blue',
    [TICKET_ESTADOS.EN_PROCESO]: 'indigo',
    [TICKET_ESTADOS.LISTO]: 'emerald',
    [TICKET_ESTADOS.ENTREGADO]: 'gray',
    [TICKET_ESTADOS.CANCELADO]: 'red'
};
