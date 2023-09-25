import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json" assert { type: "json" };

import resolve from "rollup-plugin-node-resolve";
import babel from "@rollup/plugin-babel";

// import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/index.ts",
  output: {
    file: pkg.module,
    format: "esm",
  },
  plugins: [babel({ babelHelpers: "bundled" }), typescript(), resolve()],
};
