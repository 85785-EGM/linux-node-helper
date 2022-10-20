const crypto = require('crypto-js')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const fs = require('fs')
const { exec } = require('child_process')
const logger = require('morgan')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const key = '123456'

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
    exec(command, (err, data, errData) => {
      ;(err ? reject : resolve)(err ? errData : data)
    })
  })
}

// 请求发送文件
app.get('/q/f', function (req, res) {
  const code = crypto
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
  const code = crypto
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
    crypto.MD5(`${code}${key}${qfList[code]}${message}`).toString()
  ) {
    deleteQfList(code)
    res.status(403)
    res.end('authorization failed')
    return
  }
  const filename = qfList[code].split('/').pop()
  const filepath = qfList[code].replace(filename, '')
  fs.writeFileSync(`./${filename}`, message)
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
    crypto.MD5(`${code}${key}${message.length}${message}`).toString()
  ) {
    deleteEcList(code)
    res.status(403)
    res.end('authorization failed')
    return
  }

  fs.writeFileSync(`${code}.sh`, message)
  await _exec(`sudo chmod 777 ${code}.sh`)
  const result = await _exec(`./${code}.sh`)
  await _exec(`rm ${code}.sh`)
  deleteEcList(code)
  res.end(result)
})

module.exports = app
