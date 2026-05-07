/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        orion: {
          bg: {
            primary: '#1e1e1e',
            secondary: '#252526',
            tertiary: '#2d2d2d',
            activity: '#333333',
            titlebar: '#323233',
            input: '#3c3c3c',
          },
          border: '#3e3e42',
          text: {
            primary: '#cccccc',
            secondary: '#858585',
            muted: '#5a5a5a',
          },
          accent: {
            blue: '#007acc',
            teal: '#4ec9b0',
            red: '#f44747',
            amber: '#cca700',
          },
          selection: '#264f78',
        },
      },
      fontFamily: {
        mono: ['Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
