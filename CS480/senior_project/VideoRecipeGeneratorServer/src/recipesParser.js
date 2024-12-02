import fs from "fs";
import { parse } from "recipe-ingredient-parser-v3";

class RecipesParser {
  constructor() {}

  async doParse(aTranscript, aFileID) {
    return new Promise((resolve, reject) => {
      try {
        const results = parse(aTranscript, "eng");
        const filePath = `../outputFiles/parseFiles/parseJS-${aFileID}.txt`;
        const stream = fs.createWriteStream(filePath);
        results.forEach((result) => {
          stream.write(`${JSON.stringify(result)}\n`);
        });

        stream.end();
        stream.on("finish", () => resolve(filePath));
        stream.on("error", (err) => reject(err));
      } catch (error) {
        console.error("error: ", error);
        reject(error);
      }
    });
  }
}

export default RecipesParser;
