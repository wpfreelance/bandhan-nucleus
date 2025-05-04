module.exports = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.unsplash.com',
      'nucleusdiagnosticscentre.com',
    ],
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
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
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // Configure the server to listen on the required port
  serverRuntimeConfig: {
    port: 5000,
  },
  // Make the app available externally
  publicRuntimeConfig: {
    staticFolder: '/public',
  },
  // Environment variables that will be available on the client
  env: {
    VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID
  },
};
