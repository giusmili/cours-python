/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  async headers() {
    return [
      {
        source: "/pyodide/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "cross-origin",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/pyodide-worker.mjs",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "cross-origin",
          },
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
      {
        source: "/python-sandbox.html",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
