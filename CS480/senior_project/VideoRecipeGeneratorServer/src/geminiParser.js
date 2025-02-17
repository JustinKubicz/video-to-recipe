import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

//1.open transcript file and assign to variable
//2. write ai response to file
//3. return the path to that file
async function generateParse(aTranscript, outputFileId) {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        fs.existsSync(`./outputFiles/parseFiles/parse-${outputFileId}.json`)
      ) {
        console.log(
          `geminiParser.js: ./outputFiles/parseFiles/parse-${outputFileId}.json exists already, resolving with that`
        );
        return resolve(`./outputFiles/parseFiles/parse-${outputFileId}.json`);
      }
      let genAI = new GoogleGenerativeAI(
        "AIzaSyDdxnxeMtA9yJgktnolLyqBzTgUUMOlpgQ"
      ); //need to hide this
      let model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      let fileId = outputFileId;

      let transcript = aTranscript;
      let prompt =
        "From the following transcript of a recipe video, generate a recipe with an ingredients section and an instructions section: " +
        transcript +
        ". Please use the following JSON schema: " +
        '{"name": "string", "ingredients": [{"ingredient": "string", "amount": "string"}], "instructions": ["string"]}. If any information is missing, substitute with "BLANK". Thank you!';
      let result = await model.generateContent(prompt);
      console.log(result.response.text());
      fs.writeFileSync(
        `./outputFiles/parseFiles/parse-${fileId}.json`,
        scrubLines(result.response.text())
      );

      let outputPath = `../outputFiles/parseFiles/parse-${fileId}.json`;
      return resolve(outputPath);
    } catch (e) {
      console.log(`geminiParser.js: ${e}`);
      return reject(e);
    }
  });
}

function scrubLines(text) {
  //necessary bc Gemini for some reason includes unnecessary characters in the first and last lines of its output
  let ans = "";
  let lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (i != 0 && i != lines.length - 2) {
      ans += lines[i] + "\n";
    }
  }
  return ans;
}
export default generateParse;
