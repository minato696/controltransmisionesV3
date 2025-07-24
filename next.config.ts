import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  server: {
    port: 5885,
    host: '0.0.0.0',
  },
  // Añadir assetPrefix para usar el favicon
  async headers() {
    return [
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Link',
            value: 'https://statics.exitosanoticias.pe/exitosa/img/global/favicon.png',
          },
        ],
      },
    ];
  },
};

export default nextConfig;