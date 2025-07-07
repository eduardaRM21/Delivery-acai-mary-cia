import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#8d409f",
          foreground: "#fff",
        },
        secondary: {
          DEFAULT: "#753088",
          foreground: "#fff",
        },
        accent: {
          DEFAULT: "#5d2071",
          foreground: "#fff",
        },
        destructive: {
          DEFAULT: "#e3342f",
          foreground: "#fff",
        },
        muted: {
          DEFAULT: "#f6f6f6",
          foreground: "#333",
        },
        popover: {
          DEFAULT: "#fff",
          foreground: "#333",
        },
        card: {
          DEFAULT: "#fff",
          foreground: "#333",
        },
        color1: "#8d409f",
        color2: "#753088",
        color3: "#5d2071",
        color4: "#451059",
        color5: "#2d0042",
        purple: {
          600: "#8d409f",
          700: "#753088",
          800: "#5d2071",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
