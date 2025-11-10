<svelte:options customElement="chat-subpage" />

<script>
  import { onMount } from "svelte";

  import "$lib/theme.css";
  let messages = $state([]);

  export const self = {
    addMessage: (next_message) => {
      messages = [...messages, next_message];
      console.log("Message added to chat subpage:", next_message);
    },
    switchMessages: (new_messages_log) => {
      messages = new_messages_log;
    },
  };

  onMount(() => {
    let messageHolder = document.querySelector(".message-holder");
    var mhobserver = new MutationObserver(() => {
      messageHolder.scrollIntoView({ behavior: "smooth", block: "end" });
    });
    mhobserver.observe(messageHolder, { childList: true });
  });
</script>

<div class="message-holder">
  {#each messages as msg (msg)}
    <div
      class="message {msg.isloacal === true
        ? 'local-message'
        : 'remote-message'}"
    >
      <div
        class="message-info {msg.isloacal === true
          ? 'local-message'
          : 'remote-message'}"
      >
        <div>
          <b>{msg.isloacal === true ? "Local" : "Remote"}</b>: {msg.time}
        </div>
      </div>
      {msg.text}
    </div>
  {/each}
</div>

<style>
  .message-holder {
    display: flex;
    flex-direction: column;
    padding: 10px;
  }

  .message {
    color: var(--clr-light-a0);
    margin-bottom: 15px;
    padding: 10px 15px;
    border-radius: 10px;
    max-width: 70%;
    font-size: 18px;
  }

  .message-info {
    font-size: 12px;
    color: var(--clr-primary-a0);
  }

  .local-message {
    align-self: flex-end;
    display: flex;
    flex-direction: column;
  }

  .remote-message {
    align-self: flex-start;
    display: flex;
    flex-direction: column;
  }
</style>
