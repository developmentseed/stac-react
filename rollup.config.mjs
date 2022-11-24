import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

const input = "./src/index.ts";
const sourcemap = true;

export default [
  {
    input,
    output: {
      file: "dist/stac-react.es.mjs",
      format: "es",
      sourcemap,
    },
    plugins: [typescript()],
  },
  {
    input,
    output: {
      file: "dist/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
  {
    input,
    output: {
      file: "dist/stac-react.cjs",
      format: "cjs",
      sourcemap,
    },
    plugins: [typescript()],
  },
];
