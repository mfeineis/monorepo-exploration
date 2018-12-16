module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:fp/recommended",
        "plugin:import/recommended",
        "plugin:ramda/recommended",
    ],
    plugins: [
        "fp",
        "import",
        "ramda",
    ],
    root: true,
    rules: {
        "arrow-parens": 2,

        "fp/no-mutation": [2, {
            commonjs: true,
        }],
        "fp/no-nil": 1,
        "fp/no-unused-expression": 1,

        "import/no-unresolved": [2, {
            ignore: [
                "filament$",
                "intl-elements$",
            ]
        }],
    },
};
