/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Suppress hydration warnings for attributes added by browser extensions
  reactStrictMode: true,
  compiler: {
    // Suppress specific hydration warnings
    reactRemoveProperties: process.env.NODE_ENV === 'production' ? { properties: ['^data-new-gr-c-s-check-loaded$', '^data-gr-ext-installed$'] } : false,
  },
};

export default nextConfig;
