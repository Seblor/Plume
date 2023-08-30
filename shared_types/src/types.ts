import type { Operation } from 'fast-json-patch/commonjs/core'

export enum TimeSeriesEvent {
  CHANNEL_CREATED = 'CHANNEL_CREATED',
  CHANNEL_UPDATED = 'CHANNEL_UPDATED',
  CHANNEL_DELETED = 'CHANNEL_DELETED',
  MEMBER_JOINED = 'MEMBER_JOINED',
  MEMBER_UPDATED = 'MEMBER_UPDATED',
  MEMBER_LEFT = 'MEMBER_LEFT',
}

interface ChannelCreatedMetadata {
  event: TimeSeriesEvent.CHANNEL_CREATED
  channelId: string
  channelName: string
  isVoiceChannel: boolean
  channelPosition: number
}

interface ChannelUpdatedMetadata {
  event: TimeSeriesEvent.CHANNEL_UPDATED
  channelId: string
  channelName: string
  isVoiceChannel: boolean
  channelPosition: number
}

interface ChannelDeletedMetadata {
  event: TimeSeriesEvent.CHANNEL_DELETED
  channelId: string
}

interface MemberJoinedMetadata {
  event: TimeSeriesEvent.MEMBER_JOINED
  memberId: string
  memberName: string
  memberAvatar: string
  isStreaming: boolean
  isFilming: boolean
  isSelfMuted: boolean
  isSelfDeafened: boolean
  isServerMuted: boolean
  isServerDeafened: boolean
}

interface MemberUpdatedMetadata {
  event: TimeSeriesEvent.MEMBER_UPDATED
  memberId: string
  memberName: string
  memberAvatar: string
  isStreaming: boolean
  isFilming: boolean
  isSelfMuted: boolean
  isSelfDeafened: boolean
  isServerMuted: boolean
  isServerDeafened: boolean
}

interface MemberLeftMetadata {
  event: TimeSeriesEvent.MEMBER_LEFT
  memberId: string
}

export interface TimedPatches {
  timestamp: number
  patches: Operation[]
}

export interface Member {
  id: string
  name: string
  avatar: string
  isStreaming: boolean
  isFilming: boolean
  isSelfMuted: boolean
  isSelfDeafened: boolean
  isServerMuted: boolean
  isServerDeafened: boolean
}

export const enum PlumeChannelType {
  CATEGORY = "category",
  TEXT = "text",
  VOICE = "voice",
}

export interface CategoryChannelStateData {
  channelType: PlumeChannelType.CATEGORY
  channels: Record<string, ChannelState>
}

export interface TextChannelStateData {
  channelType: PlumeChannelType.TEXT
}

export interface VoiceChannelStateData {
  channelType: PlumeChannelType.VOICE
  members: Record<string, Member>
}

export interface ChannelState {
  id: string
  name: string
  order: number
  data: CategoryChannelStateData | TextChannelStateData | VoiceChannelStateData
}

export interface LogsMetadata {
  logVersion: number,
  guildId: string,
  guildName: string,
  from: number,
  to: number,
}

export interface LogData {
  meta: LogsMetadata,
  initialState: ChannelState[]
  timedPatches: TimedPatches[]
}
