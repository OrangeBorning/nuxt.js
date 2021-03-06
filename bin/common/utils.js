
const { resolve } = require('path')
const { existsSync } = require('fs')
const consola = require('consola')
const esm = require('esm')(module, {
  cache: false,
  cjs: {
    cache: true,
    vars: true,
    namedExports: true
  }
})

const getRootDir = argv => resolve(argv._[0] || '.')
const getNuxtConfigFile = argv => resolve(getRootDir(argv), argv['config-file'])

exports.nuxtConfigFile = getNuxtConfigFile

exports.loadNuxtConfig = (argv) => {
  const rootDir = getRootDir(argv)
  const nuxtConfigFile = getNuxtConfigFile(argv)

  let options = {}

  if (existsSync(nuxtConfigFile)) {
    delete require.cache[nuxtConfigFile]
    options = esm(nuxtConfigFile)
    if (!options) {
      options = {}
    }
    if (options.default) {
      options = options.default
    }
  } else if (argv['config-file'] !== 'nuxt.config.js') {
    consola.fatal('Could not load config file: ' + argv['config-file'])
  }

  if (typeof options.rootDir !== 'string') {
    options.rootDir = rootDir
  }

  // Nuxt Mode
  options.mode =
    (argv.spa && 'spa') || (argv.universal && 'universal') || options.mode

  // Server options
  if (!options.server) {
    options.server = {}
  }
  options.server.port = argv.port || options.server.port
  options.server.host = argv.hostname || options.server.host

  return options
}
