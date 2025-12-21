<svelte:options customElement="new-chat-subpage" />

<script>
  import "$lib/theme.css";
  import IconGensdp from "$lib/assets/icons/icon_gensdp.svelte";
  import IconHourglass from "$lib/assets/icons/icon_hourglass.svelte";
  import IconDragclick from "$lib/assets/icons/icon_dragclick.svelte";
  import { obtainValideSDPPath } from "$lib/utils/estac.cjs";
  import { tick } from "svelte";

  let gen_sdp_state = "gen-sdp-enabled";

  async function genSDPOnClick() {
    switch (gen_sdp_state) {
      case "gen-sdp-enabled": {
        // disabled new generation
        gen_sdp_state = "gen-sdp-disabled";
        await tick();
        // Determine the converstation ID at this point
        window.logger.logMessage("[New Chat Subpage]: Generating SDP...");
        let timestamp = Date.now(); // conversation ID
        try {
          const result = await obtainValideSDPPath(true, timestamp, null);
          window.logger.logMessage(
            "[New Chat Subpage]: SDP generated at path: " + result,
          );
          gen_sdp_state = "gen-sdp-allow-drag";
          await tick();
          setDragDropComponent(result);
        } catch (error) {
          window.logger.logMessage(
            "[New Chat Subpage]: Error during SDP generation: " + error,
          );
          // re-enable generation
          gen_sdp_state = "gen-sdp-enabled";
          return;
        }
        break;
      }
      case "gen-sdp-disabled": {
        window.logger.logMessage(
          "[New Chat Subpage]: Generation of SDP is already disabled.",
        );
        break;
      }
      case "gen-sdp-allow-drag": {
        break;
      }
      default:
        window.logger.logMessage(
          "[New Chat Subpage]: Unknown SDP generation state.",
        );
        return;
    }
  }

  function setDragDropComponent(filePath) {
    const dragItem = document.getElementsByClassName("gen-sdp-allow-drag")[0];
    window.logger.logMessage(
      "[New Chat Subpage]: Setting drag-and-drop for file: " + filePath,
    );
    dragItem.setAttribute("draggable", "true");
    dragItem.addEventListener("dragstart", (event) => {
      event.preventDefault();
      window.estac.dragStart(filePath);
    });
  }

  function helpTextGeneration() {
    switch (gen_sdp_state) {
      case "gen-sdp-enabled":
        return "Click here to generate SDP.";
      case "gen-sdp-disabled":
        return "SDP generation in progress.";
      case "gen-sdp-allow-drag":
        return "Drag and drop the SDP file.";
    }
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
    onclick={genSDPOnClick}
    onkeydown={(e) => e.key === "Enter" && genSDPOnClick()}
    class={gen_sdp_state}
  >
    {#if gen_sdp_state === "gen-sdp-enabled"}
      <IconGensdp scale="2" />
    {:else if gen_sdp_state === "gen-sdp-disabled"}
      <IconHourglass scale="2" />
    {:else if gen_sdp_state === "gen-sdp-allow-drag"}
      <IconDragclick scale="2" />
    {/if}
    <p class="help-text">{helpTextGeneration()}</p>
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
    background-color: var(--clr-surface-a20);
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
    border-color: var(--clr-light-a10);
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

  .gen-sdp-enabled {
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

  .gen-sdp-enabled:hover {
    border: 2px dashed var(--clr-primary-a10);
    background-color: var(--clr-surface-tonal-a20);
    color: var(--clr-primary-a30);
    fill: var(--clr-primary-a30);
  }

  .gen-sdp-disabled {
    margin: 20px;
    border: 2px dashed var(--clr-surface-tonal-a30);
    border-radius: 15px;
    height: 150px;
    cursor: not-allowed;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    background-color: var(--clr-surface-tonal-a10);
    color: var(--clr-surface-tonal-a30);
    fill: var(--clr-surface-tonal-a30);
  }

  .gen-sdp-allow-drag {
    margin: 20px;
    border: 2px dashed var(--clr-primary-a30);
    border-radius: 15px;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    background-color: var(--clr-surface-a20);
    color: var(--clr-primary-a30);
    fill: var(--clr-primary-a30);
  }

  .help-text {
    font-size: 18px;
  }
</style>
