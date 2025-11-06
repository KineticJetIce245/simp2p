<svelte:options customElement="chat-subpage" />

<script>
  import "$lib/theme.css";
  let messages = $state([]);

  export const self = {
    addMessage: (next_message) => {
      messages = [...messages, next_message];
      console.log("Message added to chat subpage:", messages);
    },
    switchMessages: (new_messages_log) => {
      messages = new_messages_log;
    },
  };
</script>

<div class="message-holder">
  {#each messages as msg (msg)}
    <div
      class="message {msg.isloacal === true
        ? 'local-message'
        : 'remote-message'}"
    >
      <div class="message-info">
        <b>{msg.isloacal === true ? "Local" : "Remote"}</b>:
        {msg.time}
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
    color: var(--clr-light-a0);
    align-self: flex-end;
  }

  .remote-message {
    color: var(--clr-light-a0);
    align-self: flex-start;
  }
</style>
