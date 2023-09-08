from huggingface_hub import HfApi, list_models
import os

hf_api = HfApi(
    endpoint="https://huggingface.co", # Can be a Private Hub endpoint.
    token=os.environ.get('HF_TOKEN'), # Token is not persisted on the machine.
)
ENDPOINTS = os.environ.get('ENDPOINTS')
file = 'endpoint.txt'
endpoints = ENDPOINTS.split('\n')
endpoint = endpoints[0].strip()
try:
    with open(file,"r") as f:
        content=f.read().strip()
        endpoint = endpoints[1] if content == endpoints[0] else endpoints[0]
        f.close()
except IOError:
    print("File not accessible")
    with open(file, "w") as wf:
        wf.write(endpoint)
        wf.close()

print('new endpoint', endpoint)
hf_api.add_space_secret('hf4all/bingo2', 'ENDPOINT', endpoint.strip())

