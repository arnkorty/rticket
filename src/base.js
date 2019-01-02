
const url = require('url')
const path = require('path')
const fs = require('fs')
const rp = require('request-promise')
const request = require('request')

const device = require('./device')
// const cheerio = require('cheerio')
// const logger = require('../app/logger').workerLogger
const FileCookieStore = require('tough-cookie-filestore')

const dataDir = process.env.COOKIES_DIR || path.join(__dirname, '../')

const getCookiesFile = (filename) => {
  const directory = path.join(dataDir, 'cookies')
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, {
      recursive: true
    })
  }
  const filepath = path.join(directory, filename)
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, '')
  }
  return filepath
}

function getEncKey(body, key){
  const match = body.match(new RegExp(`${key}\:\"(.{4})\"`))
  // console.log('getEncKey', key, new RegExp(`${key}\:\"(.{4})\"`), !!match, match && match[1])
  if(match) {
    this[key] = match[1]
    return match[1]
  }
}

class Base {
  constructor (username) {
    let { store, log_tag } = arguments[arguments.length - 1] || {}
    if (!store) {
      const storeFile = getCookiesFile(`${this.constructor.name}-${username}_${log_tag || ''}`)
      try {
        store = new FileCookieStore(storeFile)
      } catch (err) {
        // console.error('fsdfsdfsdfsdfsdfsdf', err)
        fs.unlinkSync(storeFile)
        getCookiesFile(`${this.constructor.name}-${username}`)

        // fs.unlink
        store = new FileCookieStore(storeFile)
      }
    }

    this.deviceInfo = device.getInfo()
    this.log_tag = log_tag

    // this.logger = logger
    this.jar = rp.jar(store)
    this.username = username
    this.request = rp.defaults({ jar: this.jar })
    this.url = url
    this.path = path
    this.maxRetry = 10
    this.currentRetry = 0
    this.default_request_options = {}
    // this.cheerio = cheerio
    this.default_headers = {
      // 'Referer': this.currentUrl,
      Connection: 'keep-alive',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'Cache-Control': 'max-age=0',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent': this.deviceInfo.userAgent//'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1'
      // ...this.headers()
    }
  }

  initDevice() {
    return this.get({
      uri: 'https://kyfw.12306.cn/otn/leftTicket/init?linktypeid=dc&fs=%E5%B9%BF%E5%B7%9E,GZQ&ts=%E6%88%90%E9%83%BD,CDW&date=2019-01-01&flag=N,N,Y'
    }).then(() => {
      this.get({
        uri: 'https://kyfw.12306.cn/otn/HttpZF/GetJS'
      }).then(r => {
        // console.log(r.body)
        const body = r.body
        // global.body = body
        // global.getEncKey = getEncKey
        // console.log(this.deviceInfo)
        const hash = device.hashAlg(this.deviceInfo, (k) => (getEncKey(body, k)))
        const algMatch = body.match(/algID\\x3d(.+)\\x26hashCode/)
        let algID = 'EXTF6br4MZ'
        if(algMatch) {
          algID = algMatch[1]
        }
        const uri = `https://kyfw.12306.cn/otn/HttpZF/logdevice?algID=${algID}&hashCode=${hash.value}${hash.key}&timestamp=${new Date().getTime()}`
        // console.log(uri)
        return this.get({
          uri: uri
        }).then(r => {
          const m = r.body.match(/\(\'(.+)\'\)/)
          if(m) {
            const json = JSON.parse(m[1])
            if(json.exp) {
              this.jar.setCookie(this.request.cookie(`RAIL_EXPIRATION=${json.exp}`), 'https://kyfw.12306.cn')
            }
            if(json.dfp) {
              this.jar.setCookie(this.request.cookie(`RAIL_DEVICEID=${json.dfp}`), 'https://kyfw.12306.cn')
            }
            //.then(r => console.log(r))
          }
        })
      })
    })
  }

  log (type, msg) {
    console.log(`${this.username} ${this.log_tag}::${new Date().toISOString()}  ${type}`, msg)
    // this.logger.info({ n: this.username, type, msg })
    // this.log({ n: this.username, type }, msg)
  }

  delay (time) {
    return new Promise((resolve) => {
      setTimeout(resolve, time)
    })
  }

  dynamicHeaders () {
    return {
      Referer: this.currentUrl
    }
  }

  getHeaders () {
    return {
      ...this.default_headers,
      ...this.dynamicHeaders()
    }
  }

  get (args) {
    return this.http(args)
  }

  post (args) {
    return this.http({ ...args, method: 'POST' })
  }

  http (args) {
    this.log('HTTP REQUEST START', args.uri)
    return this.baseHttp(args).then(r => {
      this.log('HTTP REQUEST END', args.uri)
      return r
    })
  }

  baseHttp ({ uri, method = 'GET', params = {}, headers = {}, ajax, isRetry = true, followRedirect = false, ...other }) {
    const rqHeaders = {
      ...this.getHeaders(),
      ...this.dynamicHeaders(),
      ...headers
    }
    // console.log('followRedirect', uri, followRedirect)
    if (ajax) {
      rqHeaders['X-Requested-With'] = 'XMLHttpRequest'
    }
    return this.request({
      method,
      uri,
      resolveWithFullResponse: true,
      gzip: true,
      ...params,
      headers: rqHeaders,
      followRedirect: followRedirect,
      ...this.default_request_options,
      ...other
    }).then(res => {
      // console.log(uri, res.statusCode)
      if (!ajax) {
        this.currentUrl = uri
      }
      this.currentRetry = 0
      // console.log(res.statusCode, res.body)
      return res
    }).catch(err => {
      this.log('request-error', uri)
      // console.log('request error', err)
      if (other.defaultCatch) {
        // console.log('errrr cache....', uri)
        return err
      }
      // console.log(`method: ${method}, uri:${uri}`, err.statusCode)
      this.currentRetry++
      if (err.statusCode === 302 && this.currentRetry <= 3) {
        return this.delay(3000 * this.currentRetry * 1.5).then(() => {
          return this.baseHttp({
            uri, method, params, headers, isRetry, ajax, followRedirect, ...other
          })
        })
      }
      if (err.statusCode === 302 && followRedirect) {
        const { response } = err
        return this.baseHttp({
          uri: response.headers.location, headers
        })
      }
      // console.log('catch', err)
      // console.error(err.statusCode, err.response.statusCode, err.response.statusMessage, err.response.rawHeaders)
      if (isRetry && this.currentRetry < this.maxRetry) {
        return this.baseHttp({
          uri, method, params, headers, isRetry, ajax, followRedirect, ...other
        })
      } else {
        throw err
      }
      // console.log(err)
      // throw err
    })
  }
}

module.exports = Base
