<svelte:options customElement="explaination-popup" />

<script>
  import "$lib/theme.css";
  export let message = "Default explaination message";
  export const self = {
    popup: () => {},
    unpop: () => {},
  };
</script>
