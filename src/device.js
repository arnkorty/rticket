const crypto = require('crypto')

const rnd = (n, m) => {
  var random = Math.floor(Math.random() * (m - n + 1) + n)
  return random
}

const repeatArr = (arr, num = 1, isMobile = false) => {
  const result = []
  let obj
  if (!isMobile) {
    arr = arr.split('x').reverse()// .join('x')
    obj = {
      size: `${arr[0]}x${arr[1]}`,
      avoid: `${parseInt(parseInt(arr[0]) * 877 / 900)}x${arr[1]}`
    }
  } else {
    obj = {
      size: arr,
      avoid: arr
    }
  }

  for (let i = 0; i < num; i++) {
    result.push(obj)
  }
  return result
}

const screen = {
  pc: [
    ...repeatArr('1366x768', 30),
    ...repeatArr('1280x1024', 5),
    ...repeatArr('1440x900', 10),
    ...repeatArr('1600x900', 4),
    ...repeatArr('1920x1080', 50),
    ...repeatArr('2560x1440', 5)
  ],
  mb: [
    ...repeatArr('375x812', 30, true),
    ...repeatArr('375x667', 30, true),
    ...repeatArr('414x736', 30, true),
    ...repeatArr('360x640', 30, true)
  ],
  webAgents: [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:64.0) Gecko/20100101 Firefox/64.0'
  ],
  wapAgents: [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Mobile Safari/537.36',
    'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1'
  ]
}

function p(k, v) {
  this.key = k
  this.value = v
}

const base64SHA256 = (c) => {
  const hasher = crypto.createHash('sha256')
  hasher.update(c)
  return hasher.digest('base64').replace(/\//g, '_').replace(
    /\+/g, '-'
  ).replace(/\=/, '')
}

const md5Hex = (c) => {
  const hasher = crypto.createHash('md5')
  hasher.update(c)
  return hasher.digest('hex')
}
// hb map
// const hb = {}
const hb = {
  historyList: 'kU5z',
  scrAvailWidth: 'E-lJ',
  os: 'hAqN',
  openDatabase: 'V8vl',
  appcodeName: 'qT7b',
  hasLiedBrowser: '2xC5',
  scrHeight: '5Jwy',
  webSmartID: 'E3gR',
  userLanguage: 'hLzX',
  indexedDb: '3sw-',
  touchSupport: 'wNLf',
  cookieCode: 'VySQ',
  storeDb: 'Fvje',
  hasLiedOs: 'ci5c',
  plugins: 'ks0Q',
  timeZone: 'q5aJ',
  hasLiedResolution: '3neK',
  adblock: 'FMQw',
  jsFonts: 'EOQP',
  userAgent: '0aew',
  scrAvailHeight: '88tV',
  localCode: 'lEnu',
  scrDeviceXDPI: '3jCe',
  hasLiedLanguages: 'j5po',
  scrColorDepth: 'qmyu',
  browserLanguage: 'q4f3',
  srcScreenSize: 'tOHY',
  localStorage: 'XM7l',
  scrAvailSize: 'TeRS',
  doNotTrack: 'VEek',
  flashVersion: 'dzuS',
  online: '9vyE',
  cookieEnabled: 'VPIf',
  cpuClass: 'Md7A',
  browserVersion: 'd435',
  browserName: '-UVA',
  mimeTypes: 'jp76',
  scrWidth: 'ssI5',
  systemLanguage: 'e6OK',
  sessionStorage: 'HVia',
  javaEnabled: 'yD16',
  appMinorVersion: 'qBVW'
}

