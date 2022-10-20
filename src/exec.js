const crypto = require('crypto-js')
const axios = require('axios')
const fs = require('fs')

const key = '123456'

async function get (...args) {
  return (await axios.get(...args)).data
}
async function post (...args) {
  return (await axios.post(...args)).data
}

module.exports = async function ({ input, command, host, port }) {
  const message = command ?? fs.readFileSync(input).toString()
  try {
    const code = await get(`http://${host}:${port}/q/e`)
    const result = await post(`http://${host}:${port}/e`, {
      code,
      message,
      authorization: crypto
        .MD5(`${code}${key}${message.length}${message}`)
        .toString()
    })
    console.log(result)
  } catch (e) {
    console.log(e.response.data)
  }
}
