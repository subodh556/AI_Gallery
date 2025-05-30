import { Stripe } from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("✅ Stripe event received:", event.type);
  } catch (error: any) {
    console.error("❌ Webhook signature verification failed:", error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      if (!session?.metadata?.userId) {
        return new NextResponse('User ID is missing in metadata', { status: 400 });
      }

      const subscriptionId = session.subscription as string;
      const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId);
      const subscription = subscriptionResponse as Stripe.Subscription;

      const currentPeriodEnd = subscription.items.data[0]?.current_period_end;
      const periodEnd = currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : null;

      await prismadb.userSubscription.create({
        data: {
          userId: session.metadata.userId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: periodEnd,
        }
      });

      console.log("✅ Created new subscription in DB");
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;

      if (!(invoice as any).subscription) {
        console.error("No subscription ID found on invoice:", invoice.id);
        return new NextResponse('No subscription found', { status: 400 });
      }
      const subscriptionId = (invoice as any).subscription as string;
      const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId);
      const subscription = subscriptionResponse as Stripe.Subscription;

      const currentPeriodEnd = subscription.items.data[0]?.current_period_end;
      const periodEnd = currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : null;

      // Optional: Store customer -> userId mapping in DB during checkout
      const existingRecord = await prismadb.userSubscription.findUnique({
        where: {
          stripeSubscriptionId: subscription.id
        }
      });

      if (!existingRecord) {
        console.error("❌ No subscription found in DB for:", subscription.id);
        return new NextResponse('No subscription record in DB', { status: 400 });
      }

      await prismadb.userSubscription.update({
        where: {
          stripeSubscriptionId: subscription.id
        },
        data: {
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: periodEnd,
        },
      });

      console.log("✅ Updated subscription period");
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new NextResponse(null, { status: 200 });
}
