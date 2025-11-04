<script>
  function opensettings() {
    window.api.openSettings();
  }
</script>

<main>
  <div class="container">
    <div class="sidebar">
      <div class="sidebar-header">Web RIC</div>
      <div class="conversations">
        <div class="conversation">Conversation 1</div>
      </div>
      <div class="new-chat">+ New Chat</div>
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
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
  }

  main {
    height: 100%;
    background-color: #f7f7f8;
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
    background-color: #202123;
    color: #fff;
    display: flex;
    flex-direction: column;
  }

  .sidebar-header {
    padding: 20px;
    font-size: 1.2em;
    font-weight: bold;
    border-bottom: 1px solid #333;
  }

  .conversations {
    flex: 1;
    overflow-y: auto;
  }

  .conversation {
    padding: 15px 20px;
    cursor: pointer;
    border-bottom: 1px solid #333;
  }

  .conversation:hover {
    background-color: #343541;
  }

  .new-chat {
    padding: 15px 20px;
    border-top: 1px solid #333;
    cursor: pointer;
    text-align: center;
    background-color: #343541;
  }

  .new-chat:hover {
    background-color: #4a4c58;
  }

  /* Main chat area */
  .main-chat {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
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
