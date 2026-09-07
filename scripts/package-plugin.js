const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Standard CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c >>> 0;
}

function calcCrc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function dosDateTime(date) {
  const d = date || new Date();
  const time = ((d.getHours() << 11) | (d.getMinutes() << 5) | (Math.floor(d.getSeconds() / 2))) & 0xFFFF;
  const dt = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;
  return { time, date: dt };
}

function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/$/, '');
  }
  const envLocalPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath, 'utf8');
    const match = content.match(/NEXT_PUBLIC_APP_URL\s*=\s*([^\r\n#]+)/);
    if (match) return match[1].trim().replace(/^['"]|['"]$/g, '').replace(/\/$/, '');
  }
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/NEXT_PUBLIC_APP_URL\s*=\s*([^\r\n#]+)/);
    if (match) return match[1].trim().replace(/^['"]|['"]$/g, '').replace(/\/$/, '');
  }
  return 'http://localhost:3000';
}

function createZip(files, outputPath) {
  const localHeaders = [];
  const centralHeaders = [];
  let offset = 0;

  for (const file of files) {
    const cleanName = file.name.replace(/\\/g, '/');
    const nameBuf = Buffer.from(cleanName, 'utf8');
    const uncompressed = file.content;
    const compressed = zlib.deflateRawSync(uncompressed, { level: 9 });
    const crc = calcCrc32(uncompressed);
    const { time, date } = dosDateTime();

    // Local file header (30 bytes + name)
    const localHeader = Buffer.alloc(30 + nameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(8, 8);
    localHeader.writeUInt16LE(time, 10);
    localHeader.writeUInt16LE(date, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressed.length, 18);
    localHeader.writeUInt32LE(uncompressed.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);
    nameBuf.copy(localHeader, 30);

    const headerOffset = offset;
    offset += localHeader.length + compressed.length;
    localHeaders.push(localHeader, compressed);

    // Central directory header (46 bytes + name)
    const centralHeader = Buffer.alloc(46 + nameBuf.length);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(0x031e, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(8, 10);
    centralHeader.writeUInt16LE(time, 12);
    centralHeader.writeUInt16LE(date, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressed.length, 20);
    centralHeader.writeUInt32LE(uncompressed.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0x81a40000, 38);
    centralHeader.writeUInt32LE(headerOffset, 42);
    nameBuf.copy(centralHeader, 46);

    centralHeaders.push(centralHeader);
  }

  const centralDirOffset = offset;
  const centralDirSize = centralHeaders.reduce((sum, buf) => sum + buf.length, 0);

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralDirSize, 12);
  eocd.writeUInt32LE(centralDirOffset, 16);
  eocd.writeUInt16LE(0, 20);

  const finalZip = Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
  
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, finalZip);
  console.log(`✓ Plugin packaged successfully to: ${outputPath} (${finalZip.length} bytes, ${files.length} files)`);
}

function run() {
  const pluginSrcDir = path.join(__dirname, '../public/plugins/woocommerce-pakpayment');
  const outZip = path.join(__dirname, '../public/downloads/pakpayment-woocommerce.zip');
  const appUrl = getAppUrl();

  console.log(`ℹ Packaging plugin with default Host URL: ${appUrl}`);

  if (!fs.existsSync(pluginSrcDir)) {
    console.error(`Error: Plugin source dir not found at ${pluginSrcDir}`);
    process.exit(1);
  }

  const items = fs.readdirSync(pluginSrcDir);
  const files = [];

  for (const item of items) {
    const fullPath = path.join(pluginSrcDir, item);
    if (fs.statSync(fullPath).isFile()) {
      let content = fs.readFileSync(fullPath);
      
      // If it's the PHP file, inject the environment's NEXT_PUBLIC_APP_URL
      if (item === 'pakpayment-woocommerce.php') {
        let phpStr = content.toString('utf8');
        phpStr = phpStr.replace(
          /'https:\/\/pakpayment\.vercel\.app'/g,
          `'${appUrl}'`
        );
        content = Buffer.from(phpStr, 'utf8');
      }

      files.push({
        name: `pakpayment-woocommerce/${item}`,
        content: content
      });
    }
  }

  createZip(files, outZip);
}

run();
