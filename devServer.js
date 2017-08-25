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
  fuse.bundle("vendor")
  // Watching (to add dependencies) it's damn fast anyway
  .watch()
  // first bundle will get HMR related code injected
  // it will notify as well
  .hmr()
  .instructions(" ~ index.tsx") // nothing has changed here

fuse.bundle("app")
  .watch()
  // this bundle will not contain HRM related code (as only the first one gets it)
  // but we would want to HMR it
  .hmr()
  // enable sourcemaps for our package
  .sourceMaps(true)
  // bundle without deps (we have a vendor for that) + without the api
  .instructions(" !> [index.tsx]")
  return fuse.run();
});

Sparky.task("copy-data", () => { //need to start with ./ not ./src for base to work
  return Sparky.src("./assets/data/**/*.json", { base: "./src" }).dest(
    "./dist"
  );
});

Sparky.task("default", [ "copy-data", "build"], () => {});