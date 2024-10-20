import 'dotenv/config'
import linebot from 'linebot'
import axios from 'axios'
import commandGNS from './commands/googleNearbySearch.js'

const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

// 使用者傳訊"地點（分享地點）"，機器人回傳"附近餐廳資訊"
bot.on('message', event => {
  if (process.env.DEBUG === 'true') {
    console.log(event)
  }
  if (event.message.type === 'location') {
    console.log('Line 有觸發')
    commandGNS(event)
  }
})

bot.listen('/', process.env.PORT || 3000, () => {
  console.log('機器人啟動了！')
})
