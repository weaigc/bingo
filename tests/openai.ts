import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'dummy',
  baseURL: 'https://bing.github1s.tk/api/openai/v1' // 这里改成你自己部署的服务地址
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
