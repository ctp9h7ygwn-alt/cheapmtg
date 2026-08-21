/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@xenova/transformers', 'onnxruntime-node'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.ignoreWarnings = [
        { module: /node_modules\/@xenova\/transformers/ }
      ];
    }
    return config;
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cards.scryfall.io',
      },
      {
        protocol: 'https',
        hostname: 'api.scryfall.com',
      },
      {
        protocol: 'https',
        hostname: '**.scryfall.com',
      },
      {
        protocol: 'https',
        hostname: 'svgs.scryfall.io',
      },
    ],
  },
};

module.exports = nextConfig;
