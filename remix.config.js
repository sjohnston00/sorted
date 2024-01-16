/** @type {import('@remix-pwa/dev').WorkerConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: 'build/index.js',
  // publicPath: "/build/",
  // serverDependenciesToBundle: 'all',
  serverDependenciesToBundle: [/@remix-pwa\/.*/],
  browserNodeBuiltinsPolyfill: { modules: { crypto: true } },
  // serverModuleFormat: "cjs",
  tailwind: true,
};
