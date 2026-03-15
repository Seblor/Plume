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

  <footer>
    <p class="footer-credit">Made with ❤️ by <a href="https://github.com/seblor">Seblor</a></p>
    <nav class="footer-links">
      <a href="/terms">Terms of Service</a>
      <a href="/privacy">Privacy Policy</a>
    </nav>
  </footer>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-height: 100vh;
    width: 100vw;
    overflow: hidden;
  }

  main {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
  }

  footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.25rem;
    padding: 0.5rem 1.25rem;
    border-top: 1px solid var(--border);
    background: rgba(13, 17, 23, 0.6);
    flex-shrink: 0;
  }

  .footer-credit {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin: 0;
    line-height: 1;
  }

  .footer-credit a {
    color: var(--text-secondary);
    font-weight: 500;
  }

  .footer-credit a:hover {
    color: var(--text-primary);
  }

  .footer-links {
    display: flex;
    gap: 1rem;
  }

  .footer-links a {
    font-size: 0.8rem;
    color: var(--text-muted);
    text-decoration: none;
    transition: color var(--transition);
  }

  .footer-links a:hover {
    color: var(--text-secondary);
    text-decoration: none;
  }
</style>
