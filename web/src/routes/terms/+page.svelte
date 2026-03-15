<svelte:head>
  <title>Terms of Service for Plume</title>
  <meta name="description" content="Terms of Service for Plume Discord Bot" />
</svelte:head>

<div class="legal-page scrollbar">
  <article class="legal-doc">
    <header class="doc-header">
      <h1>Terms of Service</h1>
      <p class="effective-date">Effective Date: 2023-09-04</p>
    </header>

    <section>
      <h2>1. Acceptance of Terms</h2>
      <p>
        By using the Plume Discord Bot ("the Bot"), you agree to comply with and
        be bound by these Terms of Service. If you do not agree with any part of
        these terms, you should not use the Bot.
      </p>
    </section>

    <section>
      <h2>2. Use of the Bot</h2>
      <p>
        <strong>2.1. Eligibility:</strong> You must be at least 13 years old to use
        the Bot.
      </p>
      <p>
        <strong>2.2. Authorized Use:</strong> You may use the Bot solely for its
        intended purposes, which include logging voice chat activity and channel
        modifications on Discord servers.
      </p>
      <p>
        <strong>2.3. Prohibited Use:</strong> You may not use the Bot for any unlawful,
        abusive, or harmful purposes. This includes, but is not limited to, harassment,
        spamming, or any activity that violates Discord's Terms of Service or the
        laws of your jurisdiction.
      </p>
    </section>

    <section>
      <h2>3. Data Privacy</h2>
      <p>
        <strong>3.1. Data Collection:</strong> The Bot collects and logs data related
        to voice chat activity and channel modifications on Discord servers. This
        data is stored on Discord's servers as an "attachment" in a message on your
        Discord server, on which you have full control.
      </p>
      <p>
        <strong>3.2. Configuration Data:</strong> The Bot may store configuration
        data for each server, specifically the server ID and the ID of the channel
        where the Bot should send log messages.
      </p>
      <p>
        <strong>3.3. Data Security:</strong> We take reasonable measures to protect
        the data collected by the Bot. However, we cannot guarantee the security
        of your data and disclaim any liability for data breaches or unauthorized
        access.
      </p>
    </section>

    <section>
      <h2>4. User Content</h2>
      <p>
        <strong>4.1. Ownership:</strong> You retain ownership of all content and
        data that you submit or upload to Discord using the Bot.
      </p>
      <p>
        <strong>4.2. License:</strong> By using the Bot, you grant us a non-exclusive,
        worldwide, royalty-free license to use, display, and distribute your content
        for the purpose of providing the Bot's services.
      </p>
    </section>

    <section>
      <h2>5. Intellectual Property</h2>
      <p>
        The Bot and its associated logo, design, and content are protected by
        intellectual property laws. You may not copy, modify, or distribute the
        Bot or its associated materials without our prior written consent.
      </p>
    </section>

    <section>
      <h2>6. Termination</h2>
      <p>
        We reserve the right to terminate or suspend your access to the Bot at
        our discretion, without notice, for any violation of these terms or for
        any reason we deem necessary.
      </p>
    </section>

    <section>
      <h2>7. Disclaimer of Warranties</h2>
      <p>
        The Bot is provided "as-is" without any warranties, express or implied.
        We do not guarantee the Bot's accuracy, reliability, or availability.
      </p>
    </section>

    <section>
      <h2>8. Limitation of Liability</h2>
      <p>
        We are not liable for any damages, including but not limited to, direct,
        indirect, incidental, or consequential damages, arising out of the use
        or inability to use the Bot.
      </p>
    </section>

    <section>
      <h2>9. Changes to Terms</h2>
      <p>
        We may update these Terms of Service from time to time. Your continued
        use of the Bot constitutes acceptance of any changes.
      </p>
    </section>

    <section>
      <h2>10. Contact Us</h2>
      <p>
        Contact us via the <a
          href="https://discord.gg/RDP6xg2Tf2"
          target="_blank"
          rel="noopener">Discord support server</a
        >
        or via Discord DM to <code>@seblor</code> (ID:
        <code>87874287494508544</code>).
      </p>
    </section>
  </article>
</div>

<style>
  .legal-page {
    height: 100%;
    overflow-y: auto;
    padding: 2.5rem 1.5rem;
  }

  .legal-doc {
    max-width: 720px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .doc-header {
    border-bottom: 1px solid var(--border);
    padding-bottom: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .doc-header h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    text-align: left;
  }

  .effective-date {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin: 0;
  }

  section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  section h2 {
    font-size: 1.125rem;
    color: var(--text-primary);
    font-weight: 600;
    padding-bottom: 0.375rem;
    border-bottom: 1px solid var(--border);
    text-align: left;
  }

  section p {
    line-height: 1.65;
    font-size: 0.925rem;
  }
</style>
