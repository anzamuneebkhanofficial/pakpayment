import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectToDatabase from '@/lib/db';
import CustomQR from '@/models/CustomQR';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Ensure the QR code belongs to the user before deleting
    const deletedQR = await CustomQR.findOneAndDelete({
      _id: id,
      userId: session.user.id
    });

    if (!deletedQR) {
      return NextResponse.json({ error: 'QR code not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete QR code:', error);
    return NextResponse.json({ error: 'Failed to delete QR code' }, { status: 500 });
  }
}
