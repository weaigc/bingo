import OpenAI from 'openai';

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: 'PUT_YOUR_NOVA_API_KEY_HERE', 
  baseURL: 'https://api.nova-oss.com/v1/',
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'What is the highest mountain?' }
    ],
    model: 'gpt-3.5-turbo',
  });
  
  console.log(completion.choices);
}

main();