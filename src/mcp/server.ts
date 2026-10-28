import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { validateKeyboardConfig } from '../layouts/config.ts'
import { KEY_CODE_GROUPS } from '../layouts/keycodes.ts'
import {
  KEYBOARD_PRESET_IDS,
  KEYBOARD_PRESET_SUMMARIES,
  getKeyboardPreset,
  resolveKeyboardPreset,
} from '../layouts/presets.ts'
import type { KeyboardStandard } from '../types/keyboard.types.ts'
import { searchQmkKeyboards } from './qmk.ts'

const CONFIG_FORMAT = `Compact IKeyboardConfig JSON:
{
  "name": "My keyboard",
  "standard": "ansi",
  "legends": { "Fn": "Fn" },
  "sections": [
    {
      "id": "main",
      "gapLeft": 0.25,
      "rows": [
        ["Escape", 0.5, "F1", "F2"],
        [{ "code": "Tab", "w": 1.5 }, "KeyQ", { "code": "Backspace", "w": 2 }],
        [{ "code": "Enter", "w": 1.5, "shape": "iso-enter", "hang": true }],
        ["ArrowLeft", { "stack": ["ArrowUp", "ArrowDown"] }, "ArrowRight"]
      ]
    }
  ]
}
Rules:
- A string is a 1u x 1u key. Use KeyboardEvent.code names such as KeyQ, Digit1, ShiftLeft, ControlLeft, MetaLeft, AltLeft, ArrowUp, Fn, Macro1.
- A number is an empty spacer in key units, for example 0.5 or 1.
- Set w, h, shape, or hang only when the key is not 1u. ISO Enter is { "code": "Enter", "shape": "iso-enter", "hang": true }.
- stack holds two half-height keys in one row slot.
- Every non-empty row in a section must sum to the same width. Hanging keys cover the row above.
- Do not invent key codes. Call list_supported_keycodes.
- The user-facing result is the JSON object itself. Do not wrap it in TypeScript, TSX, a React component, or a Storybook story.`

function textResult(text: string, isError = false) {
  return {
    content: [{ type: 'text' as const, text }],
    ...(isError ? { isError: true } : {}),
  }
}

function jsonText(value: unknown): string {
  return JSON.stringify(value, null, 2)
}

