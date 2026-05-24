import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Webhook signature verification utility
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return hash === signature
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-webhook-signature') || ''
    const webhookSecret = process.env.DEPOSIT_WEBHOOK_SECRET || 'your-webhook-secret'

    // Verify webhook signature (optional but recommended)
    if (signature && !verifyWebhookSignature(body, signature, webhookSecret)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)

    // Log the event
    console.log('[Deposits Webhook]', {
      timestamp: new Date().toISOString(),
      event_type: event.type,
      event_id: event.id,
      amount: event.amount,
      currency: event.currency,
      user_id: event.user_id,
      status: event.status,
    })

    // Handle different deposit event types
    switch (event.type) {
      case 'deposit.initiated':
        // Log deposit initiated
        console.log('Deposit initiated:', {
          user_id: event.user_id,
          amount: event.amount,
          currency: event.currency,
        })
        break

      case 'deposit.completed':
        // Process completed deposit
        console.log('Deposit completed:', {
          user_id: event.user_id,
          amount: event.amount,
          transaction_id: event.transaction_id,
        })
        // Update user balance, create transaction record, etc.
        break

      case 'deposit.failed':
        // Handle failed deposit
        console.log('Deposit failed:', {
          user_id: event.user_id,
          reason: event.reason,
        })
        break

      default:
        console.log('Unknown event type:', event.type)
    }

    // Always return 200 OK to acknowledge receipt
    return NextResponse.json(
      { success: true, event_id: event.id },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Deposits Webhook Error]', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
