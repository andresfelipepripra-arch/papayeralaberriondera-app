// El servidor (Render) corre en UTC, pero los días de un evento deben
// contarse por el "día operativo" en Colombia, no por el huso del proceso
// ni por la medianoche exacta del calendario.
//
// Un evento de madrugada (antes de HORA_CORTE) se considera parte de la
// noche anterior: un grupo que termina un evento a las 11pm y arranca otro
// a la 1am sigue en la misma jornada, aunque el segundo evento quede
// registrado con fecha del día siguiente.
const HORA_CORTE = 5

function partesColombia(fecha) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(fecha))

  const obtener = (tipo) => partes.find((p) => p.type === tipo).value
  return { fechaISO: `${obtener('year')}-${obtener('month')}-${obtener('day')}`, hora: Number(obtener('hour')) }
}

export function fechaColombiaISO(fecha) {
  return partesColombia(fecha).fechaISO
}

// Día calendario en Colombia, desplazado un día hacia atrás si la hora local
// es anterior a HORA_CORTE (madrugada = todavía la noche anterior).
export function diaOperativoColombiaISO(fecha, horaCorte = HORA_CORTE) {
  const { fechaISO, hora } = partesColombia(fecha)
  if (hora >= horaCorte) return fechaISO

  const dia = new Date(`${fechaISO}T00:00:00Z`)
  dia.setUTCDate(dia.getUTCDate() - 1)
  return dia.toISOString().slice(0, 10)
}

export function diasRestantesDesde(fecha, ahora) {
  const msPorDia = 24 * 60 * 60 * 1000
  const diaEvento = new Date(`${diaOperativoColombiaISO(fecha)}T00:00:00Z`).getTime()
  const diaAhora = new Date(`${diaOperativoColombiaISO(ahora)}T00:00:00Z`).getTime()
  return Math.round((diaEvento - diaAhora) / msPorDia)
}

// Instante UTC en el que arrancó el día operativo actual (HORA_CORTE de la
// mañana en Colombia). Sirve como límite inferior de consultas para no
// excluir eventos de esta jornada cuya hora ya "pasó" en el reloj.
export function inicioDelDiaOperativoActualISO() {
  const etiqueta = diaOperativoColombiaISO(new Date())
  const horaCorteUTC = String(HORA_CORTE + 5).padStart(2, '0') // Bogotá es UTC-5, sin horario de verano
  return new Date(`${etiqueta}T${horaCorteUTC}:00:00Z`).toISOString()
}
