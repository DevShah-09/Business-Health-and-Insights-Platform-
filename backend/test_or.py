import asyncio
from openai import AsyncOpenAI

async def test():
    key = "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"
    client = AsyncOpenAI(api_key=key, base_url="https://openrouter.ai/api/v1")
    try:
        response = await client.chat.completions.create(
            model="google/gemini-2.5-flash",
            messages=[{"role": "user", "content": "hi"}],
            max_tokens=10
        )
        print("Success:", response.choices[0].message.content)
    except Exception as e:
        print("Error:", repr(e))

asyncio.run(test())
