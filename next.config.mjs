/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    BASEURL: process.env.BASEURL || "https://uat.kian.digital/api-proxy",
  },
};

// BASEURL: process.env.BASEURL || "https://uat.kian.digital/api-proxy",
// BASEURL: process.env.BASEURL || "https://api.levants.io",

module.exports = nextConfig;
