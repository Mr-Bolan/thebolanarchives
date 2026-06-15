import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const isProduction = process.env.NODE_ENV === "production";
const basePath = "/thebolanarchives";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: isProduction ? basePath : undefined,
  assetPrefix: isProduction ? `${basePath}/` : undefined,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  images: {
    unoptimized: true,
  },
};

export default withMDX(nextConfig);
