// Connect to Discord
import { Client, IntentsBitField, OAuth2Scopes, WebhookClient, AuditLogEvent, Interaction, PermissionsBitField } from 'discord.js'

import logger from './logger.js'
import GuildWatcher from './GuildWatcher.js'
import { initDb } from './db.js'
import commands from './commands.js'

const webhookClient = new WebhookClient({ url: process.env.LOGS_WEBHOOK as string })

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.GuildModeration,
  ]
})

// client
//   .on('error', console.log)
//   .on('debug', console.log)
//   .on('warn', console.log)

const guildWatchers: Record<string, GuildWatcher> = {}

client.on('guildCreate', async guild => {
  if (guildWatchers[guild.id] === undefined) {
    guildWatchers[guild.id] = await new GuildWatcher(guild).init()
  }
  const logs = await guild.fetchAuditLogs().catch(() => null)
  const inviter = logs?.entries
    .find(l => l.action === AuditLogEvent.BotAdd &&
      l.targetId === client.user?.id)?.executor

  void webhookClient.send({
    content: `Joined guild:
\`\`\`
name: ${guild.name} (${guild.id})
inviter: ${inviter != null ? ` invited by ${inviter.tag} (${inviter.id})` : ' (unknown inviter)'}
member count: ${guild.memberCount}
\`\`\``
  })
})

client.on('guildDelete', async guild => {
  guildWatchers[guild.id].destroy()
  delete guildWatchers[guild.id]

  void webhookClient.send({
    content: `Left guild ${guild.name} (${guild.id})`
  })
})

client.on('ready', async () => {
  logger.info(`Logged in as ${client.user?.tag ?? 'unknown'}`)
  console.log(`Logged in as ${client.user?.tag ?? 'unknown'}`)

  void webhookClient.send({
    content: `Logged in as ${client.user?.tag ?? 'unknown'}`
  })

  await initDb()
  await client.guilds.fetch()

  console.log('Bot is ready!')
  console.log(client.generateInvite({
    scopes: [
      OAuth2Scopes.Bot
    ],
    permissions: [
      'SendMessages',
      'UseApplicationCommands',
      'ViewAuditLog'
    ]
  }))

  await Promise.all(
    client.guilds.cache.map(async guild => {
      guildWatchers[guild.id] = await new GuildWatcher(guild).init()
    })
  )

  client.on('voiceStateUpdate', (oldState, newState) => {
    Object.values(guildWatchers).forEach(guild => void guild.handleGuildUpdate('voiceStateUpdate'))
  })

  client.on('channelCreate', channel => {
    Object.values(guildWatchers).forEach(guild => void guild.handleGuildUpdate('channelCreate'))
  })

  client.on('channelUpdate', (oldChannel, newChannel) => {
    Object.values(guildWatchers).forEach(guild => void guild.handleGuildUpdate('channelUpdate'))
  })

  client.on('channelDelete', channel => {
    if (!channel.isDMBased()) {
      Object.values(guildWatchers).forEach(guild => void guild.handleGuildUpdate('channelDelete'))
      Object.values(guildWatchers).forEach(guild => guild.handleChannelDeleted(channel))
    }
  })

  client.application?.commands.set([
    commands['set-log-channel']
  ])

})

client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'set-log-channel' || !interaction.guild || !interaction.member) {
    return
  }
  const member = await interaction.guild.members.fetch(interaction.member.user.id)
  if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return
  }

  guildWatchers[interaction.guild.id].setLogChannel(interaction.options.getChannel('channel', true), interaction)
})

void client.login(process.env.DISCORD_TOKEN)
