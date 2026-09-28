const PALETA_AVATAR = [
  'bg-amber-500/15 text-amber-400',
  'bg-sky-500/15 text-sky-400',
  'bg-emerald-500/15 text-emerald-400',
  'bg-violet-500/15 text-violet-400',
  'bg-rose-500/15 text-rose-400',
]

export const inicialesDe = (nombre) =>
  (nombre ?? '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

export const colorAvatar = (nombre) => {
  const hash = [...(nombre ?? '')].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return PALETA_AVATAR[hash % PALETA_AVATAR.length]
}
