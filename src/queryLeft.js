const Base = require('./base')
const utils = require('./utils')
const qs = require('querystring')

const EventEmitter = require('events');
const minTimeDue = 1000 * 60 * 2

const TICKET_UPDATE_EVENT = 'ticket'

const delay = (millsecond) => {
  return new Promise((resolve) => {
    setTimeout(resolve, millsecond)
  })
}

class QueryLeft {
  constructor(buyInfo, workersNum = 4) {
    console.log('queryLeftBuyInfo', buyInfo)
    this.workers = []
    for(let i = 0; i < workersNum ; i ++) {
      this.workers.push(new Base('queryleft-worker-' + i))
    }
    this.workersNum = workersNum
    this.queryCount = 0
    this.buyInfo = buyInfo
    this.eventEmitter = new EventEmitter()
    this.result = []
    this.store = {
      latest: new Date(),
      result: []
    }
    this.workers.forEach(w => {
      w.initDevice()
    })
  }

    toUrl(path) {
      return `https://kyfw.12306.cn/otn/${path}`
    }

  currentWork() {
    return this.workers[this.queryCount % this.workersNum]
  }

  storeValid(){
    return this.store.latest && new Date().getTime() - this.store.latest < minTimeDue
  }

  onlyQueryLeft () {
    const { query, condit } = this.buyInfo
    // this.querying = true
    this.currentUrl = 'https://kyfw.12306.cn/otn/leftTicket/init?linktypeid=dc'
    const fullURL = this.queryLeftURL + `?${qs.stringify(query)}`
    // this.log('only fullurl', fullURL)
    return this.workers[(this.queryCount - 1) % this.workersNum].get({
      uri: fullURL,
      headers: {
        'If-Modified-Since': 0,
        'Cache-Control': 'no-cache',
        Referer: this.currentUrl
      },
      ajax: true
    }).then(res => {
      this.workers[0].log('queryLeft Raw', (res.body || '').substr(0, 30))
      const json = JSON.parse(res.body)
      this.querying = false
      this.store.latest = new Date().getTime()
      this.store.result = utils.decodeResult(
        json.data.result, json.data.map, {
          ...condit,
          // filterFlag
        }
      ).canBuys
      // console.log(this.store.result)
      this.eventEmitter.emit(TICKET_UPDATE_EVENT)
    })
  }
  doQueryLeft () {
    this.queryCount ++
    if (this.queryLeftURL) {
      return this.onlyQueryLeft()
    } else {
      return this.currentWork().get({
        uri: 'https://kyfw.12306.cn/otn/leftTicket/init'
      }).then(r => {
        const reg = /LeftTicketUrl\s=\s\'(.+?)\'/
        const { body } = r
        const match = body.match(reg)
        if (match) {
          this.queryLeftURL = this.toUrl(match[1])
        } else {
          this.queryLeftURL = this.toUrl('leftTicket/queryA')
          this.log('queryleft url', this.queryLeftURL)
        }
        return this.queryLeftURL
      }).then(() => {
        return this.onlyQueryLeft()
      })
    }
  }

  queryLeft() {
    console.log('starting queryLeft ', new Date(), '.......', this.storeValid(), this.store.result.length, this.querying)
    if(this.storeValid() && this.store.result.length > 0) {
      const rs = this.store.result.pop()
      return Promise.resolve(rs)
    } else if(this.querying) {
      return new Promise((resolve) => {
        this.eventEmitter.once(TICKET_UPDATE_EVENT, () => {
          return this.queryLeft().then(resolve)
        })
      })
    } else {
      // delay
        // return this.doQueryLeft().then(() => {
        //   return this.queryLeft()
        // })
        if (this.canQueryLeft()) {
          // console.log('no ticket ....', list)
          const now = new Date().getTime()
          // console.log(buyInfo)
          const nowDiff = now - this.buyInfo.startTime.getTime()
          let futureDiff = -1
          // let isFutureWait = false
          let diff = 2000 + 500 * Math.random()
          if (this.buyInfo.futureTime) {
            futureDiff = this.buyInfo.futureTime.getTime() - now
          }
          if (nowDiff <= 0) {
            diff = nowDiff
          } else if (nowDiff > 0 && nowDiff < minTimeDue) {
            diff = Math.floor(Math.random() * 200)
          } else if (futureDiff >= 0 && futureDiff < minTimeDue) {
            diff = futureDiff
            // isFutureWait = true
          } else if (futureDiff > -minTimeDue && futureDiff < 0) {
            diff = Math.floor(Math.random() * 200)
          }
          if(this.store.latest && now - this.store.latest > minTimeDue) {
            diff = 0
          }
          // if(isFutureWait) {
          // }
          console.log('diff...', diff, futureDiff)
          this.querying = true
          return delay(diff).then(() => {
            return this.doQueryLeft()
          }).then(() => {
            console.log('doQueryleft finished............', this.store)
            return this.queryLeft()
          })
        } else {
          throw new Error('不可查询')
        }
    }
  }

  canQueryLeft(){
    return true
  }
}

module.exports = QueryLeft
