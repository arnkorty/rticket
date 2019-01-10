const Base = require('./base')
const qs = require('querystring')
const utils = require('./utils')

const jobDue = 1000 * 60 * 80
const loginMonitorTime = 60 * 1000 * 4
const minTimeDue = 1000 * 60 * 2
const testFlag = false //process.env.NODE_ENV !== 'production'

// const deviceInfo =

class Buyer extends Base {
  // purpose_codes: 0X00 学生
  constructor (username, password, buyInfo, queryEngine, { successCall, startCall, doneCall, state, log_tag } = {}) {
    super(username, {log_tag})
    this.log_tag = log_tag

    this.successCall = successCall
    this.startCall = startCall
    this.doneCall = doneCall
    this.state = state || {}
    // this.jobStart = new Date()
    // const jobEnd = new Date(this.jobEnd.getTime())
    // jobEnd.set
    // this.jobEnd = new Date(this.jobStart.getTime + 1000 * 60 * 9)
    this.password = password
    // 查询次数
    // 是否可以执行
    this.canRunning = true
    this.buyInfo = buyInfo
    this.passengers = buyInfo.passengers
    this.queryEngine = queryEngine
  }

  run () {
    const now = new Date().getTime()
    const alreadyBuys = [this.buyInfo].filter(l => l.startTime.getTime() < now)
    const futureBuys = [this.buyInfo].filter(l => l.startTime.getTime() >= now && l.startTime.getTime() < now + jobDue)
    // this.log('buyInfos', this.buyInfos)
    this.jobStart = now
    this.jobEnd = new Date(this.jobStart + jobDue)

    this.keepLogin().then((logined) => {
      if (logined) {
        return this.delay(1000).then(() => logined)
      }
      return logined
    }).then(logined => {
      if (this.startCall) {
        this.startCall({
          jobStart: this.jobStart,
          jobEnd: logined ? this.jobEnd : new Date()
        })
      }
      if (logined) {
            this.log('------------------------log futureBuys', this.buyInfo)
        if (futureBuys.length > 0) {
          if (futureBuys.length > 0) {
            // return
            const minFutureTime = new Date(Math.min(...futureBuys.map(l => l.startTime)))
            if (minFutureTime - now < jobDue) {
              this.jobEnd = new Date(minFutureTime.getTime() + jobDue)
            }
            futureBuys.forEach(buyInfo => {
              this.log('futureBuy setTimeout run', buyInfo.startTime.getTime() - new Date().getTime() + 100, buyInfo)
              setTimeout(() => {
                this.checkLogin()
              }, buyInfo.startTime.getTime() - new Date().getTime() + 8000 + 20000 * Math.random())
              setTimeout(() => {
                this.buy(buyInfo)
              }, buyInfo.startTime.getTime() - new Date().getTime() + 100)
            })
          }
        }

        alreadyBuys.forEach(buyInfo => {
          this.log('alreadyBuys-starting', buyInfo)
          this.buy(buyInfo)
        })
        setTimeout(() => {
          if (this.doneCall) {
            this.checkLogin().then(logined => {
              if (logined) {
                this.queryMyOrderNoComplete().then(rs => {
                  const {
                    data
                  } = JSON.parse(rs.body)
                  if (data && data.orderDBList && data.orderDBList.length > 0) {
                    this.finish({
                      order_id: data.orderDBList[0].sequence_no,
                      orderList: data.orderDBList,
                      train_code: data.orderDBList[0].train_code_page,
                      status: 100
                    })
                  }
                })
              }
            })
            this.doneCall({ queryCount: this.queryCount })
          }
          if (this.loginMonitorId) {
            clearTimeout(this.loginMonitorId)
          }
        }, this.jobEnd.getTime() - new Date())
      } else {
        if (this.doneCall) {
          this.log('LOGIN FAILURE, exit')
          this.doneCall()
        }
      }
    })
    // return this.buy()
  }

