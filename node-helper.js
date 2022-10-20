#!/usr/bin/env node
var os = require('os')
var cryptoJs = require('crypto-js')
var express = require('express')
var bodyParser = require('body-parser')
var fs = require('fs')
var child_process = require('child_process')
var morgan = require('morgan')
var axios = require('axios')

function _interopDefaultLegacy (e) {
  return e && typeof e === 'object' && 'default' in e ? e : { default: e }
}

var os__default = /*#__PURE__*/ _interopDefaultLegacy(os)
var cryptoJs__default = /*#__PURE__*/ _interopDefaultLegacy(cryptoJs)
var express__default = /*#__PURE__*/ _interopDefaultLegacy(express)
var bodyParser__default = /*#__PURE__*/ _interopDefaultLegacy(bodyParser)
var fs__default = /*#__PURE__*/ _interopDefaultLegacy(fs)
var child_process__default = /*#__PURE__*/ _interopDefaultLegacy(child_process)
var morgan__default = /*#__PURE__*/ _interopDefaultLegacy(morgan)
var axios__default = /*#__PURE__*/ _interopDefaultLegacy(axios)

const app = express__default['default']()

const { exec: exec$1 } = child_process__default['default']

app.use(morgan__default['default']('dev'))
app.use(bodyParser__default['default'].json())
app.use(bodyParser__default['default'].urlencoded({ extended: false }))

const key$2 = '123456'

const qfList = {}
const qfClockList = {}

const ecList = {}
const ecClockList = {}

const deleteQfList = code => {
  if (code in qfClockList) {
    clearTimeout(qfClockList[code])
    delete qfList[code]
    delete qfClockList[code]
    return
  }
  const clock = setTimeout(() => {
    delete qfList[code]
    delete qfClockList[code]
  }, 30 * 1000)
  qfClockList[code] = clock
}

const deleteEcList = code => {
  if (code in ecClockList) {
    clearTimeout(ecClockList[code])
    delete ecList[code]
    delete ecClockList[code]
    return
  }
  const clock = setTimeout(() => {
    delete ecList[code]
    delete ecClockList[code]
  }, 30 * 1000)
  ecClockList[code] = clock
}

function _exec (command) {
  return new Promise((resolve, reject) => {
    exec$1(command, (err, data, errData) => {
      ;(err ? reject : resolve)(err ? errData : data)
    })
  })
}

// 请求发送文件
app.get('/q/f', function (req, res) {
  const code = cryptoJs__default['default']
    .MD5(`${req.ip}${new Date().toString()}${Math.random()}`)
    .toString()

  if (Object.keys(qfList).includes(code)) {
    res.status(500)
    res.end('')
    return
  }
  if (Object.values(qfList).includes(req.query.n)) {
    res.status(403)
    res.end('')
    return
  }
  deleteQfList(code)
  qfList[code] = req.query.n
  res.status(200)
  res.send(code)
})

// 请求执行文件
app.get('/q/e', function (req, res) {
  const code = cryptoJs__default['default']
    .MD5(`${req.ip}${new Date().toString()}${Math.random()}`)
    .toString()
  if (Object.keys(ecList).includes(code)) {
    res.status(500)
    res.end('')
    return
  }
  if (Object.values(ecList).includes(req.query.n)) {
    res.status(403)
    res.end('')
    return
  }
  deleteEcList(code)
  ecList[code] = '19xjs9asja0xcm2i8x0qmx82kx'
  res.status(200)
  res.send(code)
})

// 发送文件
app.post('/f', async function (req, res) {
  const { code, authorization, message } = req.body
  if (!(code in qfClockList)) {
    deleteQfList(code)
    res.status(403)
    res.end('not exist')
    return
  }

  if (
    authorization !==
    cryptoJs__default['default']
      .MD5(`${code}${key$2}${qfList[code]}${message}`)
      .toString()
  ) {
    deleteQfList(code)
    res.status(403)
    res.end('authorization failed')
    return
  }
  const filename = qfList[code].split('/').pop()
  const filepath = qfList[code].replace(filename, '')
  fs__default['default'].writeFileSync(`./${filename}`, message)
  await _exec(`cp ${filename} ${filepath}`)
  await _exec(`rm ${filename}`)
  deleteQfList(code)
  res.status(200)
  res.end('')
})

// 执行文件
app.post('/e', async function (req, res) {
  const { code, authorization, message } = req.body
  if (!(code in ecClockList)) {
    deleteEcList(code)
    res.status(403)
    res.end('not exist')
    return
  }

  if (
    authorization !==
    cryptoJs__default['default']
      .MD5(`${code}${key$2}${message.length}${message}`)
      .toString()
  ) {
    deleteEcList(code)
    res.status(403)
    res.end('authorization failed')
    return
  }

  fs__default['default'].writeFileSync(`${code}.sh`, message)
  await _exec(`sudo chmod 777 ${code}.sh`)
  const result = await _exec(`./${code}.sh`)
  await _exec(`rm ${code}.sh`)
  deleteEcList(code)
  res.end(result)
})

var server = app

const key$1 = '123456'

async function get$1 (...args) {
  return (await axios__default['default'].get(...args)).data
}
async function post$1 (...args) {
  return (await axios__default['default'].post(...args)).data
}

var writeFile = async function ({ input, output, host, port }) {
  const path = output
  const message = fs__default['default'].readFileSync(input).toString()

  try {
    const code = await get$1(`http://${host}:${port}/q/f?n=${path}`)
    const result = await post$1(`http://${host}:${port}/f`, {
      code,
      message,
      authorization: cryptoJs__default['default']
        .MD5(`${code}${key$1}${path}${message}`)
        .toString()
    })
  } catch (e) {
    console.log(e.response.data)
  }
}

const key = '123456'

async function get (...args) {
  return (await axios__default['default'].get(...args)).data
}
async function post (...args) {
  return (await axios__default['default'].post(...args)).data
}

var exec = async function ({ input, command, host, port }) {
  const message =
    command ?? fs__default['default'].readFileSync(input).toString()
  try {
    const code = await get(`http://${host}:${port}/q/e`)
    const result = await post(`http://${host}:${port}/e`, {
      code,
      message,
      authorization: cryptoJs__default['default']
        .MD5(`${code}${key}${message.length}${message}`)
        .toString()
    })
    console.log(result)
  } catch (e) {
    console.log(e.response.data)
  }
}

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
    const beforeSpace = ' '
    const interfaces = os__default['default'].networkInterfaces()
    console.log()
    console.log(
      `${beforeSpace}\x1b[36mlinux-node-helper \x1b[0m`,
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
    server.listen(PORT)
    break
  case 'send-file':
    writeFile({ input: INPUT, output: OUTPUT, host: HOST, port: PORT })
    break
  case 'exec':
    exec({ input: INPUT, command: COMMAND, host: HOST, port: PORT })
    break
}

// console.log('asdf', app)

var src = {}

module.exports = src
