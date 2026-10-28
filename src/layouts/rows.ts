import type { IKeyboardSection, ILayoutKey, LayoutItem } from './geometry.ts'
import { hangKey, key, keys, spacer } from './geometry.ts'

const DIGITS: readonly string[] = [
  'Digit1',
  'Digit2',
  'Digit3',
  'Digit4',
  'Digit5',
  'Digit6',
  'Digit7',
  'Digit8',
  'Digit9',
  'Digit0',
]

export function functionRow(): LayoutItem[] {
  return [
    key('Escape'),
    spacer(1),
    ...keys(['F1', 'F2', 'F3', 'F4']),
    spacer(0.5),
    ...keys(['F5', 'F6', 'F7', 'F8']),
    spacer(0.5),
    ...keys(['F9', 'F10', 'F11', 'F12']),
  ]
}

export function numberRow(compact: boolean): LayoutItem[] {
  return [
    compact ? key('Escape') : key('Backquote'),
    ...keys(DIGITS),
    key('Minus'),
    key('Equal'),
    key('Backspace', 2),
  ]
}

export function letterKeys(codes: string): ILayoutKey[] {
  return codes.split('').map((letter) => key(`Key${letter}`))
}

export function spaceRow(compact: boolean): LayoutItem[] {
  if (compact) {
    return [
      key('ControlLeft', 1.5),
      key('MetaLeft', 1.5),
      key('AltLeft', 1.5),
      key('Space', 6),
      key('AltRight', 1.5),
      key('MetaRight', 1.5),
      key('ControlRight', 1.5),
    ]
  }

  return [
    key('ControlLeft', 1.25),
    key('MetaLeft', 1.25),
    key('AltLeft', 1.25),
    key('Space', 6.25),
    key('AltRight', 1.25),
    key('MetaRight', 1.25),
    key('ContextMenu', 1.25),
    key('ControlRight', 1.25),
  ]
}

export function navSection(): IKeyboardSection {
  return {
    id: 'nav',
    rows: [
      [key('PrintScreen'), key('ScrollLock'), key('Pause')],
      [key('Insert'), key('Home'), key('PageUp')],
      [key('Delete'), key('End'), key('PageDown')],
      [],
      [spacer(1), key('ArrowUp'), spacer(1)],
      [key('ArrowLeft'), key('ArrowDown'), key('ArrowRight')],
    ],
  }
}

export function numpadSection(): IKeyboardSection {
  return {
    id: 'numpad',
    rows: [
      [],
      [key('NumLock'), key('NumpadDivide'), key('NumpadMultiply'), key('NumpadSubtract')],
      keys(['Numpad7', 'Numpad8', 'Numpad9']),
      [...keys(['Numpad4', 'Numpad5', 'Numpad6']), hangKey('NumpadAdd')],
      keys(['Numpad1', 'Numpad2', 'Numpad3']),
      [key('Numpad0', 2), key('NumpadDecimal'), hangKey('NumpadEnter')],
    ],
  }
}
