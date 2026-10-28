export interface IKeyCodeGroup {
  id: string
  codes: readonly string[]
}

const ALPHAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => `Key${letter}`)
const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((digit) => `Digit${digit}`)
const NUMPAD_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => `Numpad${digit}`)
const FUNCTION_KEYS = Array.from({ length: 24 }, (_, index) => `F${index + 1}`)
const MACROS = Array.from({ length: 12 }, (_, index) => `Macro${index + 1}`)

export const KEY_CODE_GROUPS: readonly IKeyCodeGroup[] = [
  { id: 'alphas', codes: ALPHAS },
  { id: 'digits', codes: DIGITS },
  {
    id: 'punctuation',
    codes: [
      'Backquote',
      'Minus',
      'Equal',
      'BracketLeft',
      'BracketRight',
      'Backslash',
      'Semicolon',
      'Quote',
      'Comma',
      'Period',
      'Slash',
      'IntlBackslash',
      'IntlRo',
      'IntlYen',
    ],
  },
  {
    id: 'modifiers',
    codes: [
      'Escape',
      'Tab',
      'CapsLock',
      'ShiftLeft',
      'ShiftRight',
      'ControlLeft',
      'ControlRight',
      'AltLeft',
      'AltRight',
      'MetaLeft',
      'MetaRight',
      'ContextMenu',
      'Enter',
      'Backspace',
      'Space',
    ],
  },
  { id: 'function', codes: FUNCTION_KEYS },
  {
    id: 'navigation',
    codes: [
      'PrintScreen',
      'ScrollLock',
      'Pause',
      'Insert',
      'Home',
      'PageUp',
      'Delete',
      'End',
      'PageDown',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
    ],
  },
  {
    id: 'numpad',
    codes: [
      'NumLock',
      'NumpadDivide',
      'NumpadMultiply',
      'NumpadSubtract',
      'NumpadAdd',
      'NumpadEnter',
      'NumpadDecimal',
      'NumpadEqual',
      'NumpadComma',
      ...NUMPAD_DIGITS,
    ],
  },
  {
    id: 'virtual',
    codes: [
      'Fn',
      'FnLock',
      'Eject',
      'Power',
      'Sleep',
      'MediaPlayPause',
      'MediaStop',
      'MediaTrackNext',
      'MediaTrackPrevious',
      'AudioVolumeMute',
      'AudioVolumeDown',
      'AudioVolumeUp',
      'BrightnessDown',
      'BrightnessUp',
      ...MACROS,
    ],
  },
]

export const KNOWN_KEY_CODES: ReadonlySet<string> = new Set(KEY_CODE_GROUPS.flatMap((group) => group.codes))

const LOWER_TO_CANONICAL = new Map(
  [...KNOWN_KEY_CODES].map((code) => [code.toLowerCase(), code]),
)

function aliasKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function createAliases(): Map<string, string> {
  const aliases = new Map<string, string>()
  const add = (code: string, names: readonly string[]) => {
    for (const name of names) aliases.set(aliasKey(name), code)
  }

  add('ControlLeft', ['LeftCtrl', 'LCtrl', 'LControl', 'Ctrl', 'Control'])
  add('ControlRight', ['RightCtrl', 'RCtrl', 'RControl'])
  add('ShiftLeft', ['LeftShift', 'LShift', 'Shift'])
  add('ShiftRight', ['RightShift', 'RShift'])
  add('AltLeft', ['LeftAlt', 'LAlt', 'Alt', 'Option', 'Opt', 'OptionLeft'])
  add('AltRight', ['RightAlt', 'RAlt', 'AltGr', 'OptionRight'])
  add('MetaLeft', ['LeftWin', 'WinLeft', 'LWin', 'Win', 'Cmd', 'Command', 'Meta', 'Super', 'OS', 'GUI'])
  add('MetaRight', ['RightWin', 'WinRight', 'RWin', 'RightCmd', 'RCmd'])
  add('Escape', ['Esc'])
  add('Backspace', ['Bksp', 'BackSpace'])
  add('Delete', ['Del'])
  add('Insert', ['Ins'])
  add('PageUp', ['PgUp'])
  add('PageDown', ['PgDn', 'PgDown'])
  add('PrintScreen', ['PrtSc', 'Print', 'PrtScr'])
  add('ScrollLock', ['ScrLk', 'Scroll'])
  add('ContextMenu', ['Menu', 'Apps', 'App'])
  add('Space', ['Spacebar'])
  add('CapsLock', ['Caps'])
  add('Enter', ['Return'])
  add('Backquote', ['Backtick', 'Grave', 'Tilde'])
  add('Minus', ['Hyphen', 'Dash'])
  add('Equal', ['Equals', 'Plus'])
  add('BracketLeft', ['LeftBracket', 'LBracket'])
  add('BracketRight', ['RightBracket', 'RBracket'])
  add('Backslash', ['BackSlash'])
  add('Semicolon', ['Semi'])
  add('Quote', ['Apostrophe', 'SingleQuote'])
  add('Comma', ['Less'])
  add('Period', ['Dot', 'Greater'])
  add('Slash', ['Question', 'ForwardSlash'])
  add('Fn', ['FnKey', 'Function'])
  add('FnLock', ['FnLk'])
  add('ArrowUp', ['Up'])
  add('ArrowDown', ['Down'])
  add('ArrowLeft', ['Left'])
  add('ArrowRight', ['Right'])
  add('AudioVolumeUp', ['VolumeUp', 'VolUp'])
  add('AudioVolumeDown', ['VolumeDown', 'VolDown'])
  add('AudioVolumeMute', ['Mute', 'VolumeMute'])
  add('MediaPlayPause', ['Play', 'PlayPause'])
  add('MediaStop', ['Stop'])
  add('MediaTrackNext', ['NextTrack', 'TrackNext'])
  add('MediaTrackPrevious', ['PrevTrack', 'TrackPrevious'])
  add('BrightnessDown', ['BrightDown'])
  add('BrightnessUp', ['BrightUp'])
  add('NumLock', ['Num'])
  add('NumpadAdd', ['NumpadPlus'])
  add('NumpadSubtract', ['NumpadMinus'])
  add('NumpadMultiply', ['NumpadStar'])
  add('NumpadDivide', ['NumpadSlash'])
  add('NumpadDecimal', ['NumpadDot'])
  add('NumpadEnter', ['NumpadReturn'])

  for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') add(`Key${letter}`, [letter])
  for (const digit of '1234567890') {
    add(`Digit${digit}`, [digit])
    add(`Numpad${digit}`, [`Num${digit}`, `Numpad ${digit}`])
  }
  for (let index = 1; index <= 24; index += 1) add(`F${index}`, [`Function${index}`])
  for (let index = 1; index <= 12; index += 1) add(`Macro${index}`, [`M${index}`])

  return aliases
}

const ALIASES = createAliases()

function levenshtein(left: string, right: string): number {
  if (left === right) return 0
  if (!left.length) return right.length
  if (!right.length) return left.length

  const previous = Array.from({ length: right.length + 1 }, (_, index) => index)
  const current = new Array<number>(right.length + 1)

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    current[0] = leftIndex
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const cost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + cost,
      )
    }
    for (let index = 0; index < previous.length; index += 1) previous[index] = current[index]
  }

  return previous[right.length]
}

export function suggestKeyCode(code: string): string | undefined {
  if (KNOWN_KEY_CODES.has(code)) return undefined

  const byCase = LOWER_TO_CANONICAL.get(code.toLowerCase())
  if (byCase) return byCase

  const alias = ALIASES.get(aliasKey(code))
  if (alias) return alias

  let best: string | undefined
  let bestDistance = 4
  const needle = code.toLowerCase()
  for (const candidate of KNOWN_KEY_CODES) {
    if (Math.abs(candidate.length - code.length) > bestDistance) continue
    const distance = levenshtein(needle, candidate.toLowerCase())
    if (distance < bestDistance) {
      best = candidate
      bestDistance = distance
    }
  }
  return best
}
