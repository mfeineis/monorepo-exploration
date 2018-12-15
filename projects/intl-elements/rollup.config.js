import commonjs from "rollup-plugin-commonjs";
import nodeResolve from "rollup-plugin-node-resolve";

export default {
    input: "src/main.js",
    output: {
        file: "dist/intl-elements.development.js",
        format: "iife",
        name: "IntlElements",
    },
    plugins: [
        nodeResolve(),
        commonjs(),
    ],
};
