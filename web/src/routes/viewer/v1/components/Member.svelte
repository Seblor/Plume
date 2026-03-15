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
          class="member-popover"
          placement="right"
          offset={15}
          strategy="fixed"
          triggeredBy={"#member-" + memberData.id}
        >
          <span class="popover-id">ID: {memberData.id}</span>
          <div
            class="popover-add-btn"
            role="button"
            tabindex="0"
            on:keypress={() => $IDsToShow = Array.from(new Set([...$IDsToShow, memberData.id]))}
            on:click={() => $IDsToShow = Array.from(new Set([...$IDsToShow, memberData.id]))}
            title="Add member's timeline"
          >
            <svg
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

<style>
  /* ── Flowbite Popover shell override ────────────────────── */
  :global(.member-popover) {
    background: var(--bg-overlay) !important;
    border: 1px solid var(--border) !important;
    border-radius: var(--radius-sm) !important;
    box-shadow: var(--shadow-card) !important;
    color: var(--text-primary) !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    gap: 0.5rem !important;
    white-space: nowrap !important;
    font-size: 0.6875rem !important;
  }

  
  :global(.member-popover > *) {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  /* Arrow tinted to match */
  :global(.member-popover [data-popper-arrow]::before),
  :global(.member-popover [data-popper-arrow]::after) {
    background: var(--bg-overlay) !important;
    border-color: var(--border) !important;
  }

  /* ID text */
  :global(.member-popover .popover-id) {
    font-family: 'Fira Mono', 'Consolas', monospace;
    color: var(--text-secondary);
    letter-spacing: 0.02em;
  }

  /* Arrow button */
  :global(.member-popover .popover-add-btn) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.125rem;
    height: 1.125rem;
    scale: 1.5;
    border-radius: 3px;
    color: var(--text-muted);
    cursor: pointer;
    transition: color 200ms, background 200ms;
  }

  :global(.member-popover .popover-add-btn:hover) {
    color: var(--text-primary);
    background: var(--bg-hover);
  }

  :global(.member-popover .popover-add-btn svg) {
    width: 0.75rem;
    height: 0.75rem;
  }
</style>
