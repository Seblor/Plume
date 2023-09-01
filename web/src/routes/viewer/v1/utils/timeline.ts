import _ from 'lodash'
import type { Operation } from "fast-json-patch";
import { PlumeChannelType } from '@PlumeTypes';
import type { Member } from '@PlumeTypes';
import type { operationNames } from '../CustomTypes/operations';

export function generateLabel(patches: Operation[]): string {
  const groupedByMember = _.groupBy(patches, patch => patch.path.replace(/.*\/members\/((?:demo-)?\d+)(?:\/.*)?/g, '$1'))

  const squashedPatches: operationNames[] = []

  // For each pair of each group, attempt to squash it
  _.forEach(groupedByMember, (patches, memberId) => {
    _.forEach(patches, (patch1, patch1Index) => {
      const squashAttempt = patches.slice(patch1Index + 1).find((patch2, patch2Index) => {
        const squash = squashPatch(patch1, patch2, memberId)
        if (squash !== null) {
          patches.splice(patch2Index, 1)
          squashedPatches.push(squash)
          return true
        }
        return false
      })
      if (!squashAttempt && patch1) {
        squashedPatches.push(patch1.op)
      }
    })
  })

  return squashedPatches.map(operationName => renamePatchOperation(operationName)).join(', ')
}

function squashPatch(patch1: Operation, patch2: Operation, memberId: string): operationNames | null {
  // If user changed channel
  if (
    (patch1.op === "remove" && patch2.op === "add") ||
    (patch1.op === "add" && patch2.op === "remove")
  ) {
    return "moved";
  }

  // if member left a channel and joined a newly created channel
  if (
    (patch1.op === "remove" && 'value' in patch2 && patch2.op === "add" && patch2.value.data.channelType === PlumeChannelType.VOICE && patch2.value.data.members[memberId] !== undefined) ||
    (patch2.op === "remove" && 'value' in patch1 && patch1.op === "add" && patch1.value.data.channelType === PlumeChannelType.VOICE && patch1.value.data.members[memberId] !== undefined)) {
    return "moved";
  }
  return null;
}

function renamePatchOperation(operationName: operationNames): string {
  switch (operationName) {
    case 'replace':
      return 'change';
    case 'add':
      return 'joined';
    case 'remove':
      return 'left';
    default:
      return operationName
  }
}

export function getColorFromLabel(string: string) {
  if (string.includes('joined')) return '#2ca02c'
  if (string.includes('left')) return '#d62728'
  if (string.includes('moved')) return '#9467bd'
  return '#ff7f0e'
}

const memberPatchRegex = RegExp(/\/members\/((?:demo-)?\d+)\/(\w+)$/);

export function extractVoiceStateChange(patch: Operation): string | null {
  const changes = '';

  if (patch.op !== 'replace') {
    return changes;
  }

  const change = memberPatchRegex.exec(patch.path)?.[2] as (keyof Member) | null;
  const value = patch.value;

  switch (change) {
    case 'isSelfMuted':
      return value ? 'Muted' : 'Unmuted';
    case 'isSelfDeafened':
      return value ? 'Deafened' : 'Undeafened';
    case 'isServerMuted':
      return value ? 'Muted by staff' : 'Unmuted by staff';
    case 'isServerDeafened':
      return value ? 'Deafened by staff' : 'Undeafened by staff';
    case 'isStreaming':
      return value ? 'Stream Started' : 'Stream Stopped';
    case 'isFilming':
      return value ? 'Screen Share Started' : 'Screen Share Stopped';
    case 'avatar':
      return 'Avatar Changed';
    case 'name':
      return 'Name Changed';
    default:
      return null
  }

}

export function extractVoiceStateChanges(patches: Operation[]): { voiceStateChangeLabel: string, patchesHandled: Operation[] } {
  const values = {
    voiceStateChangeLabel: [] as string[],
    patchesHandled: [] as Operation[]
  };

  patches.forEach(patch => {
    const change = extractVoiceStateChange(patch);

    if (change) {
      values.voiceStateChangeLabel.push(change);
      values.patchesHandled.push(patch);
    }
  });

  return {
    voiceStateChangeLabel: values.voiceStateChangeLabel.join(', '),
    patchesHandled: values.patchesHandled
  };
}
