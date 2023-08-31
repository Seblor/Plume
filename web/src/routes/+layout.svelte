<script>
  import { dev } from '$app/environment';
  import { inject } from '@vercel/analytics';
  import "../app.postcss";
  import Header from "./Header.svelte";
  import "./styles.css";

  inject({ mode: dev ? 'development' : 'production' });
</script>

<div class="app">
  <Header />

  <main>
    <slot />
  </main>

  <footer>
    <p>
      Made with ❤️ by <a href="https://github.com/seblor">Seblor</a>
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
    flex-direction: column;
    justify-content: center;
    align-items: center;
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
