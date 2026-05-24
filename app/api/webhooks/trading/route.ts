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
    const webhookSecret = process.env.TRADING_WEBHOOK_SECRET || 'your-webhook-secret'

    // Verify webhook signature (optional but recommended)
    if (signature && !verifyWebhookSignature(body, signature, webhookSecret)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)

    // Log the event
    console.log('[Trading Webhook]', {
      timestamp: new Date().toISOString(),
      event_type: event.type,
      event_id: event.id,
      symbol: event.symbol,
      quantity: event.quantity,
      price: event.price,
      user_id: event.user_id,
      status: event.status,
    })

    // Handle different trading event types
    switch (event.type) {
      case 'trade.created':
        // Log trade created
        console.log('Trade created:', {
          user_id: event.user_id,
          symbol: event.symbol,
          quantity: event.quantity,
          price: event.price,
          side: event.side, // 'buy' or 'sell'
        })
        break

      case 'trade.executed':
        // Process executed trade
        console.log('Trade executed:', {
          user_id: event.user_id,
          order_id: event.order_id,
          executed_quantity: event.executed_quantity,
          execution_price: event.execution_price,
          total_value: event.total_value,
        })
        // Update portfolio, create transaction record, etc.
        break

      case 'trade.cancelled':
        // Handle cancelled trade
        console.log('Trade cancelled:', {
          user_id: event.user_id,
          order_id: event.order_id,
          reason: event.reason,
        })
        break

      case 'trade.failed':
        // Handle failed trade
        console.log('Trade failed:', {
          user_id: event.user_id,
          order_id: event.order_id,
          error_message: event.error_message,
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
    console.error('[Trading Webhook Error]', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
