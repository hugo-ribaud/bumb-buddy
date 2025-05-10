module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          blacklist: null,
          whitelist: [
            "EXPO_PUBLIC_SUPABASE_URL",
            "EXPO_PUBLIC_SUPABASE_ANON_KEY",
            "APP_ENV",
            "API_URL",
          ],
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};
