import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectToDatabase from '@/lib/db';
import CustomQR from '@/models/CustomQR';

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const qrCodes = await CustomQR.find({ userId: session.user.id }).sort({ createdAt: -1 });
    
    return NextResponse.json({ qrCodes });
  } catch (error) {
    console.error('Failed to fetch QR codes:', error);
    return NextResponse.json({ error: 'Failed to fetch QR codes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { title, type, amount, description, colors } = data;

    if (!title || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();
    
    const newQR = await CustomQR.create({
      userId: session.user.id,
      title,
      type,
      amount: type === 'fixed_amount' ? Number(amount) : undefined,
      description: type === 'fixed_amount' ? description : undefined,
      colors: colors || { dark: '#000000', light: '#ffffff' }
    });

    return NextResponse.json({ success: true, qrCode: newQR }, { status: 201 });
  } catch (error) {
    console.error('Failed to create QR code:', error);
    return NextResponse.json({ error: 'Failed to create QR code' }, { status: 500 });
  }
}