  toUrl (path) {
    return `https://kyfw.12306.cn/otn/${path}`
  }
  finish (data) {
    this.isFinish = true
    if (this.successCall) {
      this.successCall({ result: data, short_result: data.train_code, status: data.status })
    }
  }

  failure (buyInfo) {
    this.log('failure...', [...arguments])
  }

  getPassengerTicketStr (seatType) {
    return utils.getPassengerParams(this.buyInfo.passengers, seatType)
  }

  getOldPassengerStr () {
    if (this.oldPassengerStr) {
      return this.oldPassengerStr
    }
    this.oldPassengerStr = utils.getOldPassengerParams(this.buyInfo.passengers)
    return this.oldPassengerStr
  }

  doPost () {
    if (this.canRunning) {
      this.log('doPost', JSON.stringify(arguments[0]))
      return this.post(...arguments)
    } else {
      return Promise.reject(new Error('不能执行请求'))
    }
  }

  keepLogin () {
    return this.checkLogin().then(logined => {
      if (this.canQueryLeft()) {
        if (logined) {
          this.loginMonitorId = setTimeout(() => {
            console.log('setTimeout keepLogin')
            this.keepLogin()
          }, Math.floor(loginMonitorTime * (Math.random() * 2)))
          return logined
        } else {
          this.failure('登陆失败')
        }
      }
    })
  }

  login (tryTime = 0) {
    if (tryTime > 10) {
      this.canRunning = false
      return Promise.resolve(false)
    }
    // this.currentUrl = 'https://kyfw.12306.cn/otn/resources/login.html'
    return this.doPost({
      uri: this.toUrl('login/loginAysnSuggest'),
      form: {
        'loginUserDTO.user_name': this.username,
        'userDTO.password': this.password,
        randCode: ''
      },
      // followRedirect: false,
      ajax: true
    }).then((r) => {
      // console.log(r.body)
      this.log('login', r.body)
      const { data } = JSON.parse(r.body)
      // console.log(data)
      if (data && data.loginCheck === 'Y') {
        return this.delay(1000).then(() => this.checkUser(tryTime * tryTime * 3))
      } else {
        return this.login(tryTime + 1)
      }
    }).then(logined => {
      if (logined) {
        return logined
      } else {
        return this.login(tryTime + 1)
      }
      // if (json )
    })
  }

  checkLogin () {
    return this.checkUser().then(logined => {
      if (logined) {
        return logined
      } else {
        this.log('checkLogin', logined)
        return this.delay(500).then(r => this.login())
      }
    })
  }

  checkLoginConf (delay = 0) {
    return new Promise((resolve) => {
      setTimeout(resolve, delay)
    }).then(() => {
      return this.doPost({
        uri: this.toUrl('login/conf'),
        headers: {
          'If-Modified-Since': 0,
          'Cache-Control': 'no-cache'
        },
        form: {
          '_json_att': ''
        }
      })
    }).then(res => {
      const { data: { flag } } = JSON.parse(res.body)
      // return json
      return flag
    })
  }

  checkUser (delay = 0) {
    return new Promise((resolve) => {
      setTimeout(resolve, delay)
    }).then(() => {
      return this.doPost({
        uri: this.toUrl('login/checkUser'), // 'https://cx.12306.cn/tlcx/login/checkLogin',
        ajax: true,
        form: {
          '_json_att': ''
        },
        headers: {
          'If-Modified-Since': 0,
          'Cache-Control': 'no-cache'
        }
      })
    }).then(res => {
      // console.log(res.body, res)
      this.log('checkUser', res.body)
      const json = JSON.parse(res.body)
      return json.data.flag
    })
  }

  submitOrderRequest (condit, trainInfo) {
    return this.doPost({
      uri: this.toUrl('leftTicket/submitOrderRequest'),
      body: decodeURIComponent(qs.stringify({
        secretStr: trainInfo.secretStr,
        train_date: condit.date,
        back_train_date: condit.date,
        tour_flag: 'dc',
        purpose_codes: condit.purpose_codes || 'ADULT',
        query_from_station_name: condit.from_name,
        query_to_station_name: condit.to_name,
        undefined: ''
      })),
      ajax: true,
      defaultCatch: true
    })
  }

