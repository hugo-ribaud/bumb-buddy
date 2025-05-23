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
          light: "#B8E6D8",
          readable: "#2D8A6E",
        },
        secondary: {
          DEFAULT: "#C2AADF",
          dark: "#9B85C4",
          light: "#E0D1F0",
          readable: "#7B5BA8",
        },
        accent: {
          DEFAULT: "#FF8FAB",
          dark: "#FF7093",
          light: "#FFB8CB",
          readable: "#E6457A",
        },
        background: {
          light: "#FFFFFF",
          dark: "#121212",
        },
        surface: {
          light: "#F8FAFC",
          dark: "#222222",
          elevated: "#FFFFFF",
          subtle: "#F1F5F9",
        },
        text: {
          primary: {
            light: "#1F2937",
            dark: "#F9FAFB",
          },
          secondary: {
            light: "#374151",
            dark: "#D1D5DB",
          },
          muted: {
            light: "#6B7280",
            dark: "#9CA3AF",
          },
        },
        border: {
          light: "#E5E7EB",
          dark: "#374151",
          subtle: "#F3F4F6",
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
