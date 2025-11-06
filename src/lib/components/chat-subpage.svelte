<svelte:options customElement="chat-subpage" />

<script>
  import "$lib/theme.css";
  let {
    messages = [
      {
        id: "1",
        text: "Hello!",
        isloacal: false,
      },
    ],
  } = $props();

  export function addMessage(newMessage) {
    messages = [...messages, newMessage];
  }
</script>

<div class="message-holder">
  {#each messages as msg (msg)}
    <div
      class="message {msg.isloacal === true
        ? 'local-message'
        : 'remote-message'}"
    >
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
