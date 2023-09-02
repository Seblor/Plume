<script lang="ts">
  import type { Member } from "@PlumeTypes";
  import { patchAdd, patchEdit, patchRemove } from "../transitions/patch";
  import VoiceStateIcon from "./VoiceStateIcon.svelte";
  import { VoiceStateEnum } from "../CustomTypes/VoiceStateTypes";
  import discordDefaultAvatar from "$lib/images/discord_default_avatar.png";
  import { Popover } from "flowbite-svelte";
    import { IDsToShow } from "../store/timelines";

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
        <div class="inline-block" id={"member-" + memberData.id}>
          {memberData.name}
        </div>
        <Popover
          class="relative pr-0 z-10 dark:bg-neutral-700 dark:text-white"
          placement="right"
          offset={15}
          strategy="fixed"
          triggeredBy={"#member-" + memberData.id}
          ><div>
            <span class="mr-6">ID: {memberData.id}</span>
            <div
              class="absolute right-2 top-1/2 -translate-y-1/2 outline-none cursor-pointer"
              role="button"
              tabindex="0"
              on:keypress={() => $IDsToShow = Array.from(new Set([...$IDsToShow, memberData.id]))}
              on:click="{() => $IDsToShow = Array.from(new Set([...$IDsToShow, memberData.id]))}"
              title="Add member's timeline"
            >
              <svg
                class="w-4 h-4 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            </div>
          </div></Popover
        >
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
