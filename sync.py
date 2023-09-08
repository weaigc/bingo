from huggingface_hub import HfApi, list_models
import os

# Use root method
models = list_models()
hf_api = HfApi(
    endpoint="https://huggingface.co", # Can be a Private Hub endpoint.
    token=os.environ.get('HF_TOKEN'), # Token is not persisted on the machine.
)

hf_api.add_space_secret('hf4all/bingo2', 'ENDPOINT', 'cf.github1s.tk')