  doSubmitOrderRequest (condit, trainInfo, tryTime = 0) {
    return this.submitOrderRequest(condit, trainInfo).then(r => {
      this.log('submitOrderRequest', r ? r.body : r)
      // if ((!r || !r.body) && tryTime < 3) {
      //   this.log(`submitOrderRequest failure ${tryTime} request`)
      //   return this.doSubmitOrderRequest(condit, trainInfo, tryTime + 1)
      // }
      return r ? r.body : r
    })
  }

  getTokens () {
    return this.doPost({
      uri: this.toUrl('confirmPassenger/initDc'),
      form: {
        _json_att: ''
      },
      defaultCatch: true
    }).then(r => {
      if (!r || !r.body) {
        return {}
      }
      // console.log(r.body)
      const body = r.body
      const regToken = /globalRepeatSubmitToken\s\=\s\'(.+)\'/
      // const regKeyCheckIsChange = /key_check_isChange\'\:\'(.+?)\'/
      // const regLeftTicketStr = /leftTicketStr\'\:\'(.+?)\'/
      // const regTrainLocation = /train_location\'\:\'(.+?)\'/
      // const regPurposeCodes = /purpose_codes\'\:\'(.+?)\'/

      const ticketInfo = /ticketInfoForPassengerForm\=\{(.+?)\}\;/
      const orderRequestDTO = /orderRequestDTO\=\{(.+?)\}\;/
      // console.log(body.match(orderRequestDTO))
      return {
        token: (body.match(regToken) || [])[1],
        // key_check_isChange: (body.match(regKeyCheckIsChange)||[])[1],
        // leftTicketStr: (body.match(regLeftTicketStr) || [])[1],
        // train_location: (body.match(regTrainLocation) || [])[1],
        // purpose_codes: (body.match(regPurposeCodes) || [])[1],
        ticketInfo: eval(`({${(body.match(ticketInfo) || [])[1]}})`),
        orderInfo: eval(`({${(body.match(orderRequestDTO) || [])[1]}})`)
      }
    })
  }

  checkOrderInfo (seatType, token) {
    return this.doPost({
      uri: this.toUrl('confirmPassenger/checkOrderInfo'),
      form: {
        cancel_flag: 2,
        bed_level_order_num: '000000000000000000000000000000',
        passengerTicketStr: this.getPassengerTicketStr(seatType),
        oldPassengerStr: this.getOldPassengerStr(),
        tour_flag: 'dc',
        randCode: '',
        whatsSelect: 1,
        _json_att: '',
        REPEAT_SUBMIT_TOKEN: token
      }
    })
  }
  doCheckOrderInfo (seatType, token, tryTime = 0) {
    return this.checkOrderInfo(seatType, token).then(res => {
      this.log('checkOrderInfo', res.body)
      const json = JSON.parse(res.body)
      if (tryTime < 1 && !json.data.submitStatus) {
        return this.delay(200).then(() => this.doCheckOrderInfo(seatType, token, tryTime + 1))
      }
      if (json.data.submitStatus) {
        return json
      }
      return false
    })
  }

  confirmSingleForQueue (seatType, tks) {
    const { ticketInfo, token } = tks
    this.log('confirmSingleForQueue', seatType, token, ticketInfo)
    // console.log('confirmSingleFormQueue', seatType, tks)
    // this.state.submitting = true
    // return
    // if(this.state.submitting)
    return this.doPost({
      uri: this.toUrl('confirmPassenger/confirmSingleForQueue'),
      form: {
        passengerTicketStr: this.getPassengerTicketStr(seatType),
        oldPassengerStr: this.getOldPassengerStr(),
        randCode: '',
        purpose_codes: ticketInfo.purpose_codes,
        key_check_isChange: ticketInfo.key_check_isChange,
        leftTicketStr: ticketInfo.leftTicketStr,
        train_location: ticketInfo.train_location,
        choose_seats: '', // info.data.choose_Seats,
        seatDetailType: '000',
        whatsSelect: 1,
        roomType: '00',
        dwAll: 'N',
        '_json_att': '',
        REPEAT_SUBMIT_TOKEN: token
      }
    })
  }

