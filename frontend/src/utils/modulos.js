// Módulos que un músico puede tener habilitados o no. Un administrador siempre ve todo.
// Dashboard, Usuarios, Recordatorios y Configuración son exclusivos de administrador:
// el Dashboard muestra cifras financieras del negocio, y los otros tres son de gestión.
export const MODULOS_DISPONIBLES = [
  { clave: 'calendario', etiqueta: 'Calendario', ruta: '/calendario' },
  { clave: 'eventos', etiqueta: 'Eventos', ruta: '/eventos' },
  { clave: 'paquetes', etiqueta: 'Paquetes', ruta: '/paquetes' },
]

export const TODOS_LOS_MODULOS = MODULOS_DISPONIBLES.map((m) => m.clave)
