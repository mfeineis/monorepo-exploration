import commonjs from "rollup-plugin-commonjs";
import nodeResolve from "rollup-plugin-node-resolve";

export default {
    input: "js/index.js",
    output: {
        file: "dist/filament.development.js",
        format: "iife",
        name: "Filament",
    },
    plugins: [
        nodeResolve(),
        commonjs(),
    ],
};