  doQueryOrderWaitTime (query = {}, buyInfo, tryTime = 0) {
    return this.get({
      uri: this.toUrl('confirmPassenger/queryOrderWaitTime') + `?${qs.stringify({
        random: new Date().getTime(),
        tourFlag: 'dc',
        _json_att: '',
        ...query
      })}`,
      ajax: true,
      defaultCatch: true
    }).then(r => {
      if ((!r || !r.body) && tryTime < 3) {
        this.log('queryOrderWaitTime', `${tryTime} times retry request！！！`)
        return this.delay(200 + 500 * tryTime * tryTime).then(() => this.doQueryOrderWaitTime(tryTime > 1 ? {} : query, buyInfo, tryTime + 1))
      }
      this.log('queryOrderWaitTime', r.body)
      const json = JSON.parse(r.body)
      // console.log('waitTime', wtJson)
      const {
        data
      } = json
      if (!data.queryOrderWaitTimeStatus) {
        return { result: true, json }
      } else if (data.waitTime < 0) {
        if (data.msg) {
          return {result: false, json}
          // this.log()
          // this.doCbStack()
          // if (buyInfo) {
          //   this.buy(buyInfo)
          // } else {
          //   this.failure(data.msg)
          // }
        } else {
          return { result: true, json: json }
        }
      } else {
        return this.delay(2000).then(() => this.doQueryOrderWaitTime(query, buyInfo))
      }
    })
  }

  queryOrderWaitTime (query = {}, buyInfo) {
    return this.get({
      uri: this.toUrl('confirmPassenger/queryOrderWaitTime') + `?${qs.stringify({
        random: new Date().getTime(),
        tourFlag: 'dc',
        _json_att: '',
        ...query
      })}`,
      ajax: true,
      defaultCatch: true
    })
  }

  queryMyOrderNoComplete () {
    return this.doPost({
      uri: this.toUrl('queryOrder/queryMyOrderNoComplete'),
      form: {
        _json_att: ''
      },
      defaultCatch: true
    }).then(r => {
      if (!r.body) {
        return this.delay(100).then(() => {
          return this.checkLogin().then(() => this.queryMyOrderNoComplete())
        })
      }
      return r
    })
  }

  resultOrderForDcQueue (orderNo, token) {
    const params = {}
    if (token) {
      params.REPEAT_SUBMIT_TOKEN = token
    }
    return this.doPost({
      uri: this.toUrl('confirmPassenger/resultOrderForDcQueue'),
      form: {
        orderSequence_no: orderNo,
        _json_att: '',
        ...params
      }
    })
  }

  getQueueCount (seatType, tks) {
    const { orderInfo, ticketInfo, token } = tks
    return this.doPost({
      uri: this.toUrl('confirmPassenger/getQueueCount'),
      form: {
        train_date: new Date().toString(),
        train_no: orderInfo.train_no,
        stationTrainCode: orderInfo.station_train_code,
        seatType,
        fromStationTelecode: orderInfo.from_station_telecode,
        toStationTelecode: orderInfo.to_station_telecode,
        leftTicket: ticketInfo.queryLeftTicketRequestDTO.ypInfoDetail,
        purpose_codes: ticketInfo.purpose_codes,
        train_location: ticketInfo.train_location,
        REPEAT_SUBMIT_TOKEN: token
      }
    })
  }

  canQueryLeft () {
    return this.canRunning && !this.isFinish && this.jobEnd > new Date()
  }


  submitted() {
    return !!this.state.submitting
  }

