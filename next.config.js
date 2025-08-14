/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ghzvbcdxxsehtpswvodj.supabase.co",
      },
    ],
    domains: [
      "ghzvbcdxxsehtpswvodj.supabase.co"
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb"
    }
  }
};

module.exports = nextConfig;