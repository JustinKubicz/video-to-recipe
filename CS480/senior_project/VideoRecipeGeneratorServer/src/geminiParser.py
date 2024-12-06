from google.cloud import aiplatform
import sys


# https://cloud.google.com/vertex-ai/docs/python-sdk/use-vertex-ai-python-sdk

# https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemini-pro
import vertexai
from vertexai.preview.generative_models import GenerativeModel, ChatSession

# project_id = "PROJECT_ID"
location = "us-central1"
vertexai.init(project="gen-lang-client-0030813916")

model = GenerativeModel("gemini-1.5-flash-002")
chat = model.start_chat()


def get_chat_response(chat: ChatSession, prompt: str):
    response = chat.send_message(prompt)
    return response.text


transcript = sys.argv[1]
fileID = sys.argv[2]
prompt = (
    "From the following transcript of a recipe video, generate a recipe with an ingredients section and an instructions section: "
    + transcript
    + ". Please use the following JSON schema: "
    + '{"name": "string", "ingredients": [{"ingredient": "string", "amount": "string"}], "instructions": ["string"]}. If any information is missing, substitute with "BLANK". Thank you!'
)

stream = open("./outputFiles/parseFiles/parse-" + fileID + ".json", "w")

toWrite = get_chat_response(
    chat,
    prompt,
)


def scrub_lines(text):
    lines = text.strip().split("\n")
    answer = []

    for index, line in enumerate(lines):
        if index == 0 or index == len(lines) - 1:
            continue
        else:
            answer.append(line)
    return answer


toWrite = scrub_lines(toWrite)
toWrite = "\n".join(toWrite)
stream.write(toWrite)
