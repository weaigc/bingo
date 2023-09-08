from huggingface_hub import HfApi, list_models
import os

hf_api = HfApi(
    endpoint="https://huggingface.co", # Can be a Private Hub endpoint.
    token=os.environ.get('HF_TOKEN'), # Token is not persisted on the machine.
)
ENDPOINTS = os.environ.get('ENDPOINTS')
file = 'endpoint.txt'
endpoints = ENDPOINTS.split('\n')
endpointIndex = '0'
try:
    with open(file,"r") as f:
        content=f.read().strip()
        print('content:', content)
        endpointIndex = '1' if content == '0' else '0'
        f.close()
except IOError:
    print("File not accessible")

with open(file, "w") as wf:
    wf.write(endpointIndex)
    wf.close()

print('new endpoint', endpoints[int(endpointIndex)])
hf_api.add_space_secret('hf4all/bingo', 'ENDPOINT', endpoints[int(endpointIndex)].strip())
