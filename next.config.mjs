/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.giaiphaptudongdien.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'giaiphaptudongdien.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'api.dicebear.com',
                pathname: '/**',
            },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: "10mb",
        },
    },
    serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
};

export default nextConfig;
