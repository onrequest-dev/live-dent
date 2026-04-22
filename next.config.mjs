/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hzwxienpgfiaokdoqhmd.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**", // يسمح بكل المسارات داخل مجلد public
      },
    ],
  },
};


export default nextConfig;
