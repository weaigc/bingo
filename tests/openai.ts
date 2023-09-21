import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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',
  baseURL: 'https://https://api.openai.com/v1/chat/completions'
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
