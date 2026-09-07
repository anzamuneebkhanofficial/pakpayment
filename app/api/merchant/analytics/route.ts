import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectToDatabase from '@/lib/db';
import MerchantWidgetConfig from '@/models/MerchantWidgetConfig';
import PaymentClaim from '@/models/PaymentClaim';
import WidgetEvent from '@/models/WidgetEvent';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  await connectToDatabase();
  const config = await MerchantWidgetConfig.findOne({ userId });
  if (!config) {
    return NextResponse.json({
      views: 0,
      claims: 0,
      confirmedAmount: 0,
      conversionRate: 0,
      methodBreakdown: [],
      recentEvents: []
    });
  }

  const { appId } = config;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [viewsCount, methodSelectedCount, totalClaims, confirmedClaims, methodStats] = await Promise.all([
    WidgetEvent.countDocuments({ appId, type: 'view', createdAt: { $gte: thirtyDaysAgo } }),
    WidgetEvent.countDocuments({ appId, type: 'method_selected', createdAt: { $gte: thirtyDaysAgo } }),
    PaymentClaim.countDocuments({ userId, createdAt: { $gte: thirtyDaysAgo } }),
    PaymentClaim.find({ userId, status: 'confirmed', createdAt: { $gte: thirtyDaysAgo } }),
    PaymentClaim.aggregate([
      { $match: { userId } },
      { $group: { _id: '$methodUsed', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
    ])
  ]);

  const confirmedAmount = confirmedClaims.reduce((acc, c) => acc + (c.amount || 0), 0);
  const conversionRate = viewsCount > 0 ? ((totalClaims / viewsCount) * 100).toFixed(1) : 0;

  return NextResponse.json({
    appId,
    views: viewsCount,
    methodSelections: methodSelectedCount,
    claims: totalClaims,
    confirmedAmount,
    conversionRate: Number(conversionRate),
    methodBreakdown: methodStats.map(s => ({ method: s._id, count: s.count, totalAmount: s.totalAmount || 0 })),
  });
}
