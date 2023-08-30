import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

interface GuildData {
  id: string
  logChannelId?: string
}

interface GuildDataPatch {
  logChannelId?: string
}

interface Data {
  guilds: Record<string, GuildData | undefined>
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = dirname(fileURLToPath(import.meta.url))
const file = join(__dirname, '../../', `db-${process.env.NODE_ENV?.startsWith('prod') ? 'prod' : 'dev'}.json`)

console.log('Writing DB file to ' + file);

const adapter = new JSONFile<Data>(file)
const defaultData: Data = { guilds: {} }
const db = new Low<Data>(adapter, defaultData)

export async function initDb(): Promise<void> {
  await db.read()
  await db.write()
}

export function getGuildData(guildId: string): GuildData {
  return {
    id: guildId,
    logChannelId: undefined,
    ...db.data.guilds[guildId]
  }
}

export async function patchGuildData(guildId: string, data?: GuildDataPatch) {
  db.data.guilds[guildId] = {
    id: guildId,
    ...db.data.guilds[guildId],
    ...data
  }

  await db.write()
}

export default db
