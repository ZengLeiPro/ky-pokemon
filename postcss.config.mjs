export default {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-preset-env': {
      stage: 2,
      features: {
        'cascade-layers': true,
        'oklab-function': { preserve: false },
      },
    },
  },
};
