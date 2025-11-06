import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    customElement: true
  },
  kit: {
    adapter: adapter({
      pages: 'compiled',
      assets: 'compiled',
      fallback: null
    }),
  }
};

export default config;
