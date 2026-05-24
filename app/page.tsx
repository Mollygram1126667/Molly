export default function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Trading Platform</h1>
      <p>Webhooks are ready to receive events from your payment provider.</p>
      
      <section style={{ marginTop: '2rem' }}>
        <h2>Webhook URLs</h2>
        <p><strong>Deposits Webhook:</strong></p>
        <code style={{ display: 'block', background: '#f0f0f0', padding: '1rem', marginBottom: '1rem' }}>
          POST /api/webhooks/deposits
        </code>
        
        <p><strong>Trading Webhook:</strong></p>
        <code style={{ display: 'block', background: '#f0f0f0', padding: '1rem' }}>
          POST /api/webhooks/trading
        </code>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Setup Instructions</h2>
        <ol>
          <li>Copy your webhook URLs above</li>
          <li>Add them to your payment provider settings</li>
          <li>Use the webhook secret provided by your provider</li>
          <li>Events will be received and logged automatically</li>
        </ol>
      </section>
    </main>
  )
}
