<script lang="ts">
  import type { Member } from "@PlumeTypes";
  import { patchAdd, patchEdit, patchRemove } from "../transitions/patch";
  import VoiceStateIcon from "./VoiceStateIcon.svelte";
  import { VoiceStateEnum } from "../CustomTypes/VoiceStateTypes";
  import discordDefaultAvatar from "$lib/images/discord_default_avatar.png";
  import { Popover } from "flowbite-svelte";

  export let memberData: Member;

  function onAvatarLoadError(e: Event) {
    e.preventDefault();
    (e.target as HTMLImageElement | undefined)?.setAttribute(
      "src",
      discordDefaultAvatar
    );
    return false;
  }

  let clickedClipboard = false;

  function onClipboardClick() {
    navigator.clipboard.writeText(memberData.id);
    clickedClipboard = true;
    setTimeout(() => {
      clickedClipboard = false;
    }, 1000);
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
        <div class="inline-block" id={"member-" + memberData.id}>
          {memberData.name}
        </div>
        <Popover
          class="relative pr-0 dark:bg-neutral-700 dark:text-white"
          placement="right"
          offset={15}
          strategy="fixed"
          triggeredBy={"#member-" + memberData.id}
          ><div title="Copy member ID to clipboard">
            <svg
              class="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-800 dark:text-white member-id-clipboard outline-none cursor-pointer"
              role="button"
              tabindex="0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 18 20"
              on:click={onClipboardClick}
              on:keypress={onClipboardClick}
            >
              {#if clickedClipboard}
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 5h8m-1-3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1m6 0v3H6V2m6 0h4a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h4m0 9.464 2.025 1.965L12 9.571"
                />
              {:else}
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 2h4a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h4m6 0a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1m6 0v3H6V2M5 5h8m-8 5h8m-8 4h8"
                />
              {/if}
            </svg>
          </div>
          <span class="ml-6">ID: {memberData.id}</span>
        </Popover>
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
