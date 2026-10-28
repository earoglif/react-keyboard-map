import { useSyncExternalStore } from 'react'
import type { ResolvedPlatform } from '../locales/modifiers.ts'
import type { KeyboardPlatform } from '../types/keyboard.types.ts'

function detectPlatform(): ResolvedPlatform {
  if (typeof navigator === 'undefined') return 'win'
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform) ? 'mac' : 'win'
}

function subscribeToPlatform() {
  return () => {}
}

function getServerPlatform(): ResolvedPlatform {
  return 'win'
}

export function useResolvedPlatform(platform: KeyboardPlatform): ResolvedPlatform {
  const detected = useSyncExternalStore(subscribeToPlatform, detectPlatform, getServerPlatform)
  if (platform === 'win' || platform === 'mac') return platform
  return detected
}
