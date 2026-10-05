function Icono({ className = 'size-5', children }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  )
}

export function IconoCorreo(props) {
  return (
    <Icono {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Icono>
  )
}

export function IconoCandado(props) {
  return (
    <Icono {...props}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Icono>
  )
}

export function IconoOjo(props) {
  return (
    <Icono {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Icono>
  )
}

export function IconoOjoTachado(props) {
  return (
    <Icono {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      <path d="m3 3 18 18" />
    </Icono>
  )
}

export function IconoFlecha(props) {
  return (
    <Icono {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icono>
  )
}

export function IconoEscudo(props) {
  return (
    <Icono {...props}>
      <path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </Icono>
  )
}

export function IconoNotaMusical(props) {
  return (
    <Icono {...props}>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </Icono>
  )
}

export function IconoCuadricula(props) {
  return (
    <Icono {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Icono>
  )
}

export function IconoCalendario(props) {
  return (
    <Icono {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </Icono>
  )
}

export function IconoCheckCirculo(props) {
  return (
    <Icono {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </Icono>
  )
}

export function IconoDinero(props) {
  return (
    <Icono {...props}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </Icono>
  )
}

export function IconoReloj(props) {
  return (
    <Icono {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icono>
  )
}

export function IconoCubo(props) {
  return (
    <Icono {...props}>
      <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
      <path d="m4 7 8 4 8-4M12 11v10" />
    </Icono>
  )
}

export function IconoUsuarios(props) {
  return (
    <Icono {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.5a6.5 6.5 0 0 1 3 5.5" />
    </Icono>
  )
}

export function IconoLista(props) {
  return (
    <Icono {...props}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </Icono>
  )
}

export function IconoAjustes(props) {
  return (
    <Icono {...props}>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </Icono>
  )
}

export function IconoSalir(props) {
  return (
    <Icono {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </Icono>
  )
}

export function IconoMenu(props) {
  return (
    <Icono {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </Icono>
  )
}

export function IconoMas(props) {
  return (
    <Icono {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icono>
  )
}

export function IconoChevron(props) {
  return (
    <Icono {...props}>
      <path d="m9 6 6 6-6 6" />
    </Icono>
  )
}

export function IconoLapiz(props) {
  return (
    <Icono {...props}>
      <path d="M4 20h4L18.5 9.5a2.5 2.5 0 0 0-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </Icono>
  )
}

export function IconoBasura(props) {
  return (
    <Icono {...props}>
      <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0-.8 12.1a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7" />
      <path d="M10 11v6M14 11v6" />
    </Icono>
  )
}

export function IconoBusqueda(props) {
  return (
    <Icono {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </Icono>
  )
}

export function IconoCheck(props) {
  return (
    <Icono {...props}>
      <path d="M4.5 12.5 9 17l10.5-11" />
    </Icono>
  )
}

export function IconoEstrella(props) {
  return (
    <Icono {...props}>
      <path d="m12 3 2.7 5.7 6.3.8-4.6 4.4 1.1 6.2-5.5-3-5.5 3 1.1-6.2-4.6-4.4 6.3-.8L12 3Z" />
    </Icono>
  )
}

export function IconoCampana(props) {
  return (
    <Icono {...props}>
      <path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </Icono>
  )
}

export function IconoSobre(props) {
  return (
    <Icono {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </Icono>
  )
}

export function IconoTelefono(props) {
  return (
    <Icono {...props}>
      <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2C10.5 20 4 13.5 4 6a2 2 0 0 1 1-2Z" />
    </Icono>
  )
}

export function IconoUbicacion(props) {
  return (
    <Icono {...props}>
      <path d="M12 21s7-6.5 7-11.5a7 7 0 1 0-14 0C5 14.5 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </Icono>
  )
}

export function IconoNota(props) {
  return (
    <Icono {...props}>
      <path d="M6 3h9l5 5v13H6z" />
      <path d="M15 3v5h5M9 12h6M9 16h6" />
    </Icono>
  )
}

export function IconoCopiar(props) {
  return (
    <Icono {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </Icono>
  )
}

export function IconoX(props) {
  return (
    <Icono {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Icono>
  )
}
