import type { CSSProperties, ReactNode } from 'react'

export type KeyCode = string

export type KeyboardFormFactor = '60%' | 'tkl' | 'full'

export type KeyboardStandard = 'ansi' | 'iso'

export type KeyboardPlatform = 'win' | 'mac' | 'auto'

export type KeyboardTheme = 'light' | 'dark'

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

export interface IKeyboardMapProps {
  formFactor?: KeyboardFormFactor
  standard?: KeyboardStandard
  platform?: KeyboardPlatform
  locale?: KeyboardLocale
  secondaryLocale?: KeyboardLocale
  listenKeyboard?: boolean
  activeKeys?: readonly KeyCode[]
  annotations?: Record<KeyCode, IKeyAnnotation>
  zones?: Record<string, IKeyZoneStyle>
  renderKeyContent?: (context: IKeyRenderContext) => ReactNode
  theme?: KeyboardTheme
  className?: string
  style?: CSSProperties
}
