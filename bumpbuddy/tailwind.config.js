/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}", "./index.{js,ts}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#87D9C4",
          dark: "#5DBDA8",
        },
        secondary: {
          DEFAULT: "#C2AADF",
          dark: "#9B85C4",
        },
        accent: {
          DEFAULT: "#FF8FAB",
          dark: "#FF7093",
        },
        background: {
          light: "#FFFFFF",
          dark: "#121212",
        },
        surface: {
          light: "#F5F8FA",
          dark: "#222222",
        },
      },
      fontFamily: {
        poppins: [
          "Poppins_400Regular",
          "Poppins_500Medium",
          "Poppins_600SemiBold",
          "Poppins_700Bold",
        ],
        comfortaa: [
          "Comfortaa_400Regular",
          "Comfortaa_500Medium",
          "Comfortaa_600SemiBold",
          "Comfortaa_700Bold",
        ],
      },
      fontSize: {
        "heading-1": ["28px", { lineHeight: "34px", fontWeight: "700" }],
        "heading-2": ["24px", { lineHeight: "30px", fontWeight: "600" }],
        "heading-3": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "heading-4": ["18px", { lineHeight: "24px", fontWeight: "500" }],
        body: ["16px", { lineHeight: "24px" }],
        "body-small": ["14px", { lineHeight: "20px" }],
        caption: ["12px", { lineHeight: "16px" }],
      },
    },
  },
  plugins: [],
};