const hashAlg = (a, hb, b = '', c = '') => {
  a.sort(function(a, b) {
    var c, d
    if (typeof a === 'object' && typeof b === 'object' && a && b) {
      return c = a.key,
      d = b.key,
      c === d ? 0 : typeof c === typeof d ? c < d ? -1 : 1 : typeof c < typeof d ? -1 : 1
    }
    throw 'error'
  })
  for (var d = 0; d < a.length; d++) {
    var e = a[d].key.replace(RegExp('%', 'gm'), ''),
      v = hb(e),
      f = '',
      f = typeof a[d].value === 'string' ? a[d].value.replace(RegExp('%', 'gm'), '') : a[d].value
    f !== '' && (c += e + f,
    b += '\x26' + (void 0 == v? e : v) + '\x3d' + f)
  }
  a = c
  c = a.length
  d = ''
  a = d = a.length % 2 == 0 ? a.substring(c / 2, c) + a.substring(0, c / 2) : a.substring(c / 2 + 1, c) + a.charAt(c / 2) + a.substring(0, c / 2)
  c = a.length
  d = a.split('')
  for (e = 0; e < parseInt(c / 2); e++) {
    e % 2 == 0 && (f = a.charAt(e),
    d[e] = d[c - 1 - e],
    d[c - 1 - e] = f)
  }
  a = d.join('')
  c = a.length
  d = c % 3 == 0 ? parseInt(c / 3) : parseInt(c / 3) + 1
  c < 3 || (e = a.substring(0, 1 * d),
  f = a.substring(1 * d, 2 * d),
  a = a.substring(2 * d, c) + e + f)
  c = ''
  d = a.length
  for (e = 0; e < d; e++) {
    f = a.charAt(e).charCodeAt(0),
    c = f === 127 ? c + String.fromCharCode(0) : c + String.fromCharCode(f + 1)
  }
  d = c
  e = d.length
  f = e % 3 == 0 ? parseInt(e / 3) : parseInt(e / 3) + 1
  e < 3 ? c = d : (a = d.substring(0, 1 * f),
  c = d.substring(1 * f, 2 * f),
  d = d.substring(2 * f, e),
  c = c + d + a)
  c = base64SHA256(c)
  return new p(b, c)
}

function getInfo() {
  this.rndNum = rnd(0, 100)
  this.isPc = this.rndNum > 30
  if (this.isPc) {
    this.screen = screen.pc[this.rndNum % screen.pc.length]
  } else {
    this.screen = screen.mb[this.rndNum % screen.mb.length]
  }
  const query = [
    {
      'key': 'adblock',
      'value': '0'
    },
    {
      'key': 'browserLanguage',
      'value': 'zh-CN'
    },
    {
      'key': 'cookieEnabled',
      'value': '1'
    },
    {
      'key': 'custID',
      'value': '133'
    },
    {
      'key': 'doNotTrack',
      'value': '1'
    },
    {
      'key': 'flashVersion',
      'value': 0
    },
    {
      'key': 'javaEnabled',
      'value': '0'
    },
    {
      'key': 'jsFonts',
      'value': 'c227b88b01f5c513710d4b9f16a5ce52'
    },
    {
      'key': 'mimeTypes',
      'value': '52d67b2a5aa5e031084733d5006cc664'
    },
    {
      'key': 'os',
      'value': 'MacIntel'
    },
    {
      'key': 'platform',
      'value': () => this.isPc ? 'WEB' : 'WAP'
    },
    {
      'key': 'plugins',
      'value': () => {
        if (this.isPc) {
          return ['d22ca0b81584fbea62237b14bd04c866', 'a103db222cd8296a50268c8f0355b741'][rnd(1, 10) % 2]
        } else {
          return 'd41d8cd98f00b204e9800998ecf8427e'
        }
      } // 'd22ca0b81584fbea62237b14bd04c866'
    },
    {
      'key': 'timeZone',
      'value': -8
    },
    {
      'key': 'touchSupport',
      'value': () => {
        if (this.isPc) {
          return '99115dfb07133750ba677d055874de87'
        } else {
          return '43b910dd8545535a83b0e957bed55965'
        }
      } // '99115dfb07133750ba677d055874de87'
    },
    {
      'key': 'userAgent',
      'value': () => {
        if (this.isPc) {
          return screen.webAgents[this.rndNum % screen.webAgents.length]
        } else {
          return screen.wapAgents[this.rndNum % screen.wapAgents.length]
        }
      } // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
    },
    {
      'key': 'webSmartID',
      'value': () => {
        return md5Hex(Math.random().toString())
      }
    },
    {
      'key': 'storeDb',
      'value': 'i1l1o1s1'
    },
    {
      'key': 'srcScreenSize',
      'value': `24xx${this.screen.size}`
    },
    {
      'key': 'scrAvailSize',
      'value': this.screen.avoid
    },
    {
      'key': 'localCode',
      'value': () => {
        const ipNum = rnd(2, 244)
        var b = [
          ipNum <= 80 ? 10 : (ipNum < 160 ? 172 : 192),
          ipNum < 80 ? rnd(1, 244) : (ipNum % 2 === 1 ? 16 : 168),
          rnd(2, 244),
          rnd(2, 244)
        ]
        // var b = a.split('.')
        if (b.length !== 4) { throw Error('Invalid format -- expecting a.b.c.d') }
        for (var c = a = 0; c < b.length; ++c) {
          var d = parseInt(b[c], 10)
          if (Number.isNaN(d) || d < 0 || d > 255) { throw Error('Each octet must be between 0 and 255') }
          a |= d << 8 * (b.length - c - 1)
          a >>>= 0
        }
        return a
      }// 3232235680
    }
  ]

  const info = []

  query.map(q => {
      const item = {
        key: q.key,
        value: typeof q.value === 'function' ? q.value() : q.value
      }
      info.push(item)
      info[item['key']] = item['value']
  })
  return info
}

