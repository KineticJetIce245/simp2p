<script>
  import { onMount } from "svelte";
  import new_chat_icon from "$lib/assets/icons/add_box.svg";

  import ChatSubpage from "$lib/components/chat-subpage.svelte";

  function opensettings() {
    window.api.openSettings();
  }

  function loadConversations() {
    console.log("Load Conversation Called");
  }

  let chat_subpage;
  let addMessageRef;

  onMount(() => {
    console.log("Main Page Mounted");
    addMessageRef = function (newMessage) {
      chat_subpage.addMessage(newMessage);
    };
  });

  async function sendText() {
    console.log("Send Text Called");
    const newMessage = {
      id: Date.now().toString(),
      text: "This is a new message!",
      isloacal: true,
    };
    if (addMessageRef) {
      addMessageRef(newMessage);
    } else {
      console.error("addMessageRef is not defined");
    }
  }
</script>

<main>
  <div class="container">
    <div class="sidebar">
      <div class="sidebar-header">Web RTC</div>
      <div class="conversations">
        <div
          role="button"
          aria-labelledby="Load Conversations"
          tabindex="0"
          onclick={loadConversations}
          onkeydown={(e) => e.key === "Enter" && loadConversations()}
          class="conversation"
        >
          Conversation 1
        </div>
      </div>
      <div
        role="button"
        aria-labelledby="Load Conversations"
        tabindex="0"
        onclick={loadConversations}
        onkeydown={(e) => e.key === "Enter" && loadConversations()}
        class="new-chat"
      >
        <img
          src={new_chat_icon}
          alt="New Chat"
          style="width:30px; height:30px; margin-right:8px;"
        />
        <p style="horizontal-align:middle; font-size:16px;">New Chat</p>
      </div>
    </div>

    <div class="main-chat">
      <div class="chat-header">Conversation 1</div>
      <div class="chat-holder">
        <ChatSubpage bind:this={chat_subpage} />
      </div>
      <div class="chat-input">
        <input type="text" placeholder="Type a message..." />
        <button onclick={sendText}>Send</button>
      </div>
    </div>
  </div>
</main>

<style>
  main {
    height: 100%;
    margin: 0;
    padding: 0;
  }

  .container {
    display: flex;
    height: 100vh;
  }

  /* Sidebar */
  .sidebar {
    width: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .sidebar-header {
    width: 100%;
    padding: 20px;
    font-size: 1.2em;
    font-weight: bold;
    text-align: center;
  }

  .conversations {
    width: 100%;
    flex: 1;
    overflow-y: auto;
  }

  .conversation {
    padding: 10px 15px;
    margin: 10px;
    border-radius: 10px;
    cursor: pointer;
  }

  .new-chat {
    padding: 10px 15px;
    cursor: pointer;
    margin: 10px;
    margin-right: 20px;
    border-radius: 10px;
    width: 60%;
    height: 24px;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* Main chat area */
  .main-chat {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .chat-header {
    padding: 20px;
    font-weight: bold;
  }

  .chat-holder {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
  }

  .chat-input {
    padding: 15px 20px;
    display: flex;
  }

  .chat-input input {
    flex: 1;
    padding: 10px 15px;
    border-radius: 20px;
    outline: none;
  }

  .chat-input button {
    margin-left: 10px;
    padding: 10px 20px;
    border: none;
    border-radius: 20px;
    cursor: pointer;
  }

  .chat-input button:hover {
    background-color: #0e8e6a;
  }
</style>
