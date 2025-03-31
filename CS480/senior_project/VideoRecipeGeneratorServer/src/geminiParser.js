import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

class GeminiParser {
  #genAI;
  #model;
  constructor() {
    try {
      this.#genAI = new GoogleGenerativeAI(process.env.GOOGLE_KEY); //
      this.#model = this.#genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });
    } catch (error) {
      console.error(error);
    }
  }
  async generateParse(aTranscript, outputFileId) {
    return new Promise(async (resolve, reject) => {
      try {
        if (
          fs.existsSync(`./outputFiles/parseFiles/parse-${outputFileId}.txt`)
        ) {
          console.log(
            `geminiParser.js: ./outputFiles/parseFiles/parse-${outputFileId}.txt exists already, resolving with that`
          );
          return resolve(`./outputFiles/parseFiles/parse-${outputFileId}.txt`);
        }

        let fileId = outputFileId;
        let prompt = this.generatePrompt(aTranscript);
        let result = await this.#model.generateContent(prompt);
        fs.writeFileSync(
          `./outputFiles/parseFiles/parse-${fileId}.txt`,
          this.scrubLines(result.response.text())
        );

        let outputPath = `./outputFiles/parseFiles/parse-${fileId}.txt`;
        return resolve(outputPath);
      } catch (e) {
        console.error(`geminiParser.js: ${e}`);
        return reject(e);
      }
    });
  }
  generatePrompt(aTranscript) {
    return (
      "From the following transcript of a recipe video, generate a recipe with an ingredients section and an instructions section: ```" +
      aTranscript +
      "``` Please use the following JSON schema: " +
      JSON.stringify({
        name: "string",
        ingredients: [{ ingredient: "string", amount: "string" }],
        instructions: [{ instruction: "string" }],
      }) +
      `. If any information is missing, replace it with the string "BLANK". Ensure the instructions array contains objects, where each object has an instruction string without numbers, bullet points, or additional formatting.
      
            Here's an example output:
            {
              "name": "Pasta Recipe",
              "ingredients": [
                { "ingredient": "Pasta", "amount": "200 grams" },
                { "ingredient": "Tomato Sauce", "amount": "1 cup" }
              ],
              "instructions": [
                { "instruction": "Boil the pasta until cooked." },
                { "instruction": "Mix the pasta with the tomato sauce." }
              ]
            }
            
            Thank you!`
    );
  }
  scrubLines(text) {
    //necessary bc Gemini for some reason includes markdown backticks for generating a code block in its output
    let ans = "";
    let lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (i != 0 && i != lines.length - 2) {
        ans += lines[i] + "\n";
      }
    }
    return ans;
  }
}
export default GeminiParser;
