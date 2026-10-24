import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

const isGithubPages = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  integrations: [react()],
  site: isGithubPages
    ? 'https://yourideasourplatform.github.io'
    : 'http://127.0.0.1:4322',
  // Project Pages: https://yourideasourplatform.github.io/fuerzayacondicionamiento-entidades/
  base: isGithubPages ? '/fuerzayacondicionamiento-entidades/' : '/',
  server: { port: 4322, host: true },
});
