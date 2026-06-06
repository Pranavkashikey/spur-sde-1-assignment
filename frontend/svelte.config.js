import adapter from '@sveltejs/adapter-vercel';  // change this line

export default {
  kit: {
    adapter: adapter({
      runtime: 'nodejs20.x'  // add this
    })
  }
};