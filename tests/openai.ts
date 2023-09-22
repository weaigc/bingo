import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'dummy',
  baseURL: 'https://hf4all-bingo-api.hf.space/api/v1' // 这里改成你自己部署的服务地址
});

async function start() {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'user', content: '你好' },
    ],
    model: 'bing',
  });
  console.log(completion.choices[0].message.content)
}

start()
