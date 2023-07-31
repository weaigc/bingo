import FormData from 'form-data'

import { fetch } from '@/lib/isomorphic'

const formData = new FormData()

const knowledgeRequest = {"imageInfo":{"url":"https://www.baidu.com/img/PCfb_5bf082d29588c07f842ccde3f97243ea.png"},"knowledgeRequest":{"invokedSkills":["ImageById"],"subscriptionId":"Bing.Chat.Multimodal","invokedSkillsRequestData":{"enableFaceBlur":true},"convoData":{"convoid":"51D|BingProdUnAuthenticatedUsers|E3DCA904FF236C67C3450163BCEC64CFF3F618CC8A4AFD75FD518F5ED0ADA080","convotone":"Creative"}}}

formData.append('knowledgeRequest', JSON.stringify(knowledgeRequest))


fetch('https://bing.vcanbb.top/images/kblob',
  {
    method: 'POST',
    body: formData.getBuffer(),
    headers: {
      "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "Referer": "https://bing.vcanbb.top/web/index.html",
      "Referrer-Policy": "origin-when-cross-origin",
      ...formData.getHeaders()
    }

  }
).then(res => res.text())
.then(res => console.log('res', res))
