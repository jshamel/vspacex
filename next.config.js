/** @type {import('next').NextConfig} */
const webpack = require('webpack');
const nextConfig = {};

console.log('process.env.NODE_ENV', process.env.NODE_ENV);
// Load dotenv config for local development
if (process.env.NODE_ENV !== 'production') {
  const { parsed: myEnv } = require('dotenv').config({
    path: '.env',
  });
  console.log(myEnv);
  nextConfig.webpack = function (config) {
    config.plugins.push(new webpack.EnvironmentPlugin(myEnv));
    return config;
  };
} else {
  // Use AWS Amplify environment variables in production
  nextConfig.webpack = function (config) {
    config.plugins.push(new webpack.EnvironmentPlugin(process.env));
    return config;
  };
}

module.exports = nextConfig;