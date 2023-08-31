import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ChannelType, ChatInputCommandInteraction, EmbedBuilder, Guild, GuildBasedChannel, GuildTextBasedChannel, Message, NonThreadGuildBasedChannel, PermissionsBitField } from 'discord.js'
import { CategoryChannelStateData, ChannelState, LogData, TimedPatches, VoiceChannelStateData, PlumeChannelType } from 'shared_types'
import { getGuildData, patchGuildData } from './db.js'
import pako from 'pako'
import jsonpatch from 'fast-json-patch';
import _ from 'lodash'

type GuildStateType = ChannelState[]

const plumeLogo = new AttachmentBuilder('./assets/plume_logo.webp').setName('plume_logo.webp')

export default class GuildWatcher {
  guild: Guild
  logChannel: GuildTextBasedChannel | null = null
  logMessage: Message | null = null

  initialState: GuildStateType = []
  previousState: GuildStateType = []
  logStartTime: number = Date.now()
  patches: TimedPatches[] = []

  updateInterval: NodeJS.Timeout | null = null

  constructor(guild: Guild) {
    this.guild = guild
    this.initialState = this.generateGuildState()
    this.previousState = this.initialState

    void this.handleGuildUpdate('interval', true)

    this.updateInterval = setInterval(() => {
      void this.handleGuildUpdate('interval', true)
    }, 10 * 60e3)
  }

  async init(): Promise<this> {
    await this.removeDeprecatedData()
    const guildData = getGuildData(this.guild.id)
    if (guildData.logChannelId != null) {
      this.logChannel = await this.guild.channels.fetch(guildData.logChannelId) as GuildTextBasedChannel
    }
    return this
  }

  destroy() {
    if (this.updateInterval != null) {
      clearInterval(this.updateInterval)
    }
  }

  async rotateLogs(): Promise<this> {
    await this.updateMessage()
    this.initialState = this.generateGuildState()
    this.previousState = this.initialState
    this.patches = []
    this.logStartTime = Date.now()
    this.logMessage = null
    return this
  }

  async removeDeprecatedData(): Promise<this> {
    const guildData = getGuildData(this.guild.id)
    if (guildData == null) {
      await patchGuildData(this.guild.id)
      return this
    }
    // Checking if channel & message still exists
    if (guildData.logChannelId != null) {
      const channel = await this.guild.channels.fetch(guildData.logChannelId).catch(() => null)
      if (channel == null || !channel.isTextBased()) {
        await patchGuildData(this.guild.id, {
          logChannelId: undefined
        })
        this.logChannel = null
        this.logMessage = null
      }
    }


    return this
  }

  async setLogChannel(channel: GuildTextBasedChannel, interaction?: ChatInputCommandInteraction): Promise<this> {
    if (!channel.isTextBased()) {
      if (interaction) {
        await interaction.reply({
          content: 'The channel must be a text channel.',
          ephemeral: true
        })
      }
      return this
    }

    const permsInChannel = channel.permissionsFor(await this.guild.members.fetchMe())

    const missingPerms = {
      "View channel": !permsInChannel.has(PermissionsBitField.Flags.ViewChannel),
      "Send messages": !permsInChannel.has(PermissionsBitField.Flags.SendMessages),
      "Embed links": !permsInChannel.has(PermissionsBitField.Flags.EmbedLinks),
      "Attach files": !permsInChannel.has(PermissionsBitField.Flags.AttachFiles),
    }
    if (interaction) {
      if (Object.values(missingPerms).some(v => v)) {
        await interaction.reply({
          content: `Some ${Object.values(missingPerms).filter(v => v).length > 1 ? 'permissions are' : 'permission is'} missing for Plume in this channel :
          ${Object.entries(missingPerms).map(([key, value]) => {
            return `- ${value ? '❌' : '✅'} ${key}`
          }).join('\n')}`,
          ephemeral: true
        })

        return this
      }

      this.logChannel = channel

      await interaction.reply({
        content: `The log channel has been set to <#${channel.id}>.`,
        ephemeral: true
      })
    }

    this.logMessage = await channel.send('This message will be updated regularly with the channels logs (every 10 minutes **or** after 1 minute with no activity, whichever is sooner).')
    await patchGuildData(this.guild.id, {
      logChannelId: channel.id
    })

    return this
  }

  async handleGuildUpdate(origin: string, force = false): Promise<this> {
    if (this.patches.length > 0 && new Date().getDay() !== new Date(this.patches[0].timestamp).getDay()) {
      await this.rotateLogs()
    }
    const newState = this.generateGuildState()
    const diffPatch = jsonpatch.compare(this.previousState, newState)
    this.previousState = newState

    if (diffPatch.length > 0) {
      this.patches.push({
        timestamp: Date.now(),
        patches: diffPatch
      })

      if (force) {
        void this.updateMessage()
      } else {
        void this.updateMessageDebounced()
      }
    }

    return this
  }

  handleChannelDeleted(channel: NonThreadGuildBasedChannel): this {
    if (channel.id === this.logChannel?.id) {
      this.logChannel = null
      this.logMessage = null
      void patchGuildData(this.guild.id, {
        logChannelId: undefined
      })
    }
    return this
  }

