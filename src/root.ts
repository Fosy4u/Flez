import path from "path";

const root: string = (() => {
  return path.dirname(
    require.main?.filename ??
      process.mainModule?.filename ??
      __dirname
  );
})();

export default root;
