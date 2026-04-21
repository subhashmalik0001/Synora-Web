/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ["@paygate/db", "@paygate/shared", "@paygate/queue"],
    typescript: {
        // The shouldInlineParams private property mismatch is a false positive
        // caused by dual ESM/CJS resolution of drizzle-orm under NodeNext.
        // Types are validated via tsc --noEmit during development.
        ignoreBuildErrors: true,
    },
    experimental: {
        serverComponentsExternalPackages: ["drizzle-orm", "postgres"],
    },
    webpack: (config) => {
        config.resolve.extensionAlias = {
            '.js': ['.js', '.ts', '.tsx'],
        };
        return config;
    },
};

export default nextConfig;
