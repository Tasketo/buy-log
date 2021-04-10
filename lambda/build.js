const resolve = require('@rollup/plugin-node-resolve').default;
const json = require('@rollup/plugin-json');
const commonjs = require('@rollup/plugin-commonjs');
const rollup = require('rollup');
const fs = require('fs');
const path = require('path');

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const options = (folder, file) => ({
  input: `build/${folder}/${file}`,
  plugins: [json(), resolve(), commonjs()],
  output: {
    dir: `dist/${folder}`,
    format: 'cjs',
  },
});

const build = async () => {
  let size = 0;
  const folders = fs.readdirSync(path.resolve(__dirname, 'build'));
  for (const folder of folders) {
    const files = fs.readdirSync(path.resolve(__dirname, 'build', folder));

    const outDir = path.resolve(__dirname, '..', 'cdk', 'lambda-dist', folder);
    fs.mkdirSync(outDir);

    for (const file of files) {
      const filePath = path.resolve(__dirname, 'build', folder, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        continue;
      }
      const opts = options(folder, file);
      const bundle = await rollup.rollup(opts);
      await bundle.generate(opts);
      await bundle.write(opts);
      await bundle.close();

      const bundledFile = path.resolve(__dirname, 'dist', folder, file);
      size += fs.statSync(bundledFile).size;

      fs.copyFileSync(bundledFile, path.resolve(outDir, file));
    }
  }

  console.log(`\n\nFolder size of dist is ${formatBytes(size)}`);
};

const clear = () => {
  fs.rmdirSync(path.resolve(__dirname, 'dist'), { recursive: true });
  fs.rmdirSync(path.resolve(__dirname, '..', 'cdk', 'lambda-dist'), { recursive: true });
  fs.mkdirSync(path.resolve(__dirname, '..', 'cdk', 'lambda-dist'));
};

Promise.resolve()
  .then(async () => {
    clear();
    await build();

    console.log('SUCCESS');
  })
  .catch((error) => console.error(error));
