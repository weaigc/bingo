import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'dummy',
  baseURL: 'http://bing.wdsj.one' // 这里改成你自己部署的服务地址
});

async function start() {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'user', content: '你好' },
    ],
    model: 'gpt-3.5-turbo',
    stream: true,
  });
  for await (const part of completion) {
    process.stdout.write(part.choices[0]?.delta?.content || '');
  }
}

start()
