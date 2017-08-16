const { Sparky, FuseBox, WebIndexPlugin, CSSPlugin } = require("fuse-box");

Sparky.task("build", () => {
  const fuse = FuseBox.init({
    sourceMaps: true,
    homeDir: "src",
    output: "dist/$name.js",
    hash: false,
    target: "browser",
    experimentalFeatures: true, //for import()
    cache: true,
    plugins: [
      CSSPlugin(),
      WebIndexPlugin({
        //makes an index.html
        title: "WormNet",
        template: "src/index.html"
      })
    ]
  });

  fuse.dev();
  const app = fuse.bundle("app").instructions(`> index.tsx`)
  app.watch().hmr();
  return fuse.run();
});

Sparky.task("copy-data", () => { //need to start with ./ not ./src for base to work
  return Sparky.src("./assets/data/**/*.json", { base: "./src" }).dest(
    "./dist"
  );
});

Sparky.task("default", [ "copy-data", "build"], () => {});