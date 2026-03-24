import requests
import json

def generate_chat_response(model, context, message):
    """
    Generate a human-like, context-aware AI response using the BRN-LLAMA API.
    Enforces a strict persona that only answers based on provided execution data.
    """
    
    # Check if we have actual execution data in context
    if "--- EXECUTION RESULTS ---" in context and context.strip().endswith("--- EXECUTION RESULTS ---"):
        return (
            "Hello! I'm DocQ. I'm ready to help, but it looks like this workflow doesn't have any execution data yet. "
            "Would you like to trigger it now so I can analyze the results for you? [TRIGGER_ACTION:IMMEDIATE]"
        )

    # Persona Instructions: Human-like, concise, context-strict.
    system_persona = (
        "You are DocQ, a professional but conversational AI assistant specialized in analyzing these specific workflow results. "
        "INSTRUCTIONS:\n"
        "1. Be human-like and direct. If the user says 'Hi', greet them back as DocQ and ask what they need to know about these results.\n"
        "2. ONLY answer based on the provided context below. If facts are not in the context, politely state you don't have that data.\n"
        "3. Do NOT provide general world knowledge (e.g. artist history) unless it is explicitly in the results below.\n"
        "4. No formal report headers (like '# Trend Analysis') unless specifically requested. Just talk like a teammate.\n"
        "5. Keep responses concise and focused on the user's specific question."
    )

    full_prompt = f"{system_persona}\n\nDATA CONTEXT:\n{context}\n\nUSER QUESTION: {message}"
    
    payload = {
        "model": "BournAI",
        "prompt": full_prompt,
        "stream": False,
        "agent_id": "uhli23jn3oiuhgo847yyjvdhtrdy3tgfe8gfgoe87rugekuuyjommjferhjgo5go49uoi3uyrp938ry",
        "platform_id": "DSuite"
    }
    
    try:
        res = requests.post(
            "https://brn-llama.bourntec.com/api/process", 
            json=payload, 
            timeout=120,
            verify=True
        )
        
        if res.status_code == 200:
            data = res.json()
            response_text = data.get("response") or data.get("text") or data.get("content")
            
            if isinstance(response_text, list) and len(response_text) > 0:
                item = response_text[0]
                if isinstance(item, dict):
                    response_text = item.get("text") or item.get("content")

            if not response_text:
                response_text = "I received a blank response from the engine. Could you rephrase your question?"
                
            return response_text
        else:
            return "The analysis engine is currently busy. Please give me a second and try again."

    except Exception as e:
        return (
            "I'm having trouble connecting to the intelligence engine right now. "
            "Verification of the endpoint status [brn-llama.bourntec.com] might be needed."
        )
