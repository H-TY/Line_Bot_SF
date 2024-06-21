import 'dotenv/config'
import axios from 'axios'
import { distance } from '../utils/distance.js'
import template from '../templates/MsgTP.js'
import fs from 'node:fs'

// 我的google API
const API_KEY = process.env.API_KEY

// 搜索附近餐廳
export default async (event) => {
  try {
    // 使用者分享位置
    const userLX = event.message.latitude
    const userLY = event.message.longitude

    // 若使用者未提供位置，提示告知！
    if (!userLX || !userLY) {
      return event.reply('請分享您目前的位置，以便進行搜尋!')
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: `${userLX},${userLY}`,
        // 搜尋半徑 500 公尺內
        radius: 500,
        type: 'restaurant',
        key: API_KEY,
        language: 'zh-TW' // 指定語言為繁體中文
      }
    })
    const RS = response.data.results

    // 獲取所有的地點的詳細資訊
    const detailPlace = await Promise.all(RS.map(async d => {
      const detailsresponse = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
        params: {
          place_id: d.place_id,
          // 請求返回哪些資料
          fields: 'name,rating,photos,formatted_phone_number,opening_hours,formatted_address,business_status',
          key: API_KEY,
          language: 'zh-TW' // 指定語言為繁體中文
        }
      })

      // ● 取用各資料
      const Detail = detailsresponse.data.result
      // console.log(Detail)

      // 照片
      d.photos = Detail ? Detail.photos : []

      // 評價，如果評價不存在顯示'0'
      d.rating = Boolean(Detail.rating) === true ? Detail.rating : '0'

      // 營運狀態（CLOSED_TEMPORARILY 暫停營業；CLOSED_PERMANENTLY 永久停業）
      d.business_status = Detail.business_status

      // 營業時間
      if (Detail.business_status === 'CLOSED_TEMPORARILY') {
        d.opening_hours = '暫停營業'
      } else if (Detail.business_status === 'CLOSED_PERMANENTLY') {
        d.opening_hours = '永久停業'
      } else if (Detail.opening_hours === undefined) {
        d.opening_hours = '暫無營業時間資訊'
      } else if (Boolean(Detail.opening_hours.weekday_text) === true) {
        d.opening_hours = Detail.opening_hours.weekday_text.join('\n')
      } else if (Boolean(Detail.opening_hours.weekday_text) === false) {
        d.opening_hours = '暫無營業時間資訊'
      }

      // 地址資訊
      d.formatted_address = Boolean(Detail.formatted_address) === true ? Detail.formatted_address : '暫無地址資訊'

      // 電話資訊
      // （.replace(/\s+/g, '') 取代數字間的空白，因 FLEX MESSAGE 電話按鈕的值，只能存在數字和少數的符號）
      d.formatted_phone_number = Boolean(Detail.formatted_phone_number) === true ? Detail.formatted_phone_number.replace(/\s+/g, '') : '0'

      return d
    }))

    const replies = RS.map(d => {
      // google Place 回傳的資料中，取用經緯度，設為 X和Y
      const X = d.geometry.location.lat
      const Y = d.geometry.location.lng

      d.distance = distance(X, Y, event.message.latitude, event.message.longitude, 'K')

      return d
    })

      .sort((a, b) => {
        return a.distance - b.distance
      })

      .slice(0, 5)

      .map(d => {
        // 對照訊息模版，將值放入相對的位置
        const t = template()

        // 照片，沒有照片設置 https://webcomkb.com/crazydomains/web-hosting/cd_web_hosting_404_not_found.png
        if (d.photos && d.photos.length > 0) {
          t.hero.url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${d.photos[0].photo_reference}&key=${API_KEY}`
        } else { t.hero.url = 'https://webcomkb.com/crazydomains/web-hosting/cd_web_hosting_404_not_found.png' }

        // 店名
        t.body.contents[0].text = d.name

        // 評價icon
        t.body.contents[1].contents = rateToimg(d.rating)
        // 評價函式計算要放幾個星星icon
        function rateToimg() {
          const stars = []
          // 黃色星星數量
          for (let i = 0; i < Math.round(d.rating); i++) {
            stars.push({
              type: 'icon',
              size: 'sm',
              url: 'https://developers-resource.landpress.line.me/fx/img/review_gold_star_28.png'
            })
          }
          // 灰色星星數量
          for (let j = 0; j < (5 - Math.round(d.rating)); j++) {
            stars.push({
              type: 'icon',
              size: 'sm',
              url: 'https://developers-resource.landpress.line.me/fx/img/review_gray_star_28.png'
            })
          }
          return stars
        }

        // 評價分數
        t.body.contents[1].contents.push(
          {
            type: 'text',
            text: `${d.rating}`,
            size: 'xxl',
            color: '#999999',
            margin: 'lg',
            flex: 0,
            weight: 'bold'
          }
        )

        // 營業時間
        t.body.contents[2].contents[0].contents[1].text = d.opening_hours
        if (d.opening_hours === '暫停營業' || d.opening_hours === '永久停業') {
          t.body.contents[2].contents[0].contents[1].color = '#FF0000'
          t.body.contents[2].contents[0].contents[1].size = 'md'
        }

        // 地址
        t.body.contents[2].contents[1].contents[1].text = d.formatted_address

        // 按鈕撥打電話
        t.footer.contents[0].contents[0].action.uri = `tel:${d.formatted_phone_number}`
        // 當沒有電話資訊時，按鈕變成灰色
        if (d.formatted_phone_number == 0) {
          t.footer.contents[0].background.centerColor = '#808080'
          t.footer.contents[0].background.startColor = '#808080'
          t.footer.contents[0].background.endColor = '#808080'
        }

        // 更多資訊，連結至 google 商家網頁
        t.footer.contents[1].contents[0].action.uri = `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${d.place_id}`

        // Map，引導路線地圖
        t.footer.contents[2].contents[0].action.uri = `https://www.google.com/maps/dir/?api=1&destination=${d.geometry.location.lat},${d.geometry.location.lng}`

        return t
      })

    const result = await event.reply({
      type: 'flex',
      altText: '附近餐廳搜尋',
      contents: {
        type: 'carousel',
        contents: replies.length > 0 ? replies : [{ type: 'text', text: '附近無相關餐廳可供搜尋！' }]
      }
    })

    console.log(result)

    if (process.env.DEBUG === 'true') {
      console.log(result)
      if (result.message) {
        fs.writeFileSync('./dump/googleNearbySearch.json',
          JSON.stringify(replies, null, 2))
      }
    }
  } catch (error) {
    console.log(error)
    event.reply('發生錯誤')
  }
}
