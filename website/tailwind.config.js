/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#0A6ED1',
          green: '#1FA37A',
        },
        accent: {
          gold: '#F5B301',
          coral: '#FF6B6B',
        },
        neutral: {
          charcoal: '#1F2937',
          lightGray: '#F2F4F7',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0A6ED1 0%, #1FA37A 100%)',
        'gradient-cta': 'linear-gradient(135deg, #F5B301 0%, #FF6B6B 100%)',
        'gradient-hero': 'linear-gradient(to bottom right, #0A6ED1, #1FA37A)',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro', 'Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
