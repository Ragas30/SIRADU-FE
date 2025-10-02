import { defineConfig, createSystem, defaultConfig } from "@chakra-ui/react";
import { themeQuartz } from "ag-grid-community";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#ebf8ff" },
          100: { value: "#bee3f8" },
          200: { value: "#90cdf4" },
          300: { value: "#63b3ed" },
          400: { value: "#4299e1" },
          500: { value: "#3182ce" }, // utama
          600: { value: "#2b6cb0" },
          700: { value: "#2c5282" },
          800: { value: "#2a4365" },
          900: { value: "#1A365D" },
        },
      },
      fonts: {
        body: { value: "Montserrat, sans-serif" },
        heading: { value: "Montserrat, sans-serif" },
        mono: { value: "Menlo, monospace" },
      },
    },
  },
});

const customSystem = createSystem(defaultConfig, config);
export default customSystem;

export const customTheme = themeQuartz.withParams({
  fontFamily: "Montserrat, sans-serif",
  fontSize: 14,
  headerFontWeight: "600",
});
