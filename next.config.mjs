import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Removing static export to allow dynamic routes
  // output: 'export',
}

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
})(nextConfig);

export default config;