  doSubmitOrder (buyInfo, seatType, list) {
    return this.doSubmitOrderRequest(buyInfo.condit, list).then((l) => {
      // this.log('doSubmitOrder', l.boby)
      // // console.log('-------------------------', l)
      // // this.log('doSubmitOrder', l.boby)
      // // console.log('subOrder', l.body)
      // if (!l || !l.body) {
      //   console.log(l)
      //   this.log('doSubmitOrder failure', l && l.body)
      // }
      // // console.log('_______________________')
      if (!l) {
        // this.doCbStack()
        return this.delay(1000).then(() => this.checkLogin().then((logined) => {
          if (logined) {
            return this.buy(buyInfo)
          } else {
            return this.failure(buyInfo, '登陆失败，导致无法购票')
          }
        }))
      }
      const stJson = JSON.parse(l)
      this.log('doSubmitOrder', stJson)
      if (!stJson.status) {
        if(!stJson.messages && stJson.messages.join().indexOf('未完成订单') === -1) {
          return this.delay(100).then(() => this.buy(buyInfo))
        }
      }
      // return l.body
      // console.log('--------------------------------------------------------------------------')
      return this.getTokens().then((tks) => {
        this.log('getTokens', tks.token)
        if (!tks.token) {
          return this.buy(buyInfo)
        }
        return this.doCheckOrderInfo(seatType, tks.token).then(info => {
          if (!info) {
            return this.buy(buyInfo)
          }
          // return
          if (testFlag) {
            return
          }
          this.log('checkState', this.state)
          if(this.submitted()) {
            if(this.state.event) {
              const now = new Date().getTime()
              this.state.event.once('submitted', () => {
                if(new Date().getTime() - now < 1000 * 80 && !this.submitted()) {
                  this.state.submitting = true
                  return new Promise((resolve) => {
                    return doConfirm().then(resolve)
                  })
                  // return new Promise(resolve)
                }
              })
            }
            return
          } else {
            this.state.submitting = true
          }
          const doConfirm = () => {
            return this.confirmSingleForQueue(seatType, tks).then(res => {
              this.log('confirmSingleForQueue', `${list.queryLeftNewDTO.train_no} - ${list.queryLeftNewDTO.station_train_code} -${seatType}` + res.body)
              const cfJson = JSON.parse(res.body)
              if (!cfJson.data.submitStatus) {
                // this.doCbStack()
                // console.log('confirmOrder', cfJson, res)
                this.doneSubmitted()
                return this.buy(buyInfo)
              }
              return this.delay(500).then(() => this.doQueryOrderWaitTime({
                REPEAT_SUBMIT_TOKEN: tks.token
              }, buyInfo)).then((rs) => {
                if (!rs) {
                  this.doneSubmitted()
                  return this.buy(buyInfo)
                }
                const { result, json } = rs

                if (!result) {
                  this.doneSubmitted()
                  return this.buy(buyInfo)
                }
                return this.queryMyOrderNoComplete().then(res1 => {
                  this.log('queryMyOrderNoComplete', res1)
                  this.log('currentState', this.state)
                  const { data } = JSON.parse(res1.body)
                  if (data && data.orderDBList && data.orderDBList.length > 0) {
                    this.finish({ order_id: json.data.orderId, orderList: data.orderDBList, train_code: list.queryLeftNewDTO.station_train_code, status: 100 })
                  } else {
                    // this.doCbStack()
                    return this.buy(buyInfo)
                  }
                })
              })
            })
          }
          return doConfirm()
        })
      })
    })
  }

  doneSubmitted() {
    if(this.state){
      this.state.submitting = false
      if(this.state.event) {
        this.state.event.emit('submitted')
      }
    }
  }

  buy (buyInfo) {
    const { condit } = buyInfo
    // this.log('buyInfo', buyInfo)
    // const condit = this.condit
    return this.queryEngine.queryLeft().then((list) => {
      // console.log('lists', lists.all)
      // this.log('buyQueryLeftList', list)

      const seatType = utils.getBestSeatType(list.queryLeftNewDTO, condit.seats, this.passengers.length)

      return this.doSubmitOrder(buyInfo, seatType, list)
    })
  }
}

module.exports = Buyer
