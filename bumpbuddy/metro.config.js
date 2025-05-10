const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Workaround for the "stream" / Node core-module error with ws in Supabase Realtime
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
