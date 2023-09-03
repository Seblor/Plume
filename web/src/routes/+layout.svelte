<script>
  import "../app.postcss";
  import Header from "./Header.svelte";
  import "./styles.css";
</script>

<div class="app">
  <Header />

  <main>
    <slot />
  </main>

  <footer class="flex">
    <p class="w-1/3 flex place-content-start gap-1"></p>
    <p class="w-1/3 flex place-content-center gap-1">
      Made with ❤️ by <a href="https://github.com/seblor">Seblor</a>
    </p>
    <p class="w-1/3 flex place-content-end px-6 gap-6">
      <a href="/terms">Terms of Services</a>
      <a href="/privacy">Privacy Policy</a>
    </p>
  </footer>
</div>

<style lang="scss">
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-height: 100vh;
    align-content: stretch;
    width: 100vw;
    overflow: hidden;
  }

  main {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
    flex-wrap: wrap;
  }

  footer {
    display: flex;
    padding: 0.5em;

    a {
      font-weight: bold;
    }
  }

  @media (min-width: 480px) {
    footer {
      padding: 0.5em 0;
    }
  }
</style>
