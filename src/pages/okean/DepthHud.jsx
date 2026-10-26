import { useState } from 'react'
import { motion, useMotionValueEvent, useTransform } from 'framer-motion'
import { DEPTH, MAX_DEPTH, ZONES, lightAt, pressureAt, temperatureAt, zoneAt } from './dive.js'

const groupDigits = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
const comma = (n, digits) => n.toFixed(digits).replace('.', ',')

const formatDepth = (m) => `${groupDigits(Math.round(m))} m`
const formatPressure = (m) => {
  const atm = pressureAt(m)
  return `${atm < 10 ? comma(atm, 1) : groupDigits(Math.round(atm))} atm`
}
const formatTemperature = (m) => `${comma(temperatureAt(m), 1)} °C`
const formatLight = (m) => {
  const l = lightAt(m)
  if (l >= 1) return `${Math.round(l)}%`
  if (l >= 0.01) return `${comma(l, 2)}%`
  return '0%'
}

/** Depth gauge (top-left) and the zone rail at real scale (right). */
export default function DepthHud({ progress }) {
  const meters = useTransform(progress, DEPTH.points, DEPTH.meters)
  const depth = useTransform(meters, formatDepth)
  const pressure = useTransform(meters, formatPressure)
  const temperature = useTransform(meters, formatTemperature)
  const light = useTransform(meters, formatLight)
  // The dot on the rail: real depth, so the sunlit zone is just a sliver at the top
  const dotTop = useTransform(meters, (m) => `${(m / MAX_DEPTH) * 100}%`)

  const [current, setCurrent] = useState(0)
  useMotionValueEvent(meters, 'change', (m) => setCurrent(zoneAt(m)))

  return (
    <>
      <div className="pointer-events-none absolute left-4 top-4 z-[700] font-mono text-[11px] uppercase tracking-widest rounded-lg bg-slate-950/25 px-3 py-2 short:left-3 short:top-3 short:py-1 text-cyan-100/80 backdrop-blur-sm sm:left-6 sm:top-6 sm:text-xs">
        <p>Dərinlik</p>
        <motion.p className="text-xl font-bold normal-case tracking-normal text-white sm:text-2xl short:text-base">{depth}</motion.p>
        <p className="mt-1 normal-case tracking-normal text-cyan-200 sm:hidden">{ZONES[current].name}</p>
        <dl className="mt-2 short:hidden grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5">
          <dt>Təzyiq</dt>
          <motion.dd className="normal-case tracking-normal text-white">{pressure}</motion.dd>
          <dt>Temperatur</dt>
          <motion.dd className="normal-case tracking-normal text-white">{temperature}</motion.dd>
          <dt>Günəş işığı</dt>
          <motion.dd className="normal-case tracking-normal text-amber-200">{light}</motion.dd>
        </dl>
      </div>

      <div className="pointer-events-none absolute right-6 top-1/2 z-[700] hidden h-[60vh] short:h-[70vh] -translate-y-1/2 items-stretch gap-4 font-mono text-xs sm:flex">
        <ol className="flex flex-col justify-between gap-4 py-1">
          {ZONES.map((z, i) => (
            <li
              key={z.key}
              className={`text-right transition-colors duration-500 ${
                i === current ? 'text-white' : i < current ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {z.name}
              <span className="block text-[10px] text-slate-400">
                {groupDigits(z.range[0])}–{groupDigits(z.range[1])} m
              </span>
            </li>
          ))}
        </ol>

        {/* Real-scale rail: each zone's band is as tall as it is deep */}
        <div className="relative w-1.5 overflow-visible rounded-full bg-slate-700/60">
          {ZONES.map((z, i) => (
            <div
              key={z.key}
              className={`absolute inset-x-0 border-t border-black/60 transition-colors duration-500 ${
                i === current ? 'bg-cyan-300/80' : 'bg-transparent'
              }`}
              style={{
                top: `${(z.range[0] / MAX_DEPTH) * 100}%`,
                height: `${((z.range[1] - z.range[0]) / MAX_DEPTH) * 100}%`,
              }}
            />
          ))}
          <motion.span
            className="absolute left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(165,243,252,0.9)]"
            style={{ top: dotTop }}
          />
        </div>
      </div>
    </>
  )
}
