/** @type {import('next').NextConfig} */
const webpack = require('webpack')
const nextConfig = {}

const { parsed: myEnv } = require('dotenv').config({
    path:'.env'
})

console.log(myEnv);

module.exports = {
    webpack(config) {
        config.plugins.push(new webpack.EnvironmentPlugin(myEnv))
        return config
    }
}
