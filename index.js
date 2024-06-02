import 'dotenv/config'
import linebot from 'linebot'
import axios from 'axios'
import testfe from './test/fe.js'

const bot = linebot({
    channelId: process.env.CHANNEL_ID,
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

// ● 鸚鵡回話功能
// bot.on('message', async (event) => {
//     console.log(event)

//     if (event.message.type !== 'text')
//         return
//     try {
//         const result = await event.reply(event.message.text)
//         console.log(result)
//     } catch (error) {
//         console.log(error)
//     }
// })

// ● 網頁爬蟲，回傳所指定的相關資料（前提是網頁不擋跨域）
bot.on('message', async (event) => {
    if (process.env.DEBUG === 'true') {
        console.log(event)
    }
    if (event.message.type = 'text') {
        if (event.message.text = '前端') {
            testfe(event)
        }
    }
})





bot.listen('/', process.env.PORT || 3000, () => {
    console.log('機器人啟動了！')
})
