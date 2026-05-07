/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--wp-${name}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./import_frontend/**/*.{html,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary":                   v("primary"),
        "on-primary":                v("on-primary"),
        "primary-container":         v("primary-container"),
        "on-primary-container":      v("on-primary-container"),
        "primary-fixed":             v("primary-fixed"),
        "primary-fixed-dim":         v("primary-fixed-dim"),
        "on-primary-fixed":          v("on-primary-fixed"),
        "on-primary-fixed-variant":  v("on-primary-fixed-variant"),
        "inverse-primary":           v("inverse-primary"),

        "secondary":                   v("secondary"),
        "on-secondary":                v("on-secondary"),
        "secondary-container":         v("secondary-container"),
        "on-secondary-container":      v("on-secondary-container"),
        "secondary-fixed":             v("secondary-fixed"),
        "secondary-fixed-dim":         v("secondary-fixed-dim"),
        "on-secondary-fixed":          v("on-secondary-fixed"),
        "on-secondary-fixed-variant":  v("on-secondary-fixed-variant"),

        "tertiary":                   v("tertiary"),
        "on-tertiary":                v("on-tertiary"),
        "tertiary-container":         v("tertiary-container"),
        "on-tertiary-container":      v("on-tertiary-container"),
        "tertiary-fixed":             v("tertiary-fixed"),
        "tertiary-fixed-dim":         v("tertiary-fixed-dim"),
        "on-tertiary-fixed":          v("on-tertiary-fixed"),
        "on-tertiary-fixed-variant":  v("on-tertiary-fixed-variant"),

        "error":              v("error"),
        "on-error":           v("on-error"),
        "error-container":    v("error-container"),
        "on-error-container": v("on-error-container"),

        "background":               v("background"),
        "on-background":            v("on-background"),
        "surface":                  v("surface"),
        "on-surface":               v("on-surface"),
        "surface-variant":          v("surface-variant"),
        "on-surface-variant":       v("on-surface-variant"),
        "surface-tint":             v("surface-tint"),
        "inverse-surface":          v("inverse-surface"),
        "inverse-on-surface":       v("inverse-on-surface"),
        "surface-bright":           v("surface-bright"),
        "surface-dim":              v("surface-dim"),
        "surface-container":        v("surface-container"),
        "surface-container-low":    v("surface-container-low"),
        "surface-container-high":   v("surface-container-high"),
        "surface-container-highest": v("surface-container-highest"),
        "surface-container-lowest":  v("surface-container-lowest"),

        "outline":         v("outline"),
        "outline-variant": v("outline-variant"),
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "sm": "8px",
        "base": "4px",
        "xs": "4px",
        "xl": "40px",
        "md": "16px",
        "lg": "24px",
        "layout-margin": "32px",
        "layout-gutter": "20px"
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        "label-sm": ["Inter", "sans-serif"],
        "heading-md": ["Inter", "sans-serif"],
        "heading-lg": ["Inter", "sans-serif"],
        "data-mono": ["Inter", "sans-serif"],
        "display-xl": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"]
      },
      fontSize: {
        "label-sm": ["12px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "heading-md": ["24px", { "lineHeight": "1.3", "fontWeight": "600" }],
        "heading-lg": ["30px", { "lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "data-mono": ["16px", { "lineHeight": "1", "fontWeight": "500" }],
        "display-xl": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "body-lg": ["18px", { "lineHeight": "1.5", "fontWeight": "400" }],
        "body-md": ["16px", { "lineHeight": "1.5", "fontWeight": "400" }]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
