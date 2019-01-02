// console.log(process.argv.splice(2))
const fs = require('fs')
const path = require('path')
const file = path.join(__dirname, process.argv.splice(2)[0])
// console.log(file)
const Rails = require('./src/railsWorker')
// console.log(path.join(__dirname, file))

if (file && fs.existsSync(file)) {
  console.log('running ', file)
  const json = JSON.parse(fs.readFileSync(file))
  console.log(json)
  // const rails = new Rails(json)
  console.log('开始执行')
  Rails.run(json)
  // rails.run()
} else {
  console.log('文件不存在')
  process.exit()
}
