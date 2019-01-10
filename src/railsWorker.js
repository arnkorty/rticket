
const utils = require('./utils')

const QueryLeft = require('./queryLeft')
const Buyer = require('./buyer')
const EventEmitter = require('events');

class Worker {
  /**
   * @param {*} ticketInfo
   *  { username, password, passenger, ticket }
   */
  constructor(ticketInfo, workNum = 2) {
    const { username, password, passengers, ticket } = ticketInfo
    this.username = username
    this.password = password
    this.passengers = passengers
    this.ticket = ticket
    this.buyInfo = this.getBuyInfo()
    this.buyEvent = new EventEmitter()
    this.queryEngine = new QueryLeft(this.buyInfo)
    this.buyers = []
    this.state = {}
    for(let i = 0; i < workNum; i ++) {
      this.buyers.push(new Buyer(this.username, this.password, this.buyInfo, this.queryEngine, {log_tag: `w-${i}`, state: this.state, event: this.buyEvent}))
    }
    this.buyers.forEach(l => {
      l.initDevice().then(() => {
        l.run()
      })
    })
  }

  getBuyInfo () {
    // const query = {
    //   'leftTicketDTO.train_date': this.condit.date,
    //   'leftTicketDTO.from_station': this.condit.from,
    //   'leftTicketDTO.to_station': this.condit.to,
    //   purpose_codes: this.condit.purpose_codes
    // }
    // const condit = {
    //   seats: this.condit.seats,
    //   buyNum: (this.condit.passengers || []).length,
    //   train_codes: this.condit.train_codes
    // }

    const dates = this.ticket.date.split('-')
    const now = new Date()
    const info = {
      passengers: this.passengers,
      condit: {
        ...this.ticket,
        year: dates[0],
        month: dates[1],
        day: dates[2],
        buyNum: this.passengers.length
      },
      query: {
        'leftTicketDTO.train_date': this.ticket.date,
        'leftTicketDTO.from_station': this.ticket.from || utils.getStationCode(this.ticket.from_name),
        'leftTicketDTO.to_station': this.ticket.to || utils.getStationCode(this.ticket.to_name),
        purpose_codes: this.ticket.purpose_codes || 'ADULT'
      },
      startTime: new Date(Math.min(...utils.getSellTime(this.ticket.from_name, this.ticket.date))),
      futureTime: new Date(Math.min(1745997221089, ...utils.getSellTime(this.ticket.from_name, this.ticket.date).filter(t => t > now)))
    }
    return info
  }
}

Worker.run = (options) => {
  console.log(options)
  new Worker(options)
  // const worker = new Worker({
  //   username: 'anfdsz.com',
  //   password: 'fufds7',
  //   passengers: [
  //     {
  //       name: 'xxxxxxxxxxxxxxxxxxxxxxx',
  //       id_no: '440xxxxxxxxxxxxxxxxx',
  //       id_type: 1
  //     }
  //   ],
  //   ticket: {
  //     date: '2019-01-16',
  //     from: 'SHH',
  //     to: 'CDW',
  //     from_name: '上海',
  //     to_name: '成都',
  //     purpose_codes: 'ADULT',
  //     seats: ['ze', 'yw'],
  //     train_codes: []
  //   }
  // })
}

module.exports = Worker
