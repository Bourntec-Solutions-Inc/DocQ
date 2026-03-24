/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                darkBg: "#0f111a",
                darkCard: "#191c24",
                primaryBlue: "#377dff"
            }
        },
    },
    plugins: [],
}
