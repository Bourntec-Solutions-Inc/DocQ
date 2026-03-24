from .openai_client import call_openai
from .gemini_client import call_gemini
from .claude_client import call_claude


def get_ai_client(model_name):
    if model_name == "OPENAI":
        return call_openai
    elif model_name == "GEMINI":
        return call_gemini
    elif model_name == "CLAUDE":
        return call_claude
    else:
        raise ValueError("Invalid model selected")
