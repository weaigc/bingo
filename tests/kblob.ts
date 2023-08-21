import FormData from 'form-data'

import { fetch } from '@/lib/isomorphic'

const formData = new FormData()

const knowledgeRequest = {
  "imageInfo": {
    "url": "https://www.baidu.com/img/PCfb_5bf082d29588c07f842ccde3f97243ea.png"
  },
  "knowledgeRequest": {
    "invokedSkills": ["ImageById"],
    "subscriptionId": "Bing.Chat.Multimodal",
    "invokedSkillsRequestData": { "enableFaceBlur": true },
    "convoData": { "convoid": "51D|BingProdUnAuthenticatedUsers|E3DCA904FF236C67C3450163BCEC64CFF3F618CC8A4AFD75FD518F5ED0ADA080",
    "convotone": "Creative" }
  }
}

formData.append('knowledgeRequest', JSON.stringify(knowledgeRequest))


const jsonData = {
  "imageInfo": { "url": "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png?1=1" },
  "knowledgeRequest": {
    "invokedSkills": ["ImageById"],
    "subscriptionId": "Bing.Chat.Multimodal",
    "invokedSkillsRequestData": { "enableFaceBlur": true },
    "convoData": { "convoid": "", "convotone": "Creative" }
  }
}

fetch('https://www.bing.com/images/kblob',
  {
    method: 'POST',
    body: formData.getBuffer(),
    headers: {
    'Referer': 'https://www.bing.com/search',
      ...formData.getHeaders()
    }

  }
).then(res => res.text())
  .then(res => console.log('res', res))
