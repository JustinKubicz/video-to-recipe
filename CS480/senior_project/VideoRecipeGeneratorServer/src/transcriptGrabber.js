//https://ai.google.dev/gemini-api/docs/audio?lang=node
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import fs from "fs";
import { existsSync, createReadStream, createWriteStream, readFile } from "fs";

class TranscriptGrabber {
  constructor() {
    this.genAI = new GoogleGenerativeAI(
      "AIzaSyDdxnxeMtA9yJgktnolLyqBzTgUUMOlpgQ"
    ); //need to hide this
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateTranscript(aFilePath) {
    let pattern = /(.*\/.*\/)/g;
    let match = pattern.exec(aFilePath);
    let result = "";
    return new Promise(async (resolve, reject) => {
      if (match) {
        let matchEndIndex = match[0].length;
        result = aFilePath.slice(matchEndIndex).trim();
        console.log("transcriptGrabber.js: Original String: ", aFilePath);
        console.log("transcriptGrabber.js: Match: ", match[0]);
        console.log("transcriptGrabber.js: FileName before .txt: ", result);
      }
      if (
        !fs.existsSync(
          "./outputFiles/transcriptFiles/transcript-" + result + ".txt"
        )
      ) {
        console.log(
          "transcriptGrabber.js: starting transcription: ",
          aFilePath
        );
        if (fs.existsSync(aFilePath)) {
          try {
            let fileManager = new GoogleAIFileManager(
              "AIzaSyDdxnxeMtA9yJgktnolLyqBzTgUUMOlpgQ"
            );

            let uploadResult = await fileManager.uploadFile(aFilePath, {
              mimeType: "audio/mp3",
              displayName: "Audio sample",
            });
            let file = await fileManager.getFile(uploadResult.file.name);
            while (file.state == FileState.PROCESSING) {
              //The docs say to wait 10 seconds before re-polling but that felt very excessive
              await new Promise((resolve) => {
                setTimeout(resolve, 5000);
              });
              file = await fileManager.getFile(uploadResult.file.name);
            }
            if (file.state == FileState.FAILED)
              throw new Error("Failed to connect to audio processing");
            let writeStream = fs.createWriteStream(
              "./outputFiles/transcriptFiles/transcript-" + result + ".txt"
            );

            const geminiResponse = await this.model.generateContent([
              "Please generate a transcript of this audio, thank you.",
              {
                fileData: {
                  fileUri: uploadResult.file.uri,
                  mimeType: uploadResult.file.mimeType,
                },
              },
            ]);
            writeStream.write(geminiResponse.response.text(), async () => {
              await fileManager.deleteFile(uploadResult.file.name);
              writeStream.close();
              return resolve(geminiResponse.response.text());
            });
          } catch (error) {
            console.error("transcriptGrabber.js: error: ", error);
            return reject(error);
          }
        } else {
          console.log("");
          return reject("Unable to locate mp3 file");
        }
      } else {
        console.log(
          "transcriptGrabber.js: ./outputFiles/transcriptFiles/transcript-" +
            result +
            ".txt exists already retrieving: "
        );
        fs.readFile(
          "./outputFiles/transcriptFiles/transcript-" + result + ".txt",
          "utf-8",
          (err, data) => {
            if (data) {
              return resolve(data);
            } else if (err) {
              console.error("error: ", err);
              return reject(err);
            }
          }
        );
      }
    });
  }
}

export default TranscriptGrabber;
