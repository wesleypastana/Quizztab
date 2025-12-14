/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#2C2D33",
        input: "#2C2D33",
        ring: "#7F00FF",
        background: "#0B0B10",
        foreground: "#FFFFFF",
        primary: {
          DEFAULT: "#7F00FF",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#15161C",
          foreground: "#8E92A0",
        },
        muted: {
          DEFAULT: "#505565",
          foreground: "#8E92A0",
        },
        accent: {
          DEFAULT: "#7F00FF",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#15161C",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "20px",
        md: "16px",
        sm: "12px",
      },
      boxShadow: {
        glow: "0px 0px 15px rgba(127, 0, 255, 0.4)",
        card: "0px 4px 20px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
}
