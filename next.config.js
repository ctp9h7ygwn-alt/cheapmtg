/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.ignoreWarnings = [
        { module: /node_modules\/@xenova\/transformers/ }
      ];
    }
    // Set externals for node environment
    config.externals.push({
      'onnxruntime-node': 'commonjs onnxruntime-node',
      '@xenova/transformers': 'commonjs @xenova/transformers',
    });
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cards.scryfall.io',
      },
    ],
  },
};

module.exports = nextConfig;
