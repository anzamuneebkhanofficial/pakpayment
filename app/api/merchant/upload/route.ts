import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import crypto from 'crypto';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: 'Cloudinary storage credentials are not configured on the server.' },
      { status: 500 }
    );
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let fileToUpload: string | null = null;
    let mimeType: string = '';
    let fileSizeBytes: number = 0;
    let subfolder: string = '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      fileToUpload = body.file || null;
      subfolder = body.folder || '';
      
      if (fileToUpload) {
        // Detect MIME from data URI
        const match = fileToUpload.match(/^data:([^;]+);base64,/);
        if (match) {
          mimeType = match[1];
          const base64Content = fileToUpload.replace(/^data:[^;]+;base64,/, '');
          fileSizeBytes = Math.round((base64Content.length * 3) / 4);
        }
      }
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      const requestedFolder = formData.get('folder');
      if (requestedFolder && typeof requestedFolder === 'string') {
        subfolder = requestedFolder;
      }

      if (file && typeof file !== 'string') {
        mimeType = file.type || '';
        fileSizeBytes = file.size;
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        fileToUpload = `data:${mimeType || 'image/png'};base64,${buffer.toString('base64')}`;
      } else if (typeof file === 'string') {
        fileToUpload = file;
        const match = file.match(/^data:([^;]+);base64,/);
        if (match) {
          mimeType = match[1];
          const base64Content = file.replace(/^data:[^;]+;base64,/, '');
          fileSizeBytes = Math.round((base64Content.length * 3) / 4);
        }
      }
    }

    // 1. Validation: File Existence
    if (!fileToUpload) {
      return NextResponse.json(
        { error: 'No image file was provided for upload.' },
        { status: 400 }
      );
    }

    // 2. Validation: Image Format Check
    if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
      return NextResponse.json(
        {
          error: `Invalid file format (${mimeType}). Only PNG, JPG, WebP, GIF, and SVG images are allowed.`,
        },
        { status: 400 }
      );
    }

    // 3. Validation: File Size Check (Max 5MB)
    if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `File is too large (${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB). Maximum allowed size is 5 MB.`,
        },
        { status: 400 }
      );
    }

    // 4. Resolve Parent Folder: Always root to 'Payments'
    const cleanSubfolder = subfolder
      ? subfolder.replace(/[^a-zA-Z0-9_\-\/]/g, '').replace(/^\/+|\/+$/g, '')
      : '';
    const targetFolder = cleanSubfolder ? `Payments/${cleanSubfolder}` : 'Payments';

    // 5. Generate HMAC-SHA1 Signature (alphabetical param order required by Cloudinary)
    const timestamp = Math.floor(Date.now() / 1000);
    const strToSign = `folder=${targetFolder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

    // 6. Direct Stream to Cloudinary
    const uploadFormData = new FormData();
    uploadFormData.append('file', fileToUpload);
    uploadFormData.append('api_key', apiKey);
    uploadFormData.append('timestamp', timestamp.toString());
    uploadFormData.append('folder', targetFolder);
    uploadFormData.append('signature', signature);

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: uploadFormData,
      }
    );

    const result = await cloudinaryRes.json();

    if (!cloudinaryRes.ok || !result.secure_url) {
      console.error('Cloudinary API upload error:', result);
      return NextResponse.json(
        { error: result.error?.message || 'Failed to upload image to Cloudinary.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      folder: targetFolder,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
    });
  } catch (error: any) {
    console.error('Upload handler exception:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during upload.' },
      { status: 500 }
    );
  }
}

// Support deletion from Cloudinary for lifecycle management
export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Cloudinary credentials missing.' }, { status: 500 });
  }

  try {
    const { publicId } = await req.json();
    if (!publicId) {
      return NextResponse.json({ error: 'Missing publicId parameter.' }, { status: 400 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const strToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const destroyRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await destroyRes.json();
    return NextResponse.json({ success: result.result === 'ok', result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
