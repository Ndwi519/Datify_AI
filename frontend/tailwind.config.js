export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "hsl(210, 20%, 98%)",
        foreground: "hsl(222.2, 84%, 4.9%)",
        card: "hsl(0, 0%, 100%)",
        cardForeground: "hsl(222.2, 84%, 4.9%)",
        primary: "hsl(221.2, 83.2%, 53.3%)",
        primaryForeground: "hsl(210, 40%, 98%)",
        secondary: "hsl(210, 40%, 96.1%)",
        secondaryForeground: "hsl(222.2, 47.4%, 11.2%)",
        muted: "hsl(210, 40%, 96.1%)",
        mutedForeground: "hsl(215.4, 16.3%, 46.9%)",
        accent: "hsl(210, 40%, 96.1%)",
        accentForeground: "hsl(222.2, 47.4%, 11.2%)",
        border: "hsl(214.3, 31.8%, 91.4%)",
        input: "hsl(214.3, 31.8%, 91.4%)",
        ring: "hsl(221.2, 83.2%, 53.3%)",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      }
    },
  },
  plugins: [],
}
