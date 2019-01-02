const stationMaps = require('./station_name')
const getSellTime = require('./schedule').getSellTime
const allSeats = [{
  'label': '二等座',
  'value': 'ZE'
},
{
  'label': '一等座',
  'value': 'ZY'
},
{
  'label': '硬卧',
  'value': 'YW'
},
{
  'label': '硬座',
  'value': 'YZ'
},
{
  'label': '商务座',
  'value': 'SWZ'
},
{
  'label': '特等座',
  'value': 'TZ'
},
{
  'label': '高级软卧',
  'value': 'GR'
},
{
  'label': '软卧',
  'value': 'RW'
},
{
  'label': '动卧',
  'value': 'SRRB'
},
{
  'label': '高级动卧',
  'value': 'YYRW'
},
{
  'label': '软座',
  'value': 'RZ'
},
{
  'label': '无座',
  'value': 'WZ'
}
]
const getSeatType = (cs) => {
  var cr = ''
  if (cs == 'ZY') {
    cr = 'M'
  }
  if (cs == 'ZE') {
    cr = 'O'
  }
  if (cs == 'SWZ') {
    cr = '9'
  }
  if (cs == 'TZ') {
    cr = 'P'
  }
  if (cs == 'YZ') {
    cr = '1'
  }
  if (cs == 'RZ') {
    cr = '2'
  }
  if (cs == 'YW') {
    cr = '3'
  }
  if (cs == 'RW') {
    cr = '4'
  }
  if (cs == 'GR') {
    cr = '6'
  }
  if (cs == 'WZ') {
    cr = 'WZ'
  }
  if (cs == 'SRRB') {
    cr = 'F'
  }
  if (cs == 'YYRW') {
    cr = 'A'
  }
  return cr
}
const allSeatsKeys = allSeats.map(l => l.value.toLowerCase())

const getStationCode = (stationName) => {
  return (stationMaps[stationName] || [])[2]
}
const getPassengerParams = (passgeners, seatType) => {
  return passgeners.map((passenger) => {
    return `${seatType},0,${passenger.ticket_type || 1},${passenger.name},1,${passenger.id_no},${passenger.phone_no || ''},N`
  }).join('_')
}
const getOldPassengerParams = (passgeners) => {
  return passgeners.map((passenger) => {
    return `${passenger.name},1,${passenger.id_no},${passenger.ticket_type || 1}`
  }).join('_') + '_'
}

const getHbPassengerStr = (passengers) => {
  return passengers.map(passenger => {
    return `${passenger.ticket_type}#${passenger.name}#1#${passenger.id_no}#${passenger.phone_no}`
  }).join(';')
}

