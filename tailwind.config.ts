/** @type {import('tailwindcss').Config} */
module.exports = {
  // Habilita o modo escuro baseado na classe 'dark' no elemento HTML
  darkMode: ["class"],

  // ESSENCIAL: Informa ao Tailwind onde encontrar as classes CSS no seu projeto.
  // O aviso era sobre esta seção estar ausente ou vazia.
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // Para a antiga Pages Router (pode manter por segurança)
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Para seus componentes
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // ESSENCIAL para a App Router
  ],

  // Define o tema base e extensões
  theme: {
    extend: {
      // Cores definidas usando variáveis CSS (bom para theming com shadcn/ui)
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        // A cor de destaque que configuramos no globals.css
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // Você pode manter ou remover esta cor se não estiver usando mais.
        customOrange: {
          DEFAULT: "#FF8000",
        },
      },
      // Bordas arredondadas baseadas em variáveis CSS (padrão shadcn/ui)
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Mantenha outras extensões que você possa ter (fontFamily, etc.)
      fontFamily: {
        // Exemplo: Garanta que suas fontes Geist estejam referenciadas se necessário aqui também
        sans: ["var(--font-geist-sans)" /* ...fallbacks */],
        mono: ["var(--font-geist-mono)" /* ...fallbacks */],
      },
    },
  },

  // Plugins utilizados (ex: tailwindcss-animate para animações shadcn/ui)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
}
