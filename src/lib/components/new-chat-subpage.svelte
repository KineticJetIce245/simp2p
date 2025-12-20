<svelte:options customElement="new-chat-subpage" />

<script>
  import "$lib/theme.css";
  import IconGensdp from "$lib/assets/icons/icon_gensdp.svelte";
  import { obtainValideSDPPath } from "$lib/utils/estac.cjs";

  async function generateSDP() {
    // Determine the conversation ID at this point
    window.logger.logMessage("[New Chat Subpage]: Generating SDP...");
    let timestamp = Date.now();
    const result = await obtainValideSDPPath(true, timestamp);
    window.logger.logMessage(
      "[New Chat Subpage]: SDP generated at path: " + result,
    );
  }
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
  <p class="title">Generate SDP</p>
  <hr class="sepline" />
  <div
    role="button"
    aria-labelledby="Generate SDP"
    tabindex="0"
    onclick={generateSDP}
    onkeydown={(e) => e.key === "Enter" && generateSDP()}
    class="file-generation-form"
  >
    <IconGensdp scale="2" />
    <p class="help-text">Click here to generate sdp.</p>
  </div>
  <p class="title">Receive SDP</p>
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

  .file-generation-form {
    margin: 20px;
    border: 2px dashed var(--clr-surface-tonal-a30);
    border-radius: 15px;
    height: 150px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    background-color: var(--clr-surface-tonal-a10);
    color: var(--clr-surface-tonal-a30);
    fill: var(--clr-surface-tonal-a30);
  }

  .file-generation-form:hover {
    border: 2px dashed var(--clr-primary-a10);
    background-color: var(--clr-surface-tonal-a20);
  }

  .file-generation-form:hover {
    color: var(--clr-primary-a30);
    fill: var(--clr-primary-a30);
  }

  .help-text {
    font-size: 18px;
  }
</style>
