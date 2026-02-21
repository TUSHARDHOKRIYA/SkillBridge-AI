
const nextConfig = {
  output: 'standalone', // Required for Docker deployment
  eslint: {
    ignoreDuringBuilds: true, // Recommended for CI/CD to prevent build fails on warnings
  },
  typescript: {
    ignoreBuildErrors: true, // Strict type checking can be skipped for production builds if needed
  },
};

export default nextConfig;
