import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Next.js App Router: disable body parsing so we get raw body for Stripe signature
export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(request) {
  const sig = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const body = await request.text();
    if (webhookSecret && sig) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (err) {
    return Response.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    if (session.payment_status === 'paid') {
      try {
        const supabase = getSupabase();
        if (supabase) {
          const clientRef = session.client_reference_id || null;
          await supabase.from('funnel_events').insert({
            event: 'paid_success',
            session_id: clientRef,
            page: null,
            source: 'stripe_webhook',
            meta: {
              stripe_session_id: session.id,
              amount_total: session.amount_total,
              currency: session.currency,
              customer: session.customer,
            },
          });
        }
      } catch (err) {
        console.error('funnel_events insert failed:', err.message);
      }
    }
  }

  return Response.json({ received: true });
}
