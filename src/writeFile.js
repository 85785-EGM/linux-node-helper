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

module.exports = async function ({ input, output, host, port }) {
  const path = output
  const message = fs.readFileSync(input).toString()

  try {
    const code = await get(`http://${host}:${port}/q/f?n=${path}`)
    const result = await post(`http://${host}:${port}/f`, {
      code,
      message,
      authorization: crypto.MD5(`${code}${key}${path}${message}`).toString()
    })
  } catch (e) {
    console.log(e.response.data)
  }
}
