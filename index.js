const version = require('./package.json').version
const os = require('os')

const enableFunction = ['server', 'exec', 'send-file', 'recv-file']

function getArg (key) {
  const pKey = `${key}=`
  const re = new RegExp(`^${pKey}`)
  return process.argv.find(s => re.test(s))?.replace(pKey, '')
}

const FUNCTION = process.argv.find(s => enableFunction.includes(s))
const PORT = getArg('-p') ?? 3610
const HOST = getArg('-h') ?? '127.0.0.1'
const INPUT = getArg('-i')
const OUTPUT = getArg('-o')
const COMMAND = getArg('-c')

switch (FUNCTION) {
  case 'server':
    const app = require('./src/server')
    const beforeSpace = ' '
    const interfaces = os.networkInterfaces()
    console.log()
    console.log(
      `${beforeSpace}\x1b[36mlinux-node-helper v${version}\x1b[0m`,
      `\x1b[32m${'server running at:'}\x1b[0m`
    )
    console.log()
    console.log(
      `${beforeSpace}> Local:    `,
      `\x1b[36m${'http://localhost:' + PORT + '/'}\x1b[0m`
    )
    Object.values(interfaces)
      .flat()
      .filter(({ internal }) => !internal)
      .filter(({ family }) => family === 'IPv4')
      .map(({ address }) => address)
      .map(h => `http://${h}:${PORT}/`)
      .forEach(h => {
        console.log(`${beforeSpace}> Network:  `, `\x1b[36m${h}\x1b[0m`)
      })
    app.listen(PORT)
    break
  case 'send-file':
    const writeFile = require('./src/writeFile')
    writeFile({ input: INPUT, output: OUTPUT, host: HOST, port: PORT })
    break
  case 'exec':
    const exec = require('./src/exec')
    exec({ input: INPUT, command: COMMAND, host: HOST, port: PORT })
    break
}

// console.log('asdf', app)
