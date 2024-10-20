import 'dotenv/config'
import axios from 'axios'
import { distance } from '../utils/distance.js'
import template from '../templates/MsgTP.js'
import fs from 'node:fs'

// 搜索附近餐廳
export default async (event) => {
  try {
    const myAPI = process.env.API_KEY

    // 使用者分享位置（經緯度）
    const userLat = event.message.latitude
    const userLng = event.message.longitude

    // ● 搜尋附近店家
    const { data } = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: `${userLat},${userLng}`,
        // 搜尋半徑 500 公尺內
        radius: 500,
        type: 'restaurant',
        key: myAPI,
        language: 'zh-TW' // 指定語言為繁體中文
      }
    })
    // console.log('data', data)
    // console.log('data.results', data.results)
    // console.log('data.results[0].geometry', data.results[0].geometry)

    // ● 先排序星等高的在前面
    // ● 再抓取前五名
    const topFive = data.results
      // 排序星等高的在前
      .sort((a, b) => {
        return b.rating - a.rating
      })
      // .slice(開始的索引位置, 結束的索引位置)，取陣列前5個，但不包含索引 5 對應的元素
      .slice(0, 5)

    // ● 再跟 google API 的 details 請求更詳細的資料
    // 取出 topFive 的所有 place_id 變成一個新的陣列
    const topFivePIs = topFive.map(tf => {
      return tf.place_id
    })
    console.log('topFivePIs', topFivePIs)
    console.log('topFivePIs[0]', topFivePIs[0])

    // 預設空陣列，等一下要放資料的
    const DMore = []

    for (let i = 0; i < topFivePIs.length; i++) {
      const Ddetails = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
        params: {
          place_id: topFivePIs[i],
          key: myAPI,
          language: 'zh-TW'
        }
      })
      // 將請求到的資料放置 DMore
      DMore.push(Ddetails)
    }

    // ● 製作要回復的訊息
    const replies = DMore
      // 計算每個店家的距離
      .map(D => {
        // 宣告店家的經緯度
        const Dlat = D.data.result.geometry.location.lat
        const Dlng = D.data.result.geometry.location.lng
        // 第二個 distanc 是引用 utils/distance.js，用來計算兩點距離的工具
        D.data.result.distance = distance(Dlat, Dlng, userLat, userLng, 'k')
        console.log('D', D)
        return D
      })
      // 排序靠近使用者的店家在前
      .sort((a, b) => {
        return a.distance - b.distance
      })
      .map(D => {
        const T = template()
        // 店家照片
        // 先用 photo_reference 與 google APi 取照片
        const DGPhoto = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${D.data.result.photos[0].photo_reference}&key=${myAPI}`
        T.hero.url = DGPhoto || 'https://webcomkb.com/crazydomains/web-hosting/cd_web_hosting_404_not_found.png'

        // 店家名稱
        T.body.contents[0].text = D.data.result.name
        // console.log('D.data.result.name', D.data.result.name)

        // 店家星等 rate
        // 星等不是整數，故先直接四捨五入
        const reD = Math.round(D.data.result.rating)
        const calSatr = (el) => {
          // 宣告陣列用來放黃星星和灰星星
          // 陣列預先放置"星等數字"的位置，之後會用到
          const DStar = [
            {
              type: 'text',
              text: '4.0',
              size: 'xxl',
              color: '#999999',
              margin: 'lg',
              flex: 0,
              weight: 'bold'
            }
          ]
          const Ystar = {
            type: 'icon',
            size: 'sm',
            url: 'https://developers-resource.landpress.line.me/fx/img/review_gold_star_28.png'
          }
          const Gstar = {
            type: 'icon',
            size: 'sm',
            url: 'https://developers-resource.landpress.line.me/fx/img/review_gray_star_28.png'
          }
          for (let j = 0; j < (5 - el); j++) {
            // 灰星星的數量加入空陣列
            DStar.unshift(Gstar)
          }
          for (let i = 0; i < el; i++) {
            // 黃星星的數量加入空陣列
            DStar.unshift(Ystar)
          }
          return DStar
        }
        T.body.contents[1].contents = calSatr(reD)

        // 評價分數
        // 因欄位資料類型是 text，故原 D.rating 是數字的資料類型需用 .toString() 專為文字
        T.body.contents[1].contents[5].text = D.data.result.rating.toString()

        // 營業時間，做個別設定
        const Dstatus = D.data.result.business_status
        const DOpening = (el) => {
          if (el === 'OPERATIONAL') {
            return {
              type: 'text',
              text: '營業中',
              color: '#00A600',
              size: 'sm',
              flex: 1
            }
          } else if (el === 'CLOSED_TEMPORARILY') {
            return {
              type: 'text',
              text: '暫停營業',
              color: '#aaaaaa',
              size: 'md',
              flex: 1
            }
          } else if (el === 'CLOSED_PERMANENTLY') {
            return {
              type: 'text',
              text: '永久停業',
              color: '#FF0000',
              size: 'md',
              flex: 1
            }
          }
        }
        T.body.contents[2].contents[0].contents[1] = DOpening(Dstatus)

        // 店家地址
        // 完整地址 D.plus_code.compound_code.slice(10) + D.vicinity
        T.body.contents[2].contents[1].contents[1].text = D.data.result.vicinity

        // 按鈕撥打電話
        // ★ line message 生成的 URI 符合格式要求，尤其是對於 tel: URI 需遵循以下格式：
        // - 正確格式: tel: 1234567890
        // - 錯誤格式: tel: 123 - 456 - 7890 或 tel: (123) 456 - 7890
        console.log('D.data.result.formatted_phone_number', D.data.result.formatted_phone_number)
        if (D.data.result.formatted_phone_number === undefined) {
          D.data.result.formatted_phone_number = 0
          T.footer.contents[0].background.centerColor = '#808080'
          T.footer.contents[0].background.startColor = '#808080'
          T.footer.contents[0].background.endColor = '#808080'
        }
        T.footer.contents[0].contents[0].action.uri = `tel:${D.data.result.formatted_phone_number.replace(/\s+/g, '').slice(0, 10)}`

        // 更多資訊，連結至 google 商家網頁
        T.footer.contents[1].contents[0].action.uri = D.data.result.url

        // Map，引導路線地圖
        T.footer.contents[2].contents[0].action.uri = `https://www.google.com/maps/dir/?api=1&destination=${D.data.result.geometry.location.lat},${D.data.result.geometry.location.lng}`

        return T
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
