/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'green': {
                    '800': '#166534',
                },
                'purple': {
                    'DEFAULT': '#8b5cf6',
                },
            },
        },
    },
    plugins: [],
} 