export function createKeyboardMapMcpServer(): McpServer {
  const server = new McpServer({
    name: 'react-keyboard-map',
    version: '0.1.0',
  })

  server.registerTool(
    'get_base_preset',
    {
      title: 'Get a base keyboard preset',
      description:
        'Return a built-in layout as JSON. Use the config property as the IKeyboardConfig. Presets: 60%, 65%, 75%, tkl, 96%, full, laptop, each in ansi or iso (96% is ansi only). Give the user that JSON object. Do not wrap it in a React component or TypeScript.',
      inputSchema: {
        formFactor: z.string().describe('60%, 65%, 75%, tkl, 96%, full, or laptop'),
        standard: z.enum(['ansi', 'iso']).optional().describe('Physical standard. Defaults to ansi.'),
      },
    },
    async ({ formFactor, standard }) => {
      const resolved = (standard ?? 'ansi') as KeyboardStandard
      const preset = resolveKeyboardPreset(formFactor, resolved) ?? getKeyboardPreset(`${formFactor}-${resolved}`)
      if (!preset) {
        return textResult(
          `No preset for "${formFactor}" / ${resolved}. Available ids: ${KEYBOARD_PRESET_IDS.join(', ')}.`,
          true,
        )
      }
      const summary = KEYBOARD_PRESET_SUMMARIES[preset.name as keyof typeof KEYBOARD_PRESET_SUMMARIES]
      const preview = validateKeyboardConfig(preset).preview
      return textResult(
        jsonText({
          summary: summary ?? `Preset ${preset.name ?? formFactor}.`,
          preview,
          config: preset,
        }),
      )
    },
  )

  server.registerTool(
    'search_keyboard_model',
    {
      title: 'Search a keyboard model',
      description:
        'Find a keyboard by model name or QMK id and return JSON. Use the config property as the IKeyboardConfig to show the user. A local preset is returned when the query is a form factor, otherwise the closest QMK info.json layout is converted. Ask for a more specific id when several models match. Do not wrap config in a React component or TypeScript.',
      inputSchema: {
        query: z.string().describe('Model name, article, or QMK keyboard id such as keychron/q1'),
        standard: z.enum(['ansi', 'iso']).optional(),
      },
    },
    async ({ query, standard }) => {
      const generic = /^(60%?|65%?|75%?|80%?|96%?|100%?|tkl|tenkeyless|full|laptop|1800)([-\s](ansi|iso))?$/i.test(
        query.trim(),
      )
      const resolved = (standard ?? (generic ? 'ansi' : undefined)) as KeyboardStandard | undefined
      const preset =
        getKeyboardPreset(query.trim()) ?? (resolved ? resolveKeyboardPreset(query, resolved) : undefined)
      if (preset && (generic || getKeyboardPreset(query.trim()))) {
        const validation = validateKeyboardConfig(preset)
        return textResult(
          jsonText({
            source: 'preset',
            config: preset,
            preview: validation.preview,
            warnings: validation.warnings.map((warning) => warning.message),
          }),
        )
      }

      const found = await searchQmkKeyboards(query, resolved)
      if (found.error) {
        return textResult(
          jsonText({
            source: 'qmk',
            error: found.error,
            matches: found.matches,
            fallbackPresets: KEYBOARD_PRESET_IDS,
          }),
          true,
        )
      }
      return textResult(
        jsonText({
          source: 'qmk',
          layoutName: found.layoutName,
          matches: found.matches,
          warnings: found.warnings,
          preview: found.preview,
          config: found.config,
        }),
      )
    },
  )

  server.registerTool(
    'validate_and_preview_layout',
    {
      title: 'Validate and preview a layout',
      description:
        'Check row widths, hanging keys, and key codes for an IKeyboardConfig. Returns errors, warnings, and an ASCII grid. Fix the config and call again until valid is true and warnings are empty.',
      inputSchema: {
        config: z.unknown().describe('IKeyboardConfig object in the compact row format'),
      },
    },
    async ({ config }) => {
      const result = validateKeyboardConfig(config)
      return textResult(
        jsonText({
          valid: result.valid,
          errors: result.errors,
          warnings: result.warnings,
          preview: result.preview,
        }),
        !result.valid,
      )
    },
  )

  server.registerTool(
    'list_supported_keycodes',
    {
      title: 'List supported key codes',
      description: 'List KeyboardEvent.code and virtual key codes accepted by react-keyboard-map. Use these exact strings in layout configs.',
      inputSchema: {},
    },
    async () => textResult(jsonText({ groups: KEY_CODE_GROUPS })),
  )

  server.registerPrompt(
    'configure-keyboard',
    {
      title: 'Configure a keyboard',
      description: 'Instructions for turning a keyboard photo or model name into a react-keyboard-map JSON config.',
      argsSchema: {
        model: z.string().optional().describe('Keyboard model or article number, if the user provided one'),
      },
    },
    ({ model }) => ({
      description: 'Build a keyboard config that matches the user hardware',
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: [
              'Create a react-keyboard-map IKeyboardConfig for the keyboard in the conversation.',
              model ? `Model or article: ${model}.` : 'No model was provided. Use the photo or description.',
              'Steps:',
              '1. If a model or article is known, call search_keyboard_model. If it returns several ids, ask which one or pick the closest and say so.',
              '2. If the input is a photo, identify the form factor (60%, 65%, 75%, tkl, 96%, full, laptop) and ANSI or ISO, then call get_base_preset. Edit only the differences you can see: bottom modifier widths, right column, split Backspace, Fn, and arrow stack.',
              '3. Call list_supported_keycodes instead of inventing codes. Fn, media keys, and Macro1..Macro12 are virtual codes.',
              '4. Call validate_and_preview_layout. If valid is false or key-code warnings remain, fix the JSON and validate again.',
              '5. Reply with the config JSON object, then the ASCII preview. Do not return a React component, a Storybook story, or TypeScript.',
              CONFIG_FORMAT,
            ].join('\n'),
          },
        },
      ],
    }),
  )

  return server
}
