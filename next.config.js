/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  // assetPrefix: '.',
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          'bufferutil': false,
          'utf-8-validate': false,
          http: false,
          https: false,
          stream: false,
          // fixes proxy-agent dependencies
          net: false,
          dns: false,
          tls: false,
          assert: false,
          // fixes next-i18next dependencies
          path: false,
          fs: false,
          // fixes mapbox dependencies
          events: false,
          // fixes sentry dependencies
          process: false
        }
      };
    }
    config.module.exprContextCritical = false;

    return config;
  },
}

module.exports = (...args) => {
  return nextConfig
}
