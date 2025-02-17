import { OpenAI } from "openai";
import ffmpeg from "fluent-ffmpeg"; //https://www.npmjs.com/package/fluent-ffmpeg
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
  async convertToMp3(aFilePath) {
    return new Promise((resolve, reject) => {
      let result = aFilePath + ".mp3";
      ffmpeg(aFilePath)
        .toFormat("mp3")
        .on("end", () => {
          console.log("Conversion finished");
          resolve(result);
        })
        .on("error", (err) => {
          console.error("Error during conversion:", err);
          return reject(err);
        })
        .save(result);
    });
  }

  async generateTranscript(aFilePath) {
    let pattern = /(.*\/.*\/)/g;
    let match = pattern.exec(aFilePath);
    let result = "";
    return new Promise((resolve, reject) => {
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
        this.convertToMp3(aFilePath).then(async (mp3) => {
          console.log("transcriptGrabber.js: starting transcription: ", mp3);
          if (fs.existsSync(mp3)) {
            try {
              let fileManager = new GoogleAIFileManager(
                "AIzaSyDdxnxeMtA9yJgktnolLyqBzTgUUMOlpgQ"
              );

              let uploadResult = await fileManager.uploadFile(mp3, {
                mimeType: "audio/mp3",
                displayName: "Audio sample",
              });
              let file = await fileManager.getFile(uploadResult.file.name);
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
              writeStream.write(geminiResponse.response.text(), () => {
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
        });
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
