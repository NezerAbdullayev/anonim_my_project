import { motion } from 'framer-motion'

/** Title whose letters fly in one by one; with `bounce` they keep hopping in a wave. */
export default function AnimatedTitle({ text, className = '', bounce = false, delay = 0 }) {
  let n = 0
  const words = text.split(' ')
  return (
    <h1 className={className} aria-label={text}>
      {words.map((word, wi) => (
        <span key={wi} aria-hidden="true">
          <span className="inline-block whitespace-nowrap">
            {Array.from(word).map((ch, ci) => {
              const i = n++
              return (
                <motion.span
                  key={ci}
                  className="inline-block"
                  initial={{ opacity: 0, y: 40, rotate: -10 }}
                  animate={bounce ? { opacity: 1, y: [0, -18, 0], rotate: 0 } : { opacity: 1, y: 0, rotate: 0 }}
                  transition={
                    bounce
                      ? {
                          opacity: { delay: delay + i * 0.04 },
                          rotate: { delay: delay + i * 0.04 },
                          y: { delay: delay + i * 0.07, duration: 0.7, repeat: Infinity, repeatDelay: 2.2 },
                        }
                      : { delay: delay + i * 0.04, type: 'spring', stiffness: 180, damping: 12 }
                  }
                >
                  {ch}
                </motion.span>
              )
            })}
          </span>
          {wi < words.length - 1 && ' '}
        </span>
      ))}
    </h1>
  )
}
