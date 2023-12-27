/** @type {import('@remix-pwa/dev').WorkerConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: 'build/index.js',
  // publicPath: "/build/",
  // serverDependenciesToBundle: 'all',
  serverDependenciesToBundle: [/@remix-pwa\/.*/],
  serverModuleFormat: "cjs",
  tailwind: true,
};
