/** @type {import('tailwindcss').Config} */
module.exports = {
    /**
     * FD content
     * **/
    content: ["./src/**/*.{html,js}"],

    /**
     * SD content
     * **/
    // content: ['./app/modules/**/*.php', './app/layout/**/*.php', './app/modules/!panel/**', './app/public/js/*.js'],
    theme: {
      screens: {
        'xs': '360px',
        // => @media (min-width: 360px) { ... }

        'sm': '640px',
        // => @media (min-width: 640px) { ... }

        'md': '768px',
        // => @media (min-width: 768px) { ... }

        'lg': '1024px',
        // => @media (min-width: 1024px) { ... }

        'xl': '1280px',
        // => @media (min-width: 1280px) { ... }

        '2xl': '1536px',
        // => @media (min-width: 1536px) { ... }

        '3xl': '1800px',
        // => @media (min-width: 1800px) { ... }
      },

        extend: {
            colors: {
                transparent: "transparent",
                current: "currentColor",
            },
        },
    },
    plugins: [],
};

