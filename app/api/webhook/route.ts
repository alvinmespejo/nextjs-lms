import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function POST(req: Request) {
  const body = await req.text();
  const stripeHeader = headers().get('Stripe-Signature') as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      stripeHeader,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json(`Stripe webhook error: ${err.message}`, {
      status: 500,
    });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session?.metadata?.userId;
  const courseId = session?.metadata?.courseId;

  if (event.type === 'checkout.session.completed') {
    if (!userId || !courseId) {
      return NextResponse.json(`Stripe webhook error: Missing metadata.`, {
        status: 400,
      });
    }

    await db.purchase.create({
      data: {
        userId,
        courseId,
      },
    });

    return NextResponse.json('Stripe webhook: Checkout complete.', {
      status: 200,
    });
  }

  return NextResponse.json(null, {
    status: 200,
  });
}
