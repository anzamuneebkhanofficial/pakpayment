const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

async function build() {
  const outdir = path.join(__dirname, '../public');
  if (!fs.existsSync(outdir)) {
    fs.mkdirSync(outdir, { recursive: true });
  }

  await esbuild.build({
    entryPoints: [path.join(__dirname, '../src/widget/embed.ts')],
    bundle: true,
    minify: true,
    target: ['es2020'],
    format: 'iife',
    outfile: path.join(outdir, 'widget.js'),
  });

  console.log('✓ Widget bundled successfully to public/widget.js');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
