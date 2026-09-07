import { RateLimiterMemory } from 'rate-limiter-flexible';
import { NextResponse } from 'next/server';

const merchantLimiter = new RateLimiterMemory({
  points: 50, // 50 requests
  duration: 60, // per 60 seconds by default
});

const publicClaimLimiter = new RateLimiterMemory({
  points: 10, // 10 claims
  duration: 60, // per minute per IP
});

export async function rateLimitMerchant(userId: string) {
  try {
    await merchantLimiter.consume(userId);
    return null;
  } catch (rejRes) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
}

export async function rateLimitPublicClaim(ip: string) {
  try {
    await publicClaimLimiter.consume(ip);
    return null;
  } catch (rejRes) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
}
