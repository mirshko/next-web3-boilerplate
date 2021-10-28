/*!
 @const noRedirectBlacklistedPaths - disable rewrite on paths to avoid inconsistent behavior
 @const publicBasePaths - All items (folders, files) under /public directory should be added there, to avoid redirection when an asset isn't found
 @const noRedirectBasePaths - disable url rewrite for items, this should contain all supported languages and all public base paths
*/
const noRedirectBlacklistedPaths = ['_next', 'api']; 
const publicBasePaths = ['robots', 'static', 'favicon.ico']; 
const noRedirectBasePaths = [ ...publicBasePaths, ...noRedirectBlacklistedPaths]; // ...sourceLocale

// @ts-check
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  reactStrictMode: true,
  // @note ESM is on by default for nextjs 12
  // experimental: { esmExternals: true },
  images: {
    minimumCacheTTL: 1209600,
    // @note these are the default settings nextjs uses
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['raw.githubusercontent.com'],
  }
}

module.exports = (nextConfig)

// Don't delete this console log, useful to see the config in Vercel deployments
console.log('next.config.js', JSON.stringify(module.exports, null, 2))
