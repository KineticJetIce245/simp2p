import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: 'compiled',
      assets: 'compiled',
      fallback: null
    }),
  }
};

export default config;
