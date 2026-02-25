import Stripe from 'stripe';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '');
}

export async function POST(request) {
  try {
    const { mode, returnTo } = await request.json();

    const origin = request.headers.get('origin') || 'https://meihua-app.vercel.app';
    const returnPath = returnTo === '/' ? '/' : '/mingpan';

    const priceId = mode === 'daypass'
      ? process.env.STRIPE_DAYPASS_PRICE_ID
      : process.env.STRIPE_SUBSCRIPTION_PRICE_ID;

    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json({ error: 'Payment not configured' }, { status: 500 });
    }
    if (!priceId) {
      return Response.json({ error: 'Price not configured' }, { status: 500 });
    }

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: mode === 'daypass' ? 'payment' : 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}${returnPath}?unlocked=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${returnPath}`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err?.message || err);
    return Response.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
