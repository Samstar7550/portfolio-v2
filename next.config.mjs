/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: "standalone",

  // Image optimisation (external hosts if needed)
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
