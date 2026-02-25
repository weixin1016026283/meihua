import Stripe from 'stripe';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '');
}

export async function POST(request) {
  try {
    const { sessionId } = await request.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json({ error: 'Payment not configured' }, { status: 500 });
    }
    if (!sessionId) {
      return Response.json({ error: 'No session ID provided' }, { status: 400 });
    }

    const stripe = getStripe();

    // Retrieve the checkout session to get the subscription ID
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const subscriptionId = session.subscription;

    if (!subscriptionId) {
      return Response.json({ error: 'No subscription found for this session' }, { status: 404 });
    }

    // Cancel the subscription at period end (user keeps access until end of billing period)
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    return Response.json({
      ok: true,
      cancelAt: subscription.current_period_end,
    });
  } catch (err) {
    console.error('Cancel subscription error:', err?.message || err);
    return Response.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
