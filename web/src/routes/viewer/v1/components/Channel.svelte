<script lang="ts">
  import { PlumeChannelType, type ChannelState } from "@PlumeTypes";
  import Channel from "./Channel.svelte";
  import Member from "./Member.svelte";
  import { patchAdd, patchEdit, patchRemove } from "../transitions/patch";
  import { fade, slide } from "svelte/transition";
  import { showTextChannels } from "../store/channelsList";
  import ChannelIcon from "./ChannelIcon.svelte";
  import { sortBy } from "lodash";

  let show = true;

  export let channelData: ChannelState;
  $: data = channelData.data;
</script>

<div
  in:patchAdd
  out:patchRemove
  style:opacity={show ? 1 : 0.5}
  class="channel"
>
  {#if channelData.data.channelType === PlumeChannelType.CATEGORY}
    {#key channelData.name}
      <div>
        <span class="inline-block transition-all" class:-rotate-90={!show}>
          <ChannelIcon channelType="CATEGORY" />
        </span>
        <span
          in:patchEdit
          title={channelData.name}
          class="inline-block pb-0.5"
          class:category={channelData.data.channelType ===
            PlumeChannelType.CATEGORY}
          on:click={() => (show = !show)}
          role="button"
          on:keypress={() => {}}
          tabindex="-1">{channelData.name}</span
        >
      </div>
    {/key}
    <div class="children">
      {#each show ? Object.values(channelData.data.channels).filter((channel) => $showTextChannels || channel.data.channelType !== PlumeChannelType.TEXT) : [] as channel (channel.id)}
        <div class="block pb-0.5" transition:slide>
          <Channel channelData={channel} />
        </div>
      {/each}
    </div>
  {:else if channelData.data.channelType === PlumeChannelType.VOICE}
    {#key channelData.name}
      <span class="block pb-0.5" in:patchEdit
        ><ChannelIcon channelType="VOICE" /> {channelData.name}</span
      >
    {/key}
    <div class="children">
      {#each Object.values(channelData.data.members) as member (member.id)}
        <Member memberData={member} />
      {/each}
    </div>
  {:else if channelData.data.channelType === PlumeChannelType.TEXT}
    {#key channelData.name}
      <span class="block pb-0.5" in:patchEdit
        ><ChannelIcon channelType="TEXT" /> {channelData.name}</span
      >
    {/key}
  {/if}
</div>

<style lang="scss">
  .channel {
    & .category {
      cursor: pointer;
    }

    .children {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      white-space: nowrap;
      margin-left: 1em;
    }
  }
</style>
