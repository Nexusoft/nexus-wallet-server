module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: '15',
          },
        },
      ],
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
        },
      ],
    ],
  };
};
