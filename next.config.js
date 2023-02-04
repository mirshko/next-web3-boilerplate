// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
module.exports = {
  transpilePackages: ['lightweight-charts', 'fancy-canvas'],
  trailingSlash: true,
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  }
};
