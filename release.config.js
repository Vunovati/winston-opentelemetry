'use strict'

/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  branches: ['master', 'next'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/npm',
    '@semantic-release/git'
  ]
}