module.exports = {
  getInfo,
  hashAlg
}
// const info = getInfo()
// const result = hashAlg(info)
// console.log(info, result)
// const j = [
//   {
//     'key': 'adblock',
//     'value': '0'
//   },
//   {
//     'key': 'browserLanguage',
//     'value': 'zh-CN'
//   },
//   {
//     'key': 'cookieCode',
//     'value': 'FGEIWcpSWYvZgyxGrQejXPSWiGUw0sdq'
//   },
//   {
//     'key': 'cookieEnabled',
//     'value': '1'
//   },
//   {
//     'key': 'custID',
//     'value': '133'
//   },
//   {
//     'key': 'doNotTrack',
//     'value': '1'
//   },
//   {
//     'key': 'flashVersion',
//     'value': 0
//   },
//   {
//     'key': 'javaEnabled',
//     'value': '0'
//   },
//   {
//     'key': 'jsFonts',
//     'value': 'c227b88b01f5c513710d4b9f16a5ce52'
//   },
//   {
//     'key': 'mimeTypes',
//     'value': '52d67b2a5aa5e031084733d5006cc664'
//   },
//   {
//     'key': 'os',
//     'value': 'MacIntel'
//   },
//   {
//     'key': 'platform',
//     'value': 'WEB'
//   },
//   {
//     'key': 'plugins',
//     'value': 'd22ca0b81584fbea62237b14bd04c866'
//   },
//   {
//     'key': 'timeZone',
//     'value': -8
//   },
//   {
//     'key': 'touchSupport',
//     'value': '99115dfb07133750ba677d055874de87'
//   },
//   {
//     'key': 'userAgent',
//     'value': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
//   },
//   {
//     'key': 'webSmartID',
//     'value': '181e331f4ccc1c55693ad2dac91e484e'
//   },
//   {
//     'key': 'storeDb',
//     'value': 'i1l1o1s1'
//   },
//   {
//     'key': 'srcScreenSize',
//     'value': '24xx1080x1920'
//   },
//   {
//     'key': 'scrAvailSize',
//     'value': '1057x1920'
//   },
//   {
//     'key': 'localCode',
//     'value': 3232235680
//   }
// ]

// // console.log(hashAlg(j))
