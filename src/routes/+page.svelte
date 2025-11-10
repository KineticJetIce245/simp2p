<script>
  import { onMount } from "svelte";

  import NewChatSubpage from "$lib/components/new-chat-subpage.svelte";
  import ChatSubpage from "$lib/components/chat-subpage.svelte";
  import IconAddBox from "$lib/assets/icons/icon_add_box.svelte";
  import IconSend from "$lib/assets/icons/icon_send.svelte";
  import IconUploadFile from "$lib/assets/icons/icon_upload_file.svelte";

  const new_chat_load_info = {
    loaded: true,
    conversation_name: "New Chat",
    conversation_id: null,
  };

  let chat_load_info = new_chat_load_info;

  let chat_subpage;
  let csubref;

  onMount(() => {
    console.log("Main Page Mounted.");

    // load the reference to the child component
    csubref = chat_subpage.self;
  });

  // send text function
  async function sendText() {
    let inputField = document.querySelector(".chat-input input");
    let msg = inputField.value;
    if (msg.trim() === "") {
      console.warn("Empty message in input field, not sending.");
      return;
    }
    console.log("Send Text Called");
    let current_time = Date.now();
    const newMessage = {
      id: current_time,
      time: new Date(current_time).toLocaleString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
      text: msg,
      isloacal: true,
    };
    if (csubref && csubref.addMessage) {
      csubref.addMessage(newMessage);
    } else {
      console.error(`Unable to load message on the chat
      subpage: subpage reference is not defined`);
    }
    inputField.value = "";
  }

  let testText = `Lorem ipsum dolor sit amet,
  consectetur adipiscing elit, sed do eiusmod
  tempor incididunt ut labore et dolore magna aliqua.
  Ut enim ad minim veniam, quis nostrud exercitation ullamco
  laboris nisi ut aliquip ex ea commodo consequat. Duis
  aute irure dolor in reprehenderit in voluptate velit esse
  cillum dolore eu fugiat nulla pariatur. Excepteur sint
  occaecat cupidatat non proident, sunt in culpa qui
  officia deserunt mollit anim id est laborum.`;

  function switchConversation() {
    console.log("Switch Conversation Called");
    let newMessagesLog = [
      { id: "1", text: testText, isloacal: false },
      { id: "2", text: "Hi! How are you?", isloacal: true },
    ];
    if (csubref && csubref.switchMessages) {
      csubref.switchMessages(newMessagesLog);
    } else {
      console.error("switchMessagesRef is not defined");
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
          onclick={switchConversation}
          onkeydown={(e) => e.key === "Enter" && switchConversation()}
          class="conversation"
        >
          Conversation 1
        </div>
      </div>
      <div
        role="button"
        aria-labelledby="Load Conversations"
        tabindex="0"
        onclick={switchConversation}
        onkeydown={(e) => e.key === "Enter" && switchConversation()}
        class="new-chat"
      >
        <IconAddBox />
        <p style="horizontal-align:middle; font-size:18px;">New Chat</p>
      </div>
    </div>

    <div class="main-chat">
      <div class="chat-header">
        {chat_load_info.conversation_name}
      </div>
      {#if chat_load_info.loaded}
        <div class="chat-holder">
          <ChatSubpage bind:this={chat_subpage} />
        </div>
        <div class="chat-input">
          <input
            type="text"
            placeholder="Type a message..."
            onkeydown={(e) => e.key === "Enter" && sendText()}
          />
          <button onclick={sendText} style="display:flex; align-items:center;">
            <IconUploadFile />Send File
          </button>
          <button onclick={sendText} style="display:flex; align-items:center;">
            <IconSend />Send
          </button>
        </div>
      {:else}
        <NewChatSubpage bind:this={chat_subpage} />
      {/if}
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
    margin: 10px;
    width: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 20px;
  }

  .sidebar-header {
    width: 100%;
    padding: 20px;
    font-size: 20px;
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
    font-size: 18px;
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
    margin: 10px;
    border-radius: 20px;
    padding: 20px;
    font-weight: bold;
    font-size: 20px;
  }

  .chat-holder {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
  }

  .chat-input {
    padding: 15px 20px;
    display: flex;
    font-size: 16px;
  }

  .chat-input input {
    flex: 1;
    padding: 10px 15px;
    border-radius: 20px;
    outline: none;
    font-size: 16px;
  }

  .chat-input button {
    margin-left: 10px;
    padding: 10px 20px;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 16px;
  }
</style>
