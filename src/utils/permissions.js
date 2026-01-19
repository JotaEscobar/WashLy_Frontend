/**
 * Matriz de Rutas Permitidas por Rol (RBAC)
 * Define qué rutas puede visitar cada rol.
 */

export const ROLES = {
  ADMIN: 'ADMIN',
  CAJERO: 'CAJERO',
  OPERARIO: 'OPERARIO',
};

export const PERMISSIONS = {
  [ROLES.ADMIN]: [
    '/dashboard',
    '/pos',
    '/tickets',
    '/clients',
    '/inventory',
    '/payments',
    '/config',
    '/reportes'
  ],
  [ROLES.CAJERO]: [
    '/pos',
    '/tickets',
    '/clients',
    '/payments'
  ],
  [ROLES.OPERARIO]: [
    '/tickets'
  ]
};

// Rutas públicas o de sistema que no requieren verificación de rol (pero sí auth)
export const COMMON_ROUTES = ['/expired', '/profile', '/404'];

export const getLandingPage = (rol) => {
  switch (rol) {
    case ROLES.ADMIN: return '/dashboard';
    case ROLES.CAJERO: return '/pos';
    case ROLES.OPERARIO: return '/tickets';
    default: return '/login';
  }
};