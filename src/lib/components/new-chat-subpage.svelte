<svelte:options customElement="new-chat-subpage" />

<script>
  import "$lib/theme.css";
</script>

<div class="form-container">
  <p class="title">Conversation</p>
  <hr class="sepline" />
  <div class="conversation-info-form">
    <p class="subTitle">Title</p>
    <input
      id="title-input"
      placeholder="Title of the converstation goes to here..."
    />
  </div>
  <p class="title">Generate</p>
  <hr class="sepline" />
  <div class="file-generation-form"></div>
  <p class="title">Receive</p>
  <hr class="sepline" />
  <div class="file-reception-form"></div>
</div>

<style>
  .form-container {
    padding: 40px;
    font-size: 24px;
    min-width: 400px;
    width: 80%;
    max-width: 600px;
    align-self: center;
    margin: 20px;
    border-radius: 20px;
    background-color: #ffffff10;
  }

  .title {
    margin: 0;
    font-size: 30px;
    font-weight: bold;
    color: var(--clr-light-a0);
  }

  .sepline {
    margin: 0;
    padding: 0;
    border-width: 1px;
    border-color: var(--clr-surface-a10);
  }

  .conversation-info-form {
    margin: 0;
    padding: 10px 0px 10px 0px;
    width: 100%;
  }

  .subTitle {
    margin: 0;
    padding: 0;
    font-size: 20px;
    color: var(--clr-light-a0);
    font-weight: bold;
  }

  #title-input {
    padding: 7px 10px 7px 10px;
    border-radius: 8px;
    outline: none;
    font-size: 15px;
    border: 1px solid var(--clr-surface-tonal-a30);
    background-color: var(--clr-surface-a20);
    color: var(--clr-light-a0);
    width: calc(100% - 20px);
    align-self: center;
  }

  #title-input:focus {
    border: 1px solid var(--clr-primary-a0);
  }
</style>
