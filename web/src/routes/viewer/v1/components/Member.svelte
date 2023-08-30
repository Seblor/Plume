<script lang="ts">
  import type { Member } from "@PlumeTypes";
  import { patchAdd, patchEdit, patchRemove } from "../transitions/patch";
  import VoiceStateIcon from "./VoiceStateIcon.svelte";
  import { VoiceStateEnum } from "../CustomTypes/VoiceStateTypes";
  import discordDefaultAvatar from "$lib/images/discord_default_avatar.png";

  export let memberData: Member;

  function onAvatarLoadError(e: Event) {
    e.preventDefault();
    (e.target as HTMLImageElement | undefined)?.setAttribute(
      "src",
      discordDefaultAvatar
    );
    return false;
  }
</script>

<div in:patchAdd out:patchRemove>
  <div style="z-index: 999" class="h-6">
    {#key (memberData.name, memberData.isSelfMuted)}
      <div in:patchEdit class="relative flex place-items-center">
        <img
          src={memberData.avatar || discordDefaultAvatar}
          on:error={onAvatarLoadError}
          alt="avatar"
          class="rounded-full h-5 mr-2"
        />
        <span>{memberData.name}</span>
        <div class="absolute flex right-0 top-0 mr-4">
          {#if memberData.isSelfMuted}
            <VoiceStateIcon state={VoiceStateEnum.SELF_MUTED} />
          {/if}
          {#if memberData.isSelfDeafened}
            <VoiceStateIcon state={VoiceStateEnum.SELF_DEAFENED} />
          {/if}
          {#if memberData.isServerMuted}
            <VoiceStateIcon state={VoiceStateEnum.SERVER_MUTED} />
          {/if}
          {#if memberData.isServerDeafened}
            <VoiceStateIcon state={VoiceStateEnum.SERVER_DEAFENED} />
          {/if}
          {#if memberData.isFilming}
            <VoiceStateIcon state={VoiceStateEnum.FILMING} />
          {/if}
          {#if memberData.isStreaming}
            <VoiceStateIcon state={VoiceStateEnum.STREAMING} />
          {/if}
        </div>
      </div>
    {/key}
  </div>
</div>
