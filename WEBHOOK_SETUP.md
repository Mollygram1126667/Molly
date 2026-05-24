# Trading Platform - Webhook Setup Guide

## Available Webhook Endpoints

Your application has two main webhook endpoints ready to receive events:

### 1. Deposits Webhook
**URL:** `https://yourdomain.com/api/webhooks/deposits`

**Description:** Handles all deposit-related events (initiated, completed, failed)

**Event Types:**
- `deposit.initiated` - User initiated a deposit
- `deposit.completed` - Deposit successfully processed
- `deposit.failed` - Deposit failed for some reason

**Expected Payload:**
```json
{
  "id": "event_123",
  "type": "deposit.completed",
  "user_id": "user_456",
  "amount": 1000,
  "currency": "USD",
  "transaction_id": "txn_789",
  "status": "completed",
  "timestamp": "2024-05-24T12:00:00Z"
}
```

### 2. Trading Webhook
**URL:** `https://yourdomain.com/api/webhooks/trading`

**Description:** Handles all trading-related events (trades created, executed, cancelled, failed)

**Event Types:**
- `trade.created` - New trade order created
- `trade.executed` - Trade successfully executed
- `trade.cancelled` - Trade was cancelled
- `trade.failed` - Trade execution failed

**Expected Payload:**
```json
{
  "id": "event_456",
  "type": "trade.executed",
  "user_id": "user_789",
  "order_id": "order_123",
  "symbol": "AAPL",
  "quantity": 10,
  "price": 150.50,
  "execution_price": 150.45,
  "side": "buy",
  "total_value": 1504.50,
  "status": "executed",
  "timestamp": "2024-05-24T12:00:00Z"
}
```

## Security Setup

### Webhook Signature Verification

Both endpoints support HMAC-SHA256 signature verification for security:

1. **Add Webhook Secrets** (via environment variables):
   ```
   DEPOSIT_WEBHOOK_SECRET=your-deposit-secret-key
   TRADING_WEBHOOK_SECRET=your-trading-secret-key
   ```

2. **Include Signature Header** in your webhook requests:
   ```
   x-webhook-signature: sha256_hash_of_body
   ```

3. **Signature Generation** (Example in Node.js):
   ```javascript
   const crypto = require('crypto');
   
   const payload = JSON.stringify(eventData);
   const signature = crypto
     .createHmac('sha256', webhookSecret)
     .update(payload)
     .digest('hex');
   ```

## Implementation Steps

### Step 1: Deploy Your Application
```bash
npm run build
npm start
# or deploy to Vercel
```

### Step 2: Configure Webhook URLs in Your Provider
Go to your payment/trading provider settings and add:
- **Deposit Webhook:** `https://yourdomain.com/api/webhooks/deposits`
- **Trading Webhook:** `https://yourdomain.com/api/webhooks/trading`

### Step 3: Set Environment Variables
Add the webhook secrets to your Vercel project:
```bash
vercel env add DEPOSIT_WEBHOOK_SECRET
vercel env add TRADING_WEBHOOK_SECRET
```

### Step 4: Test the Webhooks
Most providers offer a "Send Test Event" feature in their dashboard. Use it to verify everything is working.

### Step 5: Monitor Events
Check your server logs to see incoming webhook events:
```
[Deposits Webhook] {
  timestamp: '2024-05-24T12:00:00.000Z',
  event_type: 'deposit.completed',
  event_id: 'event_123',
  amount: 1000,
  currency: 'USD',
  user_id: 'user_456',
  status: 'completed'
}
```

## API Response Requirements

**Always respond with 200 OK** to acknowledge receipt (even if there's an error in processing):

```json
{
  "success": true,
  "event_id": "event_123"
}
```

This tells your provider that the webhook was received successfully. If you don't respond with 200, the provider will retry.

## Common Webhook Headers

Your application checks for these standard headers:
- `x-webhook-signature` - HMAC-SHA256 signature of the request body
- `content-type` - Should be `application/json`

## Error Handling

The webhooks handle errors gracefully:
- Invalid signatures → Return 401 Unauthorized
- Processing errors → Return 500 Server Error
- All events are logged with full context for debugging

## Database Integration (Optional)

To make your webhooks actually functional, you should store transaction data. Add a database:

**Example:** Supabase PostgreSQL
```sql
CREATE TABLE deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  transaction_id TEXT UNIQUE,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  order_id TEXT UNIQUE,
  symbol VARCHAR(10) NOT NULL,
  quantity DECIMAL(15, 2) NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  side VARCHAR(10) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Testing Locally

To test webhooks locally:

1. Use ngrok or Vercel Preview to get a public URL:
   ```bash
   npx ngrok http 3000
   # Get URL like https://xxx.ngrok.io
   ```

2. Update your provider settings to use the ngrok URL

3. Send test events from your provider dashboard

## Support

For issues with webhooks:
1. Check server logs for error messages
2. Verify the webhook secret is correct
3. Confirm the payload format matches expected structure
4. Test with a simple curl command:

```bash
curl -X POST https://yourdomain.com/api/webhooks/deposits \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test_event",
    "type": "deposit.completed",
    "user_id": "user_123",
    "amount": 100,
    "currency": "USD",
    "status": "completed"
  }'
```
