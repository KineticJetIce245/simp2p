<script>
  import new_chat_icon from "$lib/assets/icons/add_box.svg";
  function opensettings() {
    window.api.openSettings();
  }
</script>

<main>
  <div class="container">
    <div class="sidebar">
      <div class="sidebar-header">Web RTC</div>
      <div class="conversations">
        <div class="conversation">Conversation 1</div>
        <div class="conversation">Conversation 1</div>
        <div class="conversation">Conversation 1</div>
      </div>
      <div class="new-chat">
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
      <div class="messages">
        <div class="message bot-message">Hello! How can I help you today?</div>
        <div class="message user-message">Hi! I want to learn HTML.</div>
        <div class="message bot-message">
          Sure! HTML is the backbone of web pages...
        </div>
      </div>
      <div class="chat-input">
        <input type="text" placeholder="Type a message..." />
        <button>Send</button>
      </div>
    </div>
  </div>
</main>

<style>
  @import "$lib/theme.css";
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
    padding: 20px;
    font-size: 1.2em;
    font-weight: bold;
  }

  .conversations {
    width: 100%;
    flex: 1;
    overflow-y: auto;
  }

  .conversation {
    padding: 15px 20px;
    margin: 10px;
    border-radius: 10px;
    cursor: pointer;
  }

  .new-chat {
    padding: 15px 20px;
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
    border-bottom: 1px solid #ddd;
    font-weight: bold;
    background-color: #f5f5f5;
  }

  .messages {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
  }

  .message {
    margin-bottom: 15px;
    padding: 10px 15px;
    border-radius: 10px;
    max-width: 70%;
  }

  .user-message {
    background-color: #dcf8c6;
    align-self: flex-end;
  }

  .bot-message {
    background-color: #f1f0f0;
    align-self: flex-start;
  }

  .chat-input {
    padding: 15px 20px;
    border-top: 1px solid #ddd;
    display: flex;
    background-color: #f5f5f5;
  }

  .chat-input input {
    flex: 1;
    padding: 10px 15px;
    border: 1px solid #ccc;
    border-radius: 20px;
    outline: none;
  }

  .chat-input button {
    margin-left: 10px;
    padding: 10px 20px;
    border: none;
    background-color: #10a37f;
    color: #fff;
    border-radius: 20px;
    cursor: pointer;
  }

  .chat-input button:hover {
    background-color: #0e8e6a;
  }
</style>
