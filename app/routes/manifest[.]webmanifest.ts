import { json } from "@remix-run/node";

export const loader = async () => {
  return json(
    {
      name: "_sorted",
      short_name: "_sorted",
      description: "Sort out your habits",
      start_url: "/",
      id: "/",
      // theme_color: "#1F2937",
      // background_color: "#1F2937",
      display: "standalone",
      categories: ["lifestyle", "productivity", "utilities", "health"],
      icons: [
        {
          src: "/images/android/android-launchericon-512-512.png",
          sizes: "512x512",
        },
        {
          src: "/images/android/android-launchericon-192-192.png",
          sizes: "192x192",
        },
        {
          src: "/images/android/android-launchericon-144-144.png",
          sizes: "144x144",
        },
        {
          src: "/images/android/android-launchericon-96-96.png",
          sizes: "96x96",
        },
        {
          src: "/images/android/android-launchericon-72-72.png",
          sizes: "72x72",
        },
        {
          src: "/images/android/android-launchericon-48-48.png",
          sizes: "48x48",
        },
        {
          src: "/images/ios/16.png",
          sizes: "16x16",
        },
        {
          src: "/images/ios/20.png",
          sizes: "20x20",
        },
        {
          src: "/images/ios/29.png",
          sizes: "29x29",
        },
        {
          src: "/images/ios/32.png",
          sizes: "32x32",
        },
        {
          src: "/images/ios/40.png",
          sizes: "40x40",
        },
        {
          src: "/images/ios/50.png",
          sizes: "50x50",
        },
        {
          src: "/images/ios/57.png",
          sizes: "57x57",
        },
        {
          src: "/images/ios/58.png",
          sizes: "58x58",
        },
        {
          src: "/images/ios/60.png",
          sizes: "60x60",
        },
        {
          src: "/images/ios/64.png",
          sizes: "64x64",
        },
        {
          src: "/images/ios/72.png",
          sizes: "72x72",
        },
        {
          src: "/images/ios/76.png",
          sizes: "76x76",
        },
        {
          src: "/images/ios/80.png",
          sizes: "80x80",
        },
        {
          src: "/images/ios/87.png",
          sizes: "87x87",
        },
        {
          src: "/images/ios/100.png",
          sizes: "100x100",
        },
        {
          src: "/images/ios/114.png",
          sizes: "114x114",
        },
        {
          src: "/images/ios/120.png",
          sizes: "120x120",
        },
        {
          src: "/images/ios/128.png",
          sizes: "128x128",
        },
        {
          src: "/images/ios/144.png",
          sizes: "144x144",
        },
        {
          src: "/images/ios/152.png",
          sizes: "152x152",
        },
        {
          src: "/images/ios/167.png",
          sizes: "167x167",
        },
        {
          src: "/images/ios/180.png",
          sizes: "180x180",
        },
        {
          src: "/images/ios/192.png",
          sizes: "192x192",
        },
        {
          src: "/images/ios/256.png",
          sizes: "256x256",
        },
        {
          src: "/images/ios/512.png",
          sizes: "512x512",
        },
        {
          src: "/images/ios/1024.png",
          sizes: "1024x1024",
        },
      ],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=600",
        "Content-Type": "application/manifest+json",
      },
    }
  );
};
