const svgCaptcha = require('svg-captcha')

function generateCaptcha () {
    return svgCaptcha.create()
  }
  
  module.exports = {
    generateCaptcha
  }