//https://ai.google.dev/gemini-api/docs/audio?lang=node
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import fs from "fs";

class TranscriptGrabber {
  #genAI;
  #model;
  #fileManager;
  constructor() {
    this.#genAI = new GoogleGenerativeAI(process.env.GOOGLE_KEY);
    this.#model = this.#genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
    });
    this.#fileManager = new GoogleAIFileManager(process.env.GOOGLE_KEY);
  }
  async #sleep(milis) {
    return new Promise((resolve) => {
      setTimeout(resolve, milis);
    });
  }
  async generateTranscript(aFilePath) {
    //INTERNALS
    let INITIAL_BACKOFF = 1;
    let MAX_BACKOFF = 8;
    let FILE_POLLING_INTERVAL = 5000;

    //1. isolate the fileId
    let pattern = /(.*\/.*\/)/g;
    let match = pattern.exec(aFilePath);
    let fileID = "";

    return new Promise(async (resolve, reject) => {
      if (match) {
        //2. If match, slice the the file id;
        let matchEndIndex = match[0].length;
        fileID = aFilePath.slice(matchEndIndex).trim();
      }

      //3. check if a transcript already exists
      if (
        !fs.existsSync(
          "./outputFiles/transcriptFiles/transcript-" + fileID + ".txt"
        )
      ) {
        console.log(
          "transcriptGrabber.js: starting transcription: ",
          aFilePath
        );

        //4. Upload the audio to Google Cloud
        if (fs.existsSync(aFilePath)) {
          try {
            let uploadResult = await this.#fileManager.uploadFile(aFilePath, {
              mimeType: "audio/mp3",
              displayName: "Audio sample",
            });
            let file = await this.#fileManager.getFile(uploadResult.file.name);
            while (file.state == FileState.PROCESSING) {
              //The docs say to wait 10 seconds before re-polling but that felt very excessive so I cut it to 5

              await this.#sleep(FILE_POLLING_INTERVAL);
              file = await this.#fileManager.getFile(uploadResult.file.name);
            }
            if (file.state == FileState.FAILED)
              throw new Error("Failed to connect to audio processing");

            //5. Prompt AI for Transcript with progressive backoff
            let geminiResponse;
            let waitFor = INITIAL_BACKOFF;
            let attempts = 0;
            while (waitFor <= MAX_BACKOFF) {
              try {
                if (attempts > 0) {
                  console.log(
                    `Gemini API 503 caused failure Re-Try #${attempts}`
                  );
                }
                geminiResponse = await this.#model.generateContent([
                  "Please generate a transcript of this audio, thank you.",
                  {
                    fileData: {
                      fileUri: uploadResult.file.uri,
                      mimeType: uploadResult.file.mimeType,
                    },
                  },
                ]);
                if (geminiResponse.response.text()) {
                  geminiResponse = geminiResponse.response.text();
                  if (geminiResponse.length > 0) break;
                } else {
                  throw new Error(
                    "Unable To Get geminiResponse Text" +
                      geminiResponse.response.status
                  );
                }
              } catch (e) {
                if (e.status == 503 && waitFor < 8) {
                  waitFor *= 2;
                  await this.#sleep(waitFor * 1000);
                  attempts++;
                } else {
                  throw new Error("Progressive Back-Off Failed " + e.message);
                }
              }
            }

            //6. Write the result to transcript file, delete file in the cloud
            fs.writeFileSync(
              "./outputFiles/transcriptFiles/transcript-" + fileID + ".txt",
              geminiResponse
            );
            await this.#fileManager.deleteFile(uploadResult.file.name);
            //7. return the transcript
            return resolve(geminiResponse);
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
            fileID +
            ".txt exists already, retrieving it."
        );
        let data = fs.readFileSync(
          "./outputFiles/transcriptFiles/transcript-" + fileID + ".txt",
          "utf-8"
        );
        return resolve(data);
      }
    });
  }
}

export default TranscriptGrabber;
