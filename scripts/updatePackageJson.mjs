import fs from 'fs';

export const updatePackageJson = (packagePath) => {
  // Remove 'exports' because there is only one entry file in the bundle. Redirecting the paths for core-bundle will cause mess.
  const { exports, ...packageJson } = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  const updated = {
    ...packageJson,
    browser: 'dist/browser/index.js',
    main: 'dist/index.js',
    types: 'dist/node/index.d.ts',
    files: ['dist'],
    name: '@salesforce/core-bundle',
    scripts: Object.fromEntries(
      // Remove 'prepack' and 'prepare' scripts because publishing bundle does not need the actions
      Object.entries(packageJson.scripts).filter(([key]) => key !== 'prepack' && key !== 'prepare')
    ),
  };

  fs.writeFileSync(packagePath, JSON.stringify(updated, null, 2), 'utf8');
};
