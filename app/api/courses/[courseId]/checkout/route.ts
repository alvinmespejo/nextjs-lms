import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { currentUser } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await currentUser();
    if (!user || !user.id || !user?.emailAddresses?.[0].emailAddress) {
      return NextResponse.json('Unauthenticated request.', { status: 401 });
    }

    const [course, purchase] = await Promise.all([
      db.course.findUnique({
        where: {
          isPublished: true,
          id: params.courseId,
        },
      }),
      db.purchase.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: params.courseId,
          },
        },
      }),
    ]);

    if (purchase) {
      return NextResponse.json('You already purchased the course.', {
        status: 400,
      });
    }

    if (!course) {
      return NextResponse.json('Invalid resource.', { status: 404 });
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        quantity: 1,
        price_data: {
          currency: 'USD',
          product_data: {
            name: course.title,
            description: course.description!,
          },
          unit_amount: Math.round(course.price! * 100),
        },
      },
    ];

    let stripeCustomer = await db.stripeCustomer.findUnique({
      where: { userId: user.id },
      select: { stripeCustomerId: true },
    });

    if (!stripeCustomer) {
      const customer = await stripe.customers.create({
        email: user.emailAddresses[0].emailAddress,
      });

      stripeCustomer = await db.stripeCustomer.create({
        data: {
          userId: user.id,
          stripeCustomerId: customer.id,
        },
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomer.stripeCustomerId,
      line_items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?cancelled=1`,
      metadata: {
        courseId: course.id,
        userId: user.id,
        courseTitle: course.title,
        courseDescription: course.description!,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    console.log('[COURSE CHECKOUT POST]', err);
    return NextResponse.json(err, {
      status: 500,
    });
  }
}
