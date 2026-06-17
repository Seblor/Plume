// Connect to Discord
import { Client, IntentsBitField, OAuth2Scopes, WebhookClient, AuditLogEvent, Interaction, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType, TextChannel, SlashCommandBuilder, PermissionFlagsBits, Team, User } from 'discord.js'

import commands from './commands.js'
import { getGuildData, initDb } from './db.js'
import GuildWatcher from './GuildWatcher.js'
import logger from './logger.js'

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

  if (inviter != null) {
    void inviter.send(`Thanks for adding me to ${guild.name}!
To get started, use the \`/set-log-channel\` command to set the channel where the logs will be sent.

If you have any issue, don't hesitate to contact the support server: <https://discord.gg/RDP6xg2Tf2>`).catch(() => null)
  }

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
  guildWatchers[guild.id]?.destroy()
  delete guildWatchers[guild.id]

  void webhookClient.send({
    content: `Left guild ${guild.name} (${guild.id})`
  })
})

client.on('clientReady', async () => {
  logger.info(`Logged in as ${client.user?.tag ?? 'unknown'}`)
  console.log(`Logged in as ${client.user?.tag ?? 'unknown'}`)

  void webhookClient.send({
    content: `Logged in as ${client.user?.tag ?? 'unknown'}`
  })

  await initDb()
  await client.application?.fetch()
  await client.guilds.fetch()
  await Promise.all(client.guilds.cache.mapValues(guild => guild.channels.fetch()))

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

  client.on('voiceStateUpdate', (_oldState, _newState) => {
    Object.values(guildWatchers).forEach(guild => void guild.handleGuildUpdate('voiceStateUpdate'))
  })

  client.on('channelCreate', _channel => {
    Object.values(guildWatchers).forEach(guild => void guild.handleGuildUpdate('channelCreate'))
  })

  client.on('channelUpdate', (_oldChannel, _newChannel) => {
    Object.values(guildWatchers).forEach(guild => void guild.handleGuildUpdate('channelUpdate'))
  })

  client.on('channelDelete', channel => {
    if (!channel.isDMBased()) {
      Object.values(guildWatchers).forEach(guild => void guild.handleGuildUpdate('channelDelete'))
      Object.values(guildWatchers).forEach(guild => guild.handleChannelDeleted(channel))
    }
  })

  const webhookData = process.env.LOGS_WEBHOOK?.match(/discord.com\/api\/webhooks\/(?<id>\d+)\/(?<token>[\w-]+)/)
  if (webhookData == null || webhookData.groups == null) {
    console.log("Could not find webhook ID");
    return
  }

  const logsWebhook = await client.fetchWebhook(webhookData.groups.id, webhookData.groups.token)

  await client.application?.commands.set([
    commands['set-log-channel']
  ])

  await client.guilds.cache.get(logsWebhook.guildId)?.commands.set([
    new SlashCommandBuilder()
      .setName('send-perm-alert')
      .setDescription('Send a diagnostic to a guild')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addStringOption(option => option
        .setName('guild-id')
        .setDescription('The ID of the guild to send the diagnostic')
        .setRequired(true)
      )
  ])

})

client.on('interactionCreate', async (interaction: Interaction) => {
  if (interaction.isChatInputCommand() && interaction.commandName === 'set-log-channel' && interaction.guild && interaction.member) {
    const member = await interaction.guild.members.fetch(interaction.member.user.id)
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return
    }

    const channelData = interaction.options.getChannel('channel', true)
    if (!channelData) {
      await interaction.reply({ ephemeral: true, content: 'The channel must be in the same guild as the command' })
      return
    }

    const channel = await interaction.guild.channels.fetch(channelData.id)
    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.reply({ ephemeral: true, content: 'The channel must be a text channel' })
      return
    }

    guildWatchers[interaction.guild.id].setLogChannel(channel, interaction)

  } else if (interaction.isButton() && interaction.customId === 'recreate-link') {
    await interaction.reply({ ephemeral: true, content: 'Recreating link...' })
    const logFileUrl = `${process.env.PREVIEW_PREFIX_URL}${interaction.message.attachments.find(a => a.name.includes('gzip'))?.url}`

    if (logFileUrl === undefined) {
      interaction.editReply({ content: 'No log file found!' })
      return
    }

    const newComponents = [
      new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder().setURL(logFileUrl).setLabel('View logs').setStyle(ButtonStyle.Link),
        new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('Recreate link').setCustomId('recreate-link')
      ])
    ]

    await interaction.message.edit({ components: newComponents }).catch(error => {
      void interaction.editReply({ content: 'Failed to recreate link!' })
      console.error(error)
    })
    interaction.editReply({ content: 'Link recreated!' })
  } else if (interaction.isChatInputCommand() && interaction.commandName === 'send-perm-alert') {
    const userId = interaction.user.id
    const appOwner = client.application?.owner

    const isCommandCalledByOwner =
      appOwner instanceof Team && appOwner.members.some(teamMember => teamMember.id === userId)
      || appOwner instanceof User && appOwner.id === userId
    if (!isCommandCalledByOwner || appOwner == null) {
      await interaction.reply({ ephemeral: true, content: 'You are not allowed to use this command' })
      return
    }

    await interaction.reply({ ephemeral: true, content: 'Sending alert to owner...' })

    const guildId = interaction.options.getString('guild-id')

    if (guildId == null) {
      interaction.editReply({ content: `Could not send alert, error with argument` })
      return
    }

    const guild = client.guilds.cache.get(guildId) ?? await client.guilds.fetch(guildId)

    if (guild == null) {
      interaction.editReply({ content: `Could not send alert, error fetching guild ${guildId}` })
      return
    }

    const guildData = getGuildData(guildId)
    const guildOwnerId = guild.ownerId

    if (guildData.logChannelId == null) {
      interaction.editReply({ content: `Could not send alert, no channel set for guild` })
      return
    }
    const channel = guild.channels.cache.get(guildData.logChannelId) ?? await guild.channels.fetch(guildData.logChannelId)
    if (channel == null) {
      interaction.editReply({ content: `Could not send alert, error fetching channel ${guildData.logChannelId}` })
      return
    }

    const permsInChannel = new PermissionsBitField(channel.permissionsFor(await guild.members.fetchMe()))

    const missingPerms = {
      "View channel": !permsInChannel.has(PermissionsBitField.Flags.ViewChannel),
      "Send messages": !permsInChannel.has(PermissionsBitField.Flags.SendMessages),
      "Embed links": !permsInChannel.has(PermissionsBitField.Flags.EmbedLinks),
      "Attach files": !permsInChannel.has(PermissionsBitField.Flags.AttachFiles),
    }
    if (Object.values(missingPerms).some(v => v)) {
      const embed = new EmbedBuilder()
        .setTitle('Missing Permissions')
        .setDescription(`Some ${Object.values(missingPerms).filter(v => v).length > 1 ? 'permissions are' : 'permission is'} missing for Plume in channel <#${channel.id}> :
  ${Object.entries(missingPerms).map(([key, value]) => {
          return `- ${value ? '❌' : '✅'} ${key}`
        }).join('\n')}`);

      (await client.users.createDM(guildOwnerId)).send({
        embeds: [embed]
      })
      interaction.editReply({ content: `Alert sent to <@${guildOwnerId}> !`, embeds: [embed] })
    } else {
      interaction.editReply({ content: `No permission issues detected for channel ${channel.name} (${guildData.logChannelId})` })
    }

  }
})

void client.login(process.env.DISCORD_TOKEN)
