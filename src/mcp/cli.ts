import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createKeyboardMapMcpServer } from './server.ts'

const server = createKeyboardMapMcpServer()
await server.connect(new StdioServerTransport())
