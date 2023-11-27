const webpack = require("webpack");

module.exports = {
    resolve: {  
        extensions: [".ts", ".js"],
        fallback: {
            "path": require.resolve("path-browserify")
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: [/node_modules/],
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            transpileOnly: true,
                        },
                    },
                ],
            },
            {
                test: /\.feature$/,
                use: [
                    {
                        loader: "cypress-cucumber-preprocessor/loader",
                    },
                ],
            },
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
               process: 'process/browser',
        }),
    ],
};
