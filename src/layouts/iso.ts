import type { LayoutItem } from './geometry.ts'
import { hangKey, key } from './geometry.ts'
import { letterKeys, numberRow, spaceRow } from './rows.ts'

export function isoAlphaRows(compact: boolean): LayoutItem[][] {
  return [
    numberRow(compact),
    [
      key('Tab', 1.5),
      ...letterKeys('QWERTYUIOP'),
      key('BracketLeft'),
      key('BracketRight'),
    ],
    [
      key('CapsLock', 1.75),
      ...letterKeys('ASDFGHJKL'),
      key('Semicolon'),
      key('Quote'),
      key('Backslash'),
      hangKey('Enter', 1.5, 'iso-enter'),
    ],
    [
      key('ShiftLeft', 1.25),
      key('IntlBackslash'),
      ...letterKeys('ZXCVBNM'),
      key('Comma'),
      key('Period'),
      key('Slash'),
      key('ShiftRight', 2.75),
    ],
    spaceRow(compact),
  ]
}
