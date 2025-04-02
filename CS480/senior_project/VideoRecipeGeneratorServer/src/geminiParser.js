import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

class GeminiParser {
  #genAI;
  #model;
  constructor() {
    try {
      this.#genAI = new GoogleGenerativeAI(process.env.GOOGLE_KEY); //
      this.#model = this.#genAI.getGenerativeModel({
        model: "gemini-2.0-flash-lite",
      });
    } catch (error) {
      console.error(error);
    }
  }
  async #sleep(milis) {
    return new Promise((resolve) => {
      setTimeout(resolve, milis);
    });
  }
  async generateParse(aTranscript, outputFileId) {
    //public method, takes aTranscript as a string and an id to call the output file

    let INITIAL_BACKOFF = 1;
    let MAX_BACKOFF = 8;

    return new Promise(async (resolve, reject) => {
      try {
        if (
          //check if a parse already exists for given ID
          fs.existsSync(`./outputFiles/parseFiles/parse-${outputFileId}.txt`)
        ) {
          return resolve(`./outputFiles/parseFiles/parse-${outputFileId}.txt`);
        }

        let fileId = outputFileId;
        let prompt = this.#generatePrompt(aTranscript);
        let geminiResponse;
        let waitFor = INITIAL_BACKOFF;
        while (waitFor <= MAX_BACKOFF) {
          try {
            geminiResponse = await this.#model.generateContent(prompt);
            if (geminiResponse.response.text()) {
              geminiResponse = geminiResponse.response.text();
              if (geminiResponse.length > 0) break;
            }
          } catch (e) {
            if (e.status == 503 && waitFor <= 8) {
              waitFor *= 2;
              await this.#sleep(waitFor * 1000);
            } else {
              throw new Error("Progressive Back-Off Failed");
            }
          }
        }
        fs.writeFileSync(
          //write result to outputfile
          `./outputFiles/parseFiles/parse-${fileId}.txt`,
          this.#scrubLines(geminiResponse)
        );

        let outputPath = `./outputFiles/parseFiles/parse-${fileId}.txt`;
        return resolve(outputPath); //return the path to file
      } catch (e) {
        console.error(`geminiParser.js: ${e}`);
        return reject(e);
      }
    });
  }
  #generatePrompt(aTranscript) {
    //Just plugs the transcript string into the

    let prompt =
      "From the following transcript of a recipe video, generate a recipe with an ingredients section and an instructions section:\r\n" +
      "```\r\n" +
      aTranscript +
      "```\r\n" +
      "Please use the following JSON schema:\r\n" +
      "```\r\n" +
      JSON.stringify({
        name: "string",
        ingredients: [{ ingredient: "string", amount: "string" }],
        instructions: [{ instruction: "string" }],
      }) +
      "\r\n```\r\n" +
      " If any information is missing, replace it with the string 'BLANK'. Ensure the instructions array contains objects, where each object has an instruction string without numbers, bullet points, or additional formatting.\r\n" +
      `Here's an example output:\r\n` +
      "```\r\n" +
      `{
         "name": "Pasta Recipe",
          "ingredients": 
          [
            { "ingredient": "Pasta", "amount": "200 grams" },
            { "ingredient": "Tomato Sauce", "amount": "1 cup" }
          ],
          "instructions": 
          [
                { "instruction": "Boil the pasta until cooked." },
                { "instruction": "Mix the pasta with the tomato sauce." }
          ]
        }\r\n` +
      "```\r\n" +
      `Thank you!`;

    return prompt;
  }
  #scrubLines(text) {
    //necessary bc Gemini for some reason includes markdown backticks for generating a code block in its output
    let ans = "";
    let lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (i != 0 && i != lines.length - 1) {
        ans += lines[i] + "\n";
      }
    }
    return ans;
  }
}
export default GeminiParser;
