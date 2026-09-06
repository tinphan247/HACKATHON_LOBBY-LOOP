/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        galaxy: {
          blue: "#034EA2",
          "blue-hover": "#023b7a",
          orange: "#F58220",
          cyan: "#00BCD4",
          "cyan-light": "#E0F7FA",
          btn: "#64B5F6",
          "btn-hover": "#42A5F5",
        },
        curtain: {
          950: "#0b0c10",
          900: "#13161c",
          800: "#1e222d",
          700: "#2a303f",
        },
        paper: {
          50: "#FFFFFF",
          100: "#F8FAFC",
          200: "#EEF2F6",
        },
        marquee: {
          400: "#F58220",
          500: "#EA7310",
          600: "#D36104",
        },
      },
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(0, 0, 0, 0.08)",
        card: "0 10px 40px -10px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};
