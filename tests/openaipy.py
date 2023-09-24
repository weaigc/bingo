import openai
openai.api_key = "dummy"
openai.api_base = "https://hf4all-bingo-api.hf.space" # 这里可以改为你自己部署的服务，bingo 服务版本需要 >= 0.9.0

# create a chat completion
completion = openai.ChatCompletion.create(model="Creative", stream=True, messages=[{"role": "user", "content": "Hello"}])
for chat_completion in completion:
    # print the completion
    print(chat_completion.choices[0].message.content, end="", flush=True)
