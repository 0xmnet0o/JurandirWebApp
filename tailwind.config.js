/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
        // Tipografia da landing (coastal/editorial)
        display: ['"Instrument Serif"', "ui-serif", "Georgia", "serif"],
        body: ['"Hanken Grotesque"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // Paleta da marca PedeAí — litoral ao pôr do sol
        sand: {
          50: "#FDFBF6",
          100: "#FAF4E9",
          200: "#F3E7D1",
          300: "#E9D6B4",
        },
        ocean: {
          500: "#0F7E84",
          600: "#0C6A70",
          700: "#0E565B",
          800: "#0C4347",
          900: "#0A3437",
        },
        coral: {
          400: "#FF8A5B",
          500: "#FF6B4A",
          600: "#EF5130",
        },
        sun: {
          400: "#FFC24B",
          500: "#FFB23E",
        },
        ink: "#15302F",
      },
      boxShadow: {
        soft: "0 18px 40px -20px rgba(12, 67, 71, 0.35)",
        glow: "0 0 0 1px rgba(255,255,255,0.5), 0 24px 60px -24px rgba(239, 81, 48, 0.45)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
