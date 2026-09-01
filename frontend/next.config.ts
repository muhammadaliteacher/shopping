import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Docker uchun mustaqil (standalone) server chiqarish
  output: "standalone",
  // Loyiha ildizida ham package-lock.json borligi uchun workspace root aniq belgilanadi
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
