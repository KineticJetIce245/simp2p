<svelte:options customElement="new-chat-subpage" />

<script>
  import "$lib/theme.css";
  import IconGensdp from "$lib/assets/icons/icon_gensdp.svelte";
  import IconHourglass from "$lib/assets/icons/icon_hourglass.svelte";
  import IconDragclick from "$lib/assets/icons/icon_dragclick.svelte";
  import IconOpenfile from "$lib/assets/icons/icon_openfile.svelte";
  import IconBlock from "$lib/assets/icons/icon_block.svelte";
  import IconCheck from "$lib/assets/icons/icon_check.svelte";
  import { tick } from "svelte";
  import { onMount } from "svelte";
  import { onDestroy } from "svelte";
  import { browser } from "$app/environment";

  let gen_sdp_state = "gen-sdp-enabled";
  let drop_sdp_state = "drop-sdp-enabled";
  let conversation_id = null;
  let isValidConversation = false;

  async function genSDPOnClick() {
    switch (gen_sdp_state) {
      case "gen-sdp-enabled": {
        gen_sdp_state = "gen-sdp-disabled"; // disable generation
        await tick();
        window.logger.logMessage("[New Chat Subpage]: Generating SDP...");
        try {
          const result = await window.rtchost.bstrapConv();
          window.logger.logMessage(
            `[New Chat Subpage]: SDP generated successfully at: ${result.estac_path}.`,
          );
          conversation_id = result.conv_id;
          gen_sdp_state = "gen-sdp-allow-drag";
          await tick();
          setDragComp(result.estac_path, gen_sdp_state);
        } catch (error) {
          window.logger.logMessage(
            `[New Chat Subpage]: Error during SDP generation: ${error}`,
          );
          gen_sdp_state = "gen-sdp-enabled"; // re-enable generation
          return;
        }
        break;
      }
      case "gen-sdp-disabled": {
        window.logger.warnMessage(
          "[New Chat Subpage]: Generation of SDP is already disabled.",
        );
        break;
      }
      case "gen-sdp-allow-drag": {
        break;
      }
      default:
        window.logger.warnMessage(
          "[New Chat Subpage]: Unknown SDP generation state.",
        );
        return;
    }
  }

  function setDragComp(file_path, class_name) {
    const dragItem = document.getElementsByClassName(class_name)[0];
    window.logger.logMessage(
      "[New Chat Subpage]: Setting drag-and-drop for file: " + file_path,
    );
    dragItem.setAttribute("draggable", "true");
    dragItem.addEventListener("dragstart", (event) => {
      event.preventDefault();
      window.estac.dragStart(file_path);
    });
  }

  async function genSDPOnDrop(conversation_info) {
    gen_sdp_state = "gen-sdp-disabled"; // disable generation
    await tick();
    window.logger.logMessage(
      "[New Chat Subpage]: Generating SDP, this is the first time...",
    );
    conversation_id = conversation_info.tmsp;

    try {
      const result = await window.rtchost.bstrapConvAnswer(conversation_info);
      window.logger.logMessage(
        `[New Chat Subpage]: SDP generated successfully at: ${result.estac_path}.`,
      );
      gen_sdp_state = "gen-sdp-allow-drag";
      await tick();
      setDragComp(result.estac_path, gen_sdp_state);
    } catch (error) {
      window.logger.logMessage(
        `[New Chat Subpage]: Error during SDP generation on drop: ${error}`,
      );
      gen_sdp_state = "gen-sdp-enabled"; // re-enable generation
      return;
    }
  }

  async function genValideConversation(conversation_info) {
    window.logger.logMessage(
      "[New Chat Subpage]: Checking validity of dropped conversation info...",
    );
    if (conversation_id === conversation_info.tmsp) {
      window.logger.logMessage(
        "[New Chat Subpage]: Valid conversation info received.",
      );
      isValidConversation = true;
      window.rtchost.loadSdpAndIces(conversation_info);
      // At here, the connection should be established
    } else {
      window.logger.logMessage(
        "[New Chat Subpage]: Invalid conversation info received.",
      );
      // Regenerate conversation
      genSDPOnDrop(conversation_info);
    }
  }

  function setDropComp(class_name) {
    const dropItem = document.getElementsByClassName(class_name)[0];
    window.logger.logMessage(
      "[New Chat Subpage]: Setting drop area for receiving SDP.",
    );

    // Appearance change on dragover and dragleave
    dropItem.addEventListener("dragover", async (event) => {
      event.preventDefault();
      if (
        drop_sdp_state === "drop-sdp-disabled" ||
        drop_sdp_state === "drop-sdp-illegal-drop"
      ) {
        return;
      }
      drop_sdp_state = "drop-sdp-enabled-dragover";
      await tick();
    });

    // Appearance change on dragover and dragleave
    dropItem.addEventListener("dragleave", async (event) => {
      event.preventDefault();
      if (
        drop_sdp_state === "drop-sdp-disabled" ||
        drop_sdp_state === "drop-sdp-illegal-drop"
      ) {
        return;
      }
      drop_sdp_state = "drop-sdp-enabled";
      await tick();
    });

    dropItem.addEventListener("drop", async (event) => {
      event.preventDefault();
      if (
        drop_sdp_state === "drop-sdp-disabled" ||
        drop_sdp_state === "drop-sdp-illegal-drop"
      ) {
        return;
      }

      drop_sdp_state = "drop-sdp-dropping";
      await tick();
      try {
        let conversation_info = null;
        if (event.dataTransfer.files.length > 0) {
          const file = event.dataTransfer.files[0];
          conversation_info = await window.estac.dropBuffer({
            name: file.name,
            data: await file.arrayBuffer(),
          });
        } else {
          const url = event.dataTransfer.getData("text/uri-list");
          conversation_info = await window.estac.dropUrl(url);
        }

        drop_sdp_state = "drop-sdp-disabled"; // Readable information obtained
        await tick();
        window.logger.logMessage(
          `[New Chat Subpage]: SDP dropped successfully: ${conversation_info.tmsp}`,
        );

        if (!conversation_info) {
          throw new Error("No valide information obtained from dropped SDP.");
        }

        if (gen_sdp_state === "gen-sdp-enabled") {
          // No generation, this is the callee side
          genSDPOnDrop(conversation_info);
        } else {
          // Assume that this is the caller side
          genValideConversation(conversation_info);
        }
      } catch (error) {
        window.logger.logMessage(
          `[New Chat Subpage]: Error during SDP drop: (${error})`,
        );
        drop_sdp_state = "drop-sdp-illegal-drop";
        await tick();
        setTimeout(async () => {
          drop_sdp_state = "drop-sdp-enabled";
          await tick();
        }, 1000);
        return;
      }
    });
  }

  function genHelpTxt() {
    switch (gen_sdp_state) {
      case "gen-sdp-enabled":
        return "Click here to generate Estac file.";
      case "gen-sdp-disabled":
        return "Estac file generation in progress.";
      case "gen-sdp-allow-drag":
        return "Drag and drop the Estac file";
      default:
        return "Click here to generate Estac file.";
    }
  }

  function dropHelpTxt() {
    switch (drop_sdp_state) {
      case "drop-sdp-enabled":
        return "Drop the Estac file here to receive Estac file.";
      case "drop-sdp-enabled-dragover":
        return "Release to drop the Estac file here.";
      case "drop-sdp-disabled":
        return "Estac file received successfully.";
      case "drop-sdp-illegal-drop":
        return "Wrong or corrupted file dropped.";
      case "drop-sdp-dropping":
        return "Receiving Estac file...";
      default:
        return "Drop the Estac file here.";
    }
  }

  onMount(() => {
    // set up drop area on mount
    setDropComp("drop-sdp-enabled");
  });

  onDestroy(() => {
    if (browser) {
      if (!isValidConversation && conversation_id) {
        window.logger.logMessage(
          `[New Chat Subpage]: Cleaning up invalid conversation ID: ${conversation_id}`,
        );
      }
    }
  });
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
  <p class="title">Generate Estac</p>
  <hr class="sepline" />
  <div
    role="button"
    aria-labelledby="Generate SDP"
    tabindex=""
    onclick={genSDPOnClick}
    onkeydown={(e) => e.key === "Enter" && genSDPOnClick()}
    class="gen-sdp-base {gen_sdp_state}"
  >
    {#if gen_sdp_state === "gen-sdp-enabled"}
      <IconGensdp scale="2" />
    {:else if gen_sdp_state === "gen-sdp-disabled"}
      <IconHourglass scale="2" />
    {:else if gen_sdp_state === "gen-sdp-allow-drag"}
      <IconDragclick scale="2" />
    {/if}
    <p class="help-text">{genHelpTxt()}</p>
  </div>
  <p class="title">Receive Estac</p>
  <hr class="sepline" />
  <div class="drop-sdp-base {drop_sdp_state}">
    {#if drop_sdp_state === "drop-sdp-enabled"}
      <IconOpenfile scale="2" />
    {:else if drop_sdp_state === "drop-sdp-enabled-dragover"}
      <IconDragclick scale="2" />
    {:else if drop_sdp_state === "drop-sdp-disabled"}
      <IconCheck scale="2" />
    {:else if drop_sdp_state === "drop-sdp-illegal-drop"}
      <IconBlock scale="2" />
    {:else if drop_sdp_state === "drop-sdp-dropping"}
      <IconHourglass scale="2" />
    {/if}
    <p class="help-text">{dropHelpTxt()}</p>
  </div>
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

  .gen-sdp-base {
    margin: 20px;
    border-radius: 15px;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
  }

  .gen-sdp-enabled {
    border: 2px dashed var(--clr-surface-tonal-a30);
    cursor: pointer;
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
    border: 2px dashed var(--clr-surface-tonal-a30);
    cursor: not-allowed;
    background-color: var(--clr-surface-tonal-a10);
    color: var(--clr-surface-tonal-a30);
    fill: var(--clr-surface-tonal-a30);
  }

  .gen-sdp-allow-drag {
    border: 2px dashed var(--clr-primary-a30);
    background-color: var(--clr-surface-a20);
    color: var(--clr-primary-a30);
    fill: var(--clr-primary-a30);
  }

  .drop-sdp-base {
    margin: 20px;
    border-radius: 15px;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
  }

  .drop-sdp-enabled {
    border: 2px dashed var(--clr-surface-tonal-a30);
    background-color: var(--clr-surface-tonal-a10);
    color: var(--clr-surface-tonal-a30);
    fill: var(--clr-surface-tonal-a30);
  }

  .drop-sdp-illegal-drop {
    cursor: not-allowed;
    border: 2px dashed var(--clr-danger-a10);
    background-color: var(--clr-danger-a0);
    color: var(--clr-danger-a10);
    fill: var(--clr-danger-a10);
  }

  .drop-sdp-enabled-dragover {
    border: 2px dashed var(--clr-primary-a30);
    background-color: var(--clr-surface-tonal-a20);
    color: var(--clr-primary-a30);
    fill: var(--clr-primary-a30);
  }

  .drop-sdp-disabled {
    border: 2px dashed var(--clr-primary-a30);
    background-color: var(--clr-surface-tonal-a20);
    color: var(--clr-primary-a30);
    fill: var(--clr-primary-a30);
  }

  .drop-sdp-dropping {
    border: 2px dashed var(--clr-primary-a30);
    background-color: var(--clr-surface-tonal-a20);
    color: var(--clr-primary-a30);
    fill: var(--clr-primary-a30);
  }

  .help-text {
    font-size: 18px;
  }
</style>
