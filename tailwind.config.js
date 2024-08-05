/** @type {import('tailwindcss').Config} */

import daisyui from "daisyui"

export default {
  content: ["template.html", "./public_html/*.html"],
  theme: {
    colors: {
      // transparent: 'transparent',
      // themeTint: '#C2BEA9',
      // themeTitle: '#F9E566',
      // themeBackground: '#FEF9DD',
    },
    extend: {},
  },
  plugins: [
    daisyui,
  ],
  daisyui: {
    themes: [
      {
        jspmLight: {
          // primary: '#000',
          // secondary: '#374151',
          // accent: '#facc15',
          // neutral: '#fef3c7',
          // 'base-100': '#ffffff',
          // info: '#60a5fa',
          // success: '#4ade80',
          // warning: '#fbbf24',
          // error: '#ff0000',
        },
        jspmDark: {
          // primary: '#fff',
          // secondary: '#ff0000',
          // accent: '#facc15',
          // neutral: '#111827',
          // 'base-100': '#000',
          // info: '#60a5fa',
          // success: '#4ade80',
          // warning: '#fbbf24',
          // error: '#ff0000',
        },
      }
    ],
  }
}
