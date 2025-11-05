<script>
</script>

<svelte:head></svelte:head>

<slot />

<style>
  @font-face {
    font-family: "Figtree";
    src: url("/fonts/Figtree/Figtree-VariableFont_wght.ttf") format("truetype");
    font-weight: 100 900;
    font-style: normal;
  }

  :root {
    font-family: "Figtree";
  }
</style>