const getBestSeatType = (item, seats, buyNum) => {
  const sts = (seats && seats.length > 0) ? seats : allSeatsKeys
  for (let seat of sts) {
    if (item[`${seat}_num`] === '有' || (parseInt(item[`${seat}_num`]) || 0) > buyNum) {
      return getSeatType(seat.toUpperCase())
    }
  }
}
const decodeResult = (cu, cw, condit = {}) => {
  var ct = []
  const {
    filterFlag = true, seats = allSeatsKeys, train_codes = [], buyNum = 1
  } = condit
  for (var cs = 0; cs < cu.length; cs++) {
    var cx = []
    var cr = cu[cs].split('|')
    if (filterFlag && !cr[0]) {
      continue
    }
    // console.log('------------------------')
    cx.secretStr = cr[0]
    cx.buttonTextInfo = cr[1]
    var cv = []
    cv.train_no = cr[2]
    cv.station_train_code = cr[3]
    // if(cv.station_train_code === 'Z36') {
    //   console.log(',,,,fdsf', cv, cr, seats)
    // }
    // if (filterFlag && train_codes.length > 0 && !train_codes.includes(cv.station_train_code)) {
    // continue
    // }
    // console.log('*******-------------')

    cv.start_station_telecode = cr[4]
    cv.end_station_telecode = cr[5]
    cv.from_station_telecode = cr[6]
    cv.to_station_telecode = cr[7]
    cv.start_time = cr[8]
    cv.arrive_time = cr[9]
    cv.lishi = cr[10]
    cv.canWebBuy = cr[11]
    cv.yp_info = cr[12]
    cv.start_train_date = cr[13]
    cv.train_seat_feature = cr[14]
    cv.location_code = cr[15]
    cv.from_station_no = cr[16]
    cv.to_station_no = cr[17]
    cv.is_support_card = cr[18]
    cv.controlled_train_flag = cr[19]
    cv.gg_num = cr[20] ? cr[20] : '--'
    cv.gr_num = cr[21] ? cr[21] : '--'
    cv.qt_num = cr[22] ? cr[22] : '--'
    cv.rw_num = cr[23] ? cr[23] : '--'
    cv.rz_num = cr[24] ? cr[24] : '--'
    cv.tz_num = cr[25] ? cr[25] : '--'
    cv.wz_num = cr[26] ? cr[26] : '--'
    cv.yb_num = cr[27] ? cr[27] : '--'
    cv.yw_num = cr[28] ? cr[28] : '--'
    cv.yz_num = cr[29] ? cr[29] : '--'
    cv.ze_num = cr[30] ? cr[30] : '--'
    cv.zy_num = cr[31] ? cr[31] : '--'
    cv.swz_num = cr[32] ? cr[32] : '--'
    cv.srrb_num = cr[33] ? cr[33] : '--'
    cv.yp_ex = cr[34]
    const seatNums = seats.map(st => cv[`${st}_num`] === '有' ? 200 : (cv[`${st}_num`] === '无' ? -1 : (parseInt(cv[`${st}_num`], 10) || 0)))
    // console.log(cv)
    // console.log(seats, cv)
    // if (filterFlag && (cv.max_num < buyNum || cv.canWebBuy !== 'Y')) {
    // continue
    // }

    const otherScore1 = (cv.start_station_telecode === cv.from_station_telecode ? 0.4 : 0) + (
      cv.end_station_telecode === cv.to_station_telecode ? 0.3 : 0
    )
    const otherScore2 = (cv.start_station_telecode === cv.from_station_telecode ? -0.4 : 0) + (
      cv.end_station_telecode === cv.to_station_telecode ? -0.3 : 0
    )
    cv.max_num = Math.max(...seatNums) + otherScore1
    // console.log('max...', seatNums)
    // console.log(cv.max_num)
    cv.min_num = Math.min(...seatNums) + otherScore2
    // console.log(cv.min_num)
    // console.log('_______________________')
    cv.seat_types = cr[35]
    cv.exchange_train_flag = cr[36]
    cv.houbu_train_flag = cr[37]
    cv.from_station_name = cw[cr[6]]
    cv.to_station_name = cw[cr[7]]
    cx.queryLeftNewDTO = cv
    ct.push(cx)
  }

  ct = ct.sort((x, y) => x.queryLeftNewDTO.max_num >= y.queryLeftNewDTO.max_num ? 1 : -1)
  // console.log(ct[0])
  return {
    all: ct,
    canBuys: ct.filter(l => {
      let filterFlag = true
      if (train_codes && train_codes.length > 0 && !train_codes.includes(l.queryLeftNewDTO.station_train_code)) {
        filterFlag = false
      }
      if (filterFlag && (l.queryLeftNewDTO.max_num < buyNum || l.queryLeftNewDTO.canWebBuy === 'N')) {
        filterFlag = false
      }
      return filterFlag
    }),
    // afterBuys: ct.filter(l => {
    //   return l.queryLeftNewDTO.houbu_train_flag === '1'
    // })
  }
}

const getBeforeDateStr = (date) => {
  const time = new Date(date)
  time.setTime(time.getTime() - 1000 * 3600 * 24)
  return `${time.getFullYear()}-${time.getMonth() > 8 ? time.getMonth() : `0${this.getMonth()}`}-${time.getDate() > 9 ? time.getDate() : `0${time.getDate()}`}`
}

module.exports = {
  getSeatType,
  getSellTime,
  getStationCode,
  allSeats: allSeats.map((seat) => {
    return { ...seat,
      seat_type: getSeatType(seat.value)
    }
  }),
  allSeatsKeys,
  getPassengerParams,
  getOldPassengerParams,
  getHbPassengerStr,
  getBestSeatType,
  getBeforeDateStr,
  decodeResult
}
