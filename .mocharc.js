'use strict';

module.exports = {
  diff: true,
  extension: ['js'],
  opts: false,
  package: './package.json',
  reporter: 'spec',
  slow: 75,
  timeout: 10000,
  ui: 'bdd',
  'watch-ignore': ['test/utils'],
  exit: true,
  'no-warnings': true
};