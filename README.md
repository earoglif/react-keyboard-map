# react-keyboard-map

A customizable React component for visualizing keyboard layouts, physical key presses, hotkeys, and color-coded key zones.

## Features

- **Form Factors**: `full` (100%), `tkl` (80%), and `60%`
- **Physical Standards**: `ansi` and `iso` (including shaped ISO Enter and split Left Shift)
- **Platform Modifiers**: `win`, `mac`, or `auto` (`Ctrl / Win / Alt` vs `⌃ / ⌥ / ⌘`)
- **Locales**: Built-in `en` and `ru` legends, dual-locale display (`secondaryLocale`), or custom legend maps
- **Physical Key Matching**: Uses `KeyboardEvent.code` (`KeyQ`, `ShiftLeft`, `Space`) so key states work regardless of the active OS input language
- **Hybrid Control**: Automatic physical keyboard listener (`listenKeyboard`) and/or controlled `activeKeys` prop
- **Rich Annotations**: Key badges, hover tooltips, named color zones, per-key colors, and custom key rendering
- **Zero-Runtime Styling**: Scoped CSS with CSS custom properties (`--rkm-*`) and built-in `light` / `dark` themes
- **React Compatibility**: Supports React 18 and React 19

## Installation

```bash
npm install react-keyboard-map
```

## Quick Start

Import the component and its stylesheet:

```tsx
import { KeyboardMap } from 'react-keyboard-map'
import 'react-keyboard-map/style.css'

export function App() {
  return (
    <KeyboardMap
      formFactor="tkl"
      standard="ansi"
      locale="en"
      secondaryLocale="ru"
      platform="auto"
      theme="light"
      listenKeyboard
    />
  )
}
```

## Highlighting Hotkeys & Color Zones

Use `activeKeys`, `zones`, and `annotations` to display keybindings or group keys by function:

```tsx
import { KeyboardMap } from 'react-keyboard-map'
import 'react-keyboard-map/style.css'

export function KeybindingsHelp() {
  return (
    <KeyboardMap
      formFactor="tkl"
      activeKeys={['KeyW', 'KeyA', 'KeyS', 'KeyD']}
      zones={{
        movement: {
          backgroundColor: '#dbeafe',
          borderColor: '#60a5fa',
          textColor: '#1e3a8a',
        },
        ability: {
          backgroundColor: '#fef3c7',
          borderColor: '#f59e0b',
          textColor: '#78350f',
        },
      }}
      annotations={{
        KeyW: { badge: '↑', zone: 'movement', tooltip: 'Move forward' },
        KeyA: { badge: '←', zone: 'movement', tooltip: 'Strafe left' },
        KeyS: { badge: '↓', zone: 'movement', tooltip: 'Move backward' },
        KeyD: { badge: '→', zone: 'movement', tooltip: 'Strafe right' },
        ShiftLeft: { badge: 'Sprint', zone: 'ability', tooltip: 'Hold to run' },
        Space: { badge: 'Jump', tooltip: 'Jump' },
      }}
    />
  )
}
```

## Custom Key Content

Use `renderKeyContent` when you need full control over the inner markup of each keycap:

```tsx
<KeyboardMap
  formFactor="60%"
  activeKeys={['KeyF', 'KeyJ']}
  renderKeyContent={({ code, legend, isActive }) => (
    <span>
      {code === 'KeyF' || code === 'KeyJ' ? (isActive ? '●' : '○') : legend.primary}
    </span>
  )}
/>
```

## Props (`IKeyboardMapProps`)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `formFactor` | `'60%' \| 'tkl' \| 'full'` | `'full'` | Physical keyboard size |
| `standard` | `'ansi' \| 'iso'` | `'ansi'` | Physical layout standard |
| `platform` | `'win' \| 'mac' \| 'auto'` | `'auto'` | Modifier legends (`Win`/`Alt` vs `⌘`/`⌥`) |
| `locale` | `'en' \| 'ru' \| LegendMap` | `'en'` | Primary keycap legends |
| `secondaryLocale` | `'en' \| 'ru' \| LegendMap` | `undefined` | Secondary legends rendered in the top-right corner |
| `listenKeyboard` | `boolean` | `false` | Listen to physical `keydown` / `keyup` events on `window` |
| `activeKeys` | `readonly KeyCode[]` | `undefined` | Externally controlled list of active `KeyboardEvent.code` values |
| `annotations` | `Record<KeyCode, IKeyAnnotation>` | `undefined` | Per-key badges, tooltips, zone assignments, or colors |
| `zones` | `Record<string, IKeyZoneStyle>` | `undefined` | Visual styles for named zones referenced by `annotations` |
| `renderKeyContent` | `(context: IKeyRenderContext) => ReactNode` | `undefined` | Custom renderer for keycap content |
| `theme` | `'light' \| 'dark'` | `'light'` | Built-in color theme |
| `className` | `string` | `undefined` | Additional CSS class for the root element |
| `style` | `CSSProperties` | `undefined` | Inline styles (and CSS variables) for the root element |

## Styling & CSS Variables

You can scale the keyboard or customize colors by overriding CSS custom properties on the component via `style` or `className`:

```css
.custom-keyboard {
  --rkm-unit: 44px;
  --rkm-gap: 5px;
  --rkm-radius: 7px;
  --rkm-key-bg: #f7f6f3;
  --rkm-key-bg-active: #2563eb;
  --rkm-key-text: #1c1917;
  --rkm-key-text-active: #ffffff;
  --rkm-key-border: #e7e5e4;
  --rkm-key-shadow: #d6d3d1;
  --rkm-legend-muted: #78716c;
  --rkm-badge-bg: rgba(28, 25, 23, 0.08);
  --rkm-tooltip-bg: #1c1917;
  --rkm-tooltip-text: #fafaf9;
  --rkm-font: system-ui, 'Segoe UI', sans-serif;
}
```

## MCP Server

The package ships a [Model Context Protocol](https://modelcontextprotocol.io) server (`react-keyboard-map-mcp`, stdio transport) that helps AI assistants build a keyboard layout config (`IKeyboardConfig` JSON) from a model name or a keyboard photo.

### Setup

Build the project, then register the server in your MCP client (for example `.cursor/mcp.json`):

```bash
npm run build
```

```json
{
  "mcpServers": {
    "react-keyboard-map": {
      "command": "node",
      "args": ["/absolute/path/to/react-keyboard-map/dist/mcp/cli.js"]
    }
  }
}
```

### Tools

| Tool | Description |
| --- | --- |
| `get_base_preset` | Returns a built-in layout (`60%`, `65%`, `75%`, `tkl`, `96%`, `full`, `laptop`) in `ansi` or `iso` |
| `search_keyboard_model` | Finds a keyboard by model name or QMK id (for example `keychron/q1`) and converts its QMK layout |
| `validate_and_preview_layout` | Checks row widths, hanging keys, and key codes; returns errors, warnings, and an ASCII preview |
| `list_supported_keycodes` | Lists the `KeyboardEvent.code` and virtual key codes accepted in layouts |

### Prompts

| Prompt | Description |
| --- | --- |
| `configure-keyboard` | Step-by-step instructions for turning a keyboard photo or model name into a validated JSON config (optional `model` argument) |

## Development

```bash
# Start the local Vite playground
npm run dev

# Start Storybook on http://localhost:6006
npm run storybook

# Build the library bundle and TypeScript declarations into dist/
npm run build
```
