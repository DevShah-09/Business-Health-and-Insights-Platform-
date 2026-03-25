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
