import os


def read_system_prompt():
    with open(os.path.join(os.path.dirname(__file__), "system.md"), "r") as f:
        return f.read()


SYSTEM_PROMPT = read_system_prompt()