  generateGuildState(): GuildStateType {
    const initialState: GuildStateType = this.guild.channels.cache
      .filter(channel => {
        return !channel.isThread() && channel.parent == null
      })
      .sort((a, b) => guildChannelOrder(a as NonThreadGuildBasedChannel, b as NonThreadGuildBasedChannel))
      .map(generateChannelState)

    return initialState
  }

  async updateMessage(): Promise<void> {
    const dataToWrite: LogData = {
      meta: {
        logVersion: 1,
        from: this.logStartTime,
        to: Date.now(),
        guildId: this.guild.id,
        guildName: this.guild.name
      },
      initialState: this.initialState,
      timedPatches: this.patches
    }

    await this.removeDeprecatedData()

    const minifiedData = JSON.stringify(dataToWrite)

    // const dataTextFile = new AttachmentBuilder(Buffer.from(JSON.stringify(dataToWrite, null, 2))).setName('logs.txt')
    const dataTextFileCompressedMinified = new AttachmentBuilder(Buffer.from(Buffer.from(pako.deflate(minifiedData)).toString('base64'))).setName('logs.gzip')

    if (this.logMessage != null) {
      this.logMessage = await this.logMessage.edit({
        content: '',
        files: [dataTextFileCompressedMinified, plumeLogo]
      })
    } else {
      if (this.logChannel == null) {
        return
      }
      this.logMessage = await this.logChannel.send({
        content: '',
        files: [dataTextFileCompressedMinified, plumeLogo]
      })
    }

    const logFileUrl = `${process.env.PREVIEW_PREFIX_URL}${this.logMessage.attachments.find(a => a.name.includes('gzip'))?.url}`

    await this.logMessage.edit({
      embeds: [
        new EmbedBuilder()
          .setTitle('Logs')
          .setURL('https://plume.red')
          .addFields([
            {
              name: 'from',
              value: `<t:${Math.floor(this.logStartTime / 1000)}:F>`,
              inline: true
            },
            {
              name: 'to',
              value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
              inline: true
            },
            {
              name: 'Activities logged',
              value: dataToWrite.timedPatches.length.toString(),
              inline: false
            }
          ])
          .setThumbnail('attachment://plume_logo.webp')
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents([
          new ButtonBuilder().setURL(logFileUrl).setLabel('View logs').setStyle(ButtonStyle.Link)
        ])
      ]
    })


    // Write the time series to a file named with the current timestamp
    // const filename = `${generateLogFileName()}.json`
    // await fs.writeFile(filename, JSON.stringify(dataToWrite, null, 2))
    // console.log(filename, JSON.stringify(dataToWrite, null, 2))
    // this.timeSeries = []
  }

  updateMessageDebounced = _.debounce(this.updateMessage, 60e3)
}

function guildChannelOrder(a: NonThreadGuildBasedChannel, b: NonThreadGuildBasedChannel): number {
  // Set the voice and stage channels at the end
  if (a.type === ChannelType.GuildVoice || a.type === ChannelType.GuildStageVoice) {
    return 1
  }
  if (b.type === ChannelType.GuildVoice || b.type === ChannelType.GuildStageVoice) {
    return -1
  }

  return a.rawPosition - b.rawPosition
}

function generateChannelState(channel: GuildBasedChannel): ChannelState {
  let channelState: ChannelState | null = null
  if (channel.type === ChannelType.GuildCategory) {
    const categoryChannelState: CategoryChannelStateData = {
      channelType: PlumeChannelType.CATEGORY,
      channels: {}
    }
      ;[...channel.children.cache.values()]
        .sort((a, b) => guildChannelOrder(a as NonThreadGuildBasedChannel, b as NonThreadGuildBasedChannel))
        .forEach(childChannel => {
          categoryChannelState.channels[childChannel.id] = generateChannelState(childChannel as NonThreadGuildBasedChannel)
        })
    channelState = {
      id: channel.id,
      order: channel.rawPosition,
      name: channel.name,
      data: categoryChannelState
    }
  } else if (channel.isVoiceBased()) {
    const voiceChannelState: VoiceChannelStateData = {
      channelType: PlumeChannelType.VOICE,
      members: {}
    }
    channel.members.forEach(member => {
      voiceChannelState.members[member.id] = {
        id: member.id,
        name: member.displayName,
        avatar: member.user.avatarURL() ?? '',
        isStreaming: member.voice?.streaming ?? false,
        isFilming: member.voice?.selfVideo ?? false,
        isSelfMuted: member.voice?.selfMute ?? false,
        isSelfDeafened: member.voice?.selfDeaf ?? false,
        isServerMuted: member.voice?.serverMute ?? false,
        isServerDeafened: member.voice?.serverDeaf ?? false
      }
    })
    channelState = {
      id: channel.id,
      order: channel.rawPosition,
      name: channel.name,
      data: voiceChannelState
    }
  } else {
    channelState = {
      id: channel.id,
      order: (channel as NonThreadGuildBasedChannel).rawPosition,
      name: channel.name,
      data: {
        channelType: PlumeChannelType.TEXT
      }
    }
  }

  return channelState
}
