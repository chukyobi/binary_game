/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Add support for WebAssembly for physics engine
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    
    return config;
  },
}

module.exports = nextConfig;