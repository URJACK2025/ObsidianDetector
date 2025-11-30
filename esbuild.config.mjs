import esbuild from 'esbuild';
import { readFileSync } from 'fs';

const manifest = JSON.parse(readFileSync('./manifest.json', 'utf8'));

const prod = process.argv[2] === 'production';

esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: ['obsidian'],
  format: 'cjs',
  watch: !prod,
  target: 'es2016',
  logLevel: 'info',
  sourcemap: prod ? false : 'inline',
  outfile: 'main.js',
  define: {
    'process.env.NODE_ENV': prod ? '"production"' : '"development"',
    'APP_VERSION': `"${manifest.version}"`
  },
}).catch(() => process.exit(1));
