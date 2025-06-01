const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Workaround for the "stream" / Node core-module error with ws in Supabase Realtime
config.resolver.unstable_enablePackageExports = false;

// Add path aliases support
config.resolver.alias = {
  "@": path.resolve(__dirname, "src"),
  "@/components": path.resolve(__dirname, "src/components"),
  "@/screens": path.resolve(__dirname, "src/screens"),
  "@/navigation": path.resolve(__dirname, "src/navigation"),
  "@/services": path.resolve(__dirname, "src/services"),
  "@/utils": path.resolve(__dirname, "src/utils"),
  "@/types": path.resolve(__dirname, "src/types"),
  "@/contexts": path.resolve(__dirname, "src/contexts"),
  "@/redux": path.resolve(__dirname, "src/redux"),
  "@/config": path.resolve(__dirname, "src/config"),
  "@/i18n": path.resolve(__dirname, "src/i18n"),
  "@/assets": path.resolve(__dirname, "assets"),
};

module.exports = withNativeWind(config, { input: "./global.css" });
