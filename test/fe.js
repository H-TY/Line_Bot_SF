import axios from "axios";
import * as cheerio from 'cheerio';

export default async (event) => {
    try {
        const { data } = await axios.get('https://wdaweb.github.io/')
        const $ = cheerio.load(data)
        const cou = []

        $('#fe .card-title').each(function () {
            cou.push($(this).text().trim())
        })

        const result = await event.reply(cou)
        if (process.env.DEBUG === 'true') {
            console.log(result)
        }
    } catch (error) {
        console.log(error)
        console.log('發生錯誤！')
    }
}