const preprocess = require("./preprocess");

module.exports = (on, config) => {
    on("file:preprocessor", preprocess);

    config.env.VCD_URL = process.env.VCD_URL;
    config.env.VCD_PASSWORD = process.env.VCD_PASSWORD;
    // config.chromeWebSecurity = false;

    return config;
};
