export default () => {
  return {
    type: 'bubble',
    hero: {
      type: 'image',
      url: 'https://developers-resource.landpress.line.me/fx/img/01_1_cafe.png',
      size: 'full',
      aspectRatio: '20:13',
      aspectMode: 'cover',
      action: {
        type: 'uri',
        uri: 'https://line.me/'
      }
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: 'Brown Cafe',
          weight: 'bold',
          size: 'xl'
        },
        {
          type: 'box',
          layout: 'baseline',
          margin: 'sm',
          contents: [
            {
              type: 'icon',
              size: 'sm',
              url: 'https://developers-resource.landpress.line.me/fx/img/review_gold_star_28.png'
            },
            {
              type: 'icon',
              size: 'sm',
              url: 'https://developers-resource.landpress.line.me/fx/img/review_gold_star_28.png'
            },
            {
              type: 'icon',
              size: 'sm',
              url: 'https://developers-resource.landpress.line.me/fx/img/review_gold_star_28.png'
            },
            {
              type: 'icon',
              size: 'sm',
              url: 'https://developers-resource.landpress.line.me/fx/img/review_gold_star_28.png'
            },
            {
              type: 'icon',
              size: 'sm',
              url: 'https://developers-resource.landpress.line.me/fx/img/review_gray_star_28.png'
            },
            {
              type: 'number',
              text: '4.0',
              size: 'xxl',
              color: '#999999',
              margin: 'lg',
              flex: 0,
              weight: 'bold'
            }
          ]
        },
        {
          type: 'box',
          layout: 'vertical',
          margin: 'md',
          spacing: 'sm',
          contents: [
            {
              type: 'box',
              layout: 'baseline',
              spacing: 'sm',
              contents: [
                {
                  type: 'text',
                  text: '營業時間',
                  color: '#aaaaaa',
                  size: 'sm',
                  flex: 1
                },
                {
                  type: 'text',
                  text: '10:00 - 23:00',
                  wrap: true,
                  color: '#666666',
                  size: 'sm',
                  flex: 3
                }
              ]
            },
            {
              type: 'box',
              layout: 'baseline',
              spacing: 'sm',
              contents: [
                {
                  type: 'text',
                  text: '地址',
                  color: '#aaaaaa',
                  size: 'sm',
                  flex: 1
                },
                {
                  type: 'text',
                  text: 'Flex Tower, 7-7-4 Midori-ku, Tokyo',
                  wrap: true,
                  color: '#666666',
                  size: 'sm',
                  flex: 3
                }
              ]
            }
          ]
        }
      ],
      paddingBottom: '20px'
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              action: {
                type: 'uri',
                label: 'Call',
                uri: 'tel:0123456789'
              },
              color: '#FFFFFF',
              adjustMode: 'shrink-to-fit'
            }
          ],
          width: '130px',
          height: '44px',
          backgroundColor: '#808080',
          cornerRadius: '10px',
          borderColor: '#FF99CC',
          justifyContent: 'center',
          alignItems: 'center',
          background: {
            type: 'linearGradient',
            angle: '0deg',
            centerColor: '#ffb517',
            startColor: '#e66000',
            endColor: '#ffc20f'
          },
          offsetBottom: '10px'
        },
        {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              action: {
                type: 'uri',
                label: '　更多資訊　',
                uri: 'https://www.google.com/maps/search/?api=1&query=Google&query_place_id=YOUR_PLACE_ID'
              },
              position: 'absolute',
              color: '#FFFFFF',
              style: 'link',
              adjustMode: 'shrink-to-fit'
            }
          ],
          background: {
            type: 'linearGradient',
            angle: '0deg',
            startColor: '#666666',
            endColor: '#FFFFFF',
            centerColor: '#CCCCCC',
            centerPosition: '100%'
          },
          width: '130px',
          height: '44px',
          position: 'absolute',
          backgroundColor: '#003366',
          cornerRadius: '10px',
          justifyContent: 'center',
          alignItems: 'center',
          offsetEnd: '10px',
          offsetTop: '0px'
        },
        {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              action: {
                type: 'uri',
                uri: 'https://www.google.com/maps/dir/?api=1&destination=X,Y',
                label: '　　　　　　Map　　　　　　'
              },
              position: 'absolute',
              color: '#ffffff',
              style: 'link',
              adjustMode: 'shrink-to-fit'
            }
          ],
          cornerRadius: '10px',
          justifyContent: 'center',
          alignItems: 'center',
          background: {
            type: 'linearGradient',
            angle: '0deg',
            startColor: '#339933',
            endColor: '#66CC00',
            centerColor: '#66CC00'
          },
          width: '100%',
          height: '44px'
        }
      ],
      flex: 0,
      position: 'relative',
      height: '115px'
    }
  }
}
