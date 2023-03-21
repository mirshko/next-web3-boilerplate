// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
module.exports = {
  transpilePackages: ["lightweight-charts", "fancy-canvas"],
  trailingSlash: true,
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    PASSWORD_PROTECT: process.env.NODE_ENV === "production",
    PRODUCTION_PASSWORD: "GoodEntry69420",
  },
};
