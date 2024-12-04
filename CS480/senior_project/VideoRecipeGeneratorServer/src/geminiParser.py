from google.cloud import aiplatform
import sys

# TODO: CHECK IF OUTPUT FILE ALREADY EXISTS, DON'T REMAKE IF SO
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
    "From the following transcript of a recipe video, generate a recipe based on the recipe in the video with an ingredients section and instructions section: "
    + transcript
    + ": Please also use the following JSON SCHEMA:"
    + ' recipe = {"name" : str, "ingredients" : [{"ingredient" : str, "amount" : str}], "instructions" : [str] }. If you are missing a piece of information simply substitute with "BLANK". Thank you!'
)
stream = open("./outputFiles/parseFiles/parse-" + fileID + ".json", "w")

toWrite = get_chat_response(
    chat,
    prompt,
)


def scrub_lines(text):
    lines = text.split("\n")
    answer = []
    for line in lines:
        if line == "```json" or line == "```":
            continue
        else:
            answer.append(line)
    for line in answer:
        print(line)
    return answer


toWrite = scrub_lines(toWrite)
toWrite = "\n".join(toWrite)
stream.write(toWrite)
