from openai import OpenAI
from config import BASE_URL


def get_client(api_key: str) -> OpenAI:
    """Create and return an OpenAI client configured for OpenRouter."""
    return OpenAI(base_url=BASE_URL, api_key=api_key)


def stream_response(client: OpenAI, messages: list, model: str):
    """Stream chat completion responses from the API."""
    stream = client.chat.completions.create(
        model=model,
        messages=messages,
        stream=True,
    )
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            yield chunk.choices[0].delta.content