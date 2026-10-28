import type { CSSProperties, ReactNode } from 'react'

export type KeyCode = string

export type KeyboardFormFactor = '60%' | 'tkl' | 'full'

export type KeyboardStandard = 'ansi' | 'iso'

export type KeyboardPlatform = 'win' | 'mac' | 'auto'

export type KeyboardTheme = 'light' | 'dark'

export type KeyShape = 'rect' | 'iso-enter'

export interface IKeyLegend {
  primary: string
  shift?: string
}

export type LegendMap = Record<KeyCode, IKeyLegend>

export type KeyboardLocale = 'en' | 'ru' | LegendMap

export interface IKeyAnnotation {
  badge?: string
  tooltip?: string
  zone?: string
  color?: string
  disabled?: boolean
}

export interface IKeyZoneStyle {
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  className?: string
}

export interface IKeyRenderContext {
  code: KeyCode
  legend: IKeyLegend
  isActive: boolean
  annotation?: IKeyAnnotation
}

export interface ICompactKeyConfig {
  code: KeyCode
  w?: number
  h?: number
  shape?: KeyShape
  hang?: boolean
  legend?: string
  shift?: string
}

export interface IKeyStackConfig {
  stack: [KeyCode | ICompactKeyConfig, KeyCode | ICompactKeyConfig]
  w?: number
}

export interface ISpacerConfig {
  spacer: number
}

export type CompactLayoutItem = string | number | ICompactKeyConfig | IKeyStackConfig | ISpacerConfig

export interface IKeyboardSectionConfig {
  id: string
  gapLeft?: number
  rows: CompactLayoutItem[][]
}

export interface IKeyboardConfig {
  name?: string
  standard?: KeyboardStandard
  sections: IKeyboardSectionConfig[]
  legends?: Record<KeyCode, IKeyLegend | string>
}

export interface IKeyboardMapProps {
  formFactor?: KeyboardFormFactor
  standard?: KeyboardStandard
  platform?: KeyboardPlatform
  locale?: KeyboardLocale
  secondaryLocale?: KeyboardLocale
  config?: IKeyboardConfig
  listenKeyboard?: boolean
  activeKeys?: readonly KeyCode[]
  annotations?: Record<KeyCode, IKeyAnnotation>
  zones?: Record<string, IKeyZoneStyle>
  renderKeyContent?: (context: IKeyRenderContext) => ReactNode
  theme?: KeyboardTheme
  className?: string
  style?: CSSProperties
}
