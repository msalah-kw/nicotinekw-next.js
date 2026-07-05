/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // BRANDING_TODO: Replace hostname with your WooCommerce/WordPress backend media domain.
        hostname: "aliceblue-gnu-460662.hostingersite.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';",
          }
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            // BRANDING_TODO: Replace value with the www version of your brand domain.
            value: 'www.mediumpurple-tarsier-577339.hostingersite.com',
          },
        ],
        // BRANDING_TODO: Replace destination with your primary canonical apex domain.
        destination: 'https://mediumpurple-tarsier-577339.hostingersite.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
