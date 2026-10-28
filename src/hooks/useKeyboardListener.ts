import { useEffect, useState } from 'react'

const MODIFIER_CODES = new Set([
  'ShiftLeft',
  'ShiftRight',
  'ControlLeft',
  'ControlRight',
  'AltLeft',
  'AltRight',
  'MetaLeft',
  'MetaRight',
])

function withoutKey(pressed: ReadonlySet<string>, code: string): ReadonlySet<string> {
  if (!pressed.has(code) && code !== 'MetaLeft' && code !== 'MetaRight') return pressed

  const next = new Set(pressed)
  next.delete(code)

  if (code === 'MetaLeft' || code === 'MetaRight') {
    for (const item of next) {
      if (!MODIFIER_CODES.has(item)) next.delete(item)
    }
  }

  return next
}

const EMPTY_KEYS: ReadonlySet<string> = new Set()

export function useKeyboardListener(enabled: boolean): ReadonlySet<string> {
  const [pressed, setPressed] = useState<ReadonlySet<string>>(EMPTY_KEYS)
  const [listening, setListening] = useState(enabled)

  if (enabled !== listening) {
    setListening(enabled)
    setPressed(EMPTY_KEYS)
  }

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      setPressed((current) => {
        if (current.has(event.code)) return current
        const next = new Set(current)
        next.add(event.code)
        return next
      })
    }

    const onKeyUp = (event: KeyboardEvent) => {
      setPressed((current) => withoutKey(current, event.code))
    }

    const reset = () => {
      setPressed((current) => (current.size === 0 ? current : EMPTY_KEYS))
    }

    const onVisibility = () => {
      if (document.hidden) reset()
    }

    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('keyup', onKeyUp, true)
    window.addEventListener('blur', reset)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('keyup', onKeyUp, true)
      window.removeEventListener('blur', reset)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [enabled])

  return enabled ? pressed : EMPTY_KEYS
}
