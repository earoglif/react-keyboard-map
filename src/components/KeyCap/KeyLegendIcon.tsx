import { useMemo } from 'react'
import { DynamicIcon, iconNames, type IconName } from 'lucide-react/dynamic'
import styles from '../../styles/keyboard.module.css'

const knownIconNames = new Set<string>(iconNames)

interface IKeyLegendIconProps {
  name: string
  label: string
}

interface ILegendTextProps {
  label: string
}

function isIconName(name: string): name is IconName {
  return knownIconNames.has(name)
}

function LegendText({ label }: ILegendTextProps) {
  if (!label) return null
  return <span className={styles.primary}>{label}</span>
}

export function KeyLegendIcon({ name, label }: IKeyLegendIconProps) {
  const Fallback = useMemo(
    () =>
      function KeyIconFallback() {
        return <LegendText label={label} />
      },
    [label],
  )

  if (!isIconName(name)) return <LegendText label={label} />

  return <DynamicIcon name={name} size="1em" className={styles.icon} aria-hidden fallback={Fallback} />
}
