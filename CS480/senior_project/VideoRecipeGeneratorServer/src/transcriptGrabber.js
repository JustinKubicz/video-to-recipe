import { YoutubeTranscript } from "youtube-transcript"; //https://www.npmjs.com/package/youtube-transcript YOUTUBE TRANSCRIPT FETCHER
import { OpenAI } from "openai";
import ffmpeg from "fluent-ffmpeg"; //https://www.npmjs.com/package/fluent-ffmpeg

import { existsSync, createReadStream, createWriteStream, readFile } from "fs";

class TranscriptGrabber {
  constructor() {
    this.openAI = new OpenAI({
      apiKey:
        "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",
    });
  }

  async convertToMp3(aFilePath) {
    return new Promise((resolve, reject) => {
      let result = aFilePath + ".mp3";
      ffmpeg(aFilePath)
        .toFormat("mp3") // You can change the format as needed
        .on("end", () => {
          console.log("Conversion finished");
          resolve(result);
        })
        .on("error", (err) => {
          console.error("Error during conversion:", err);
          reject(err);
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
        console.log("Original String: ", aFilePath);
        console.log("Match: ", match[0]);
        console.log("FileName before .txt: ", result);
      }
      if (
        !existsSync(
          "../outputFiles/transcriptFiles/transcript-" + result + ".txt"
        )
      ) {
        convertToMp3(aFilePath).then(async (mp3) => {
          console.log("starting transcription: ", mp3);
          if (existsSync(mp3)) {
            try {
              const transcription =
                await this.openAI.audio.transcriptions.create({
                  file: createReadStream(mp3),
                  model: "whisper-1",
                  response_format: "verbose_json",
                  timestamp_granularities: ["word"],
                });
              let writeStream = createWriteStream(
                "../outputFiles/transcriptFiles/transcript-" + result + ".txt"
              );
              writeStream.write(transcription.text, () => {
                resolve(transcription.text);
              });
            } catch (error) {
              console.error("error: ", error);
              reject(error);
            }
          } else {
            console.log("");
            reject("Unable to locate mp3 file");
          }
        });
      } else {
        console.log(
          "../outputFiles/transcriptFiles/transcript-" +
            result +
            ".txt exists already retrieving: "
        );
        let retrieval = "";
        readFile(
          "../outputFiles/transcriptFiles/transcript-" + result + ".txt",
          "utf-8",
          (err, data) => {
            if (data) {
              resolve(data);
            } else if (err) {
              console.error("error: ", err);
              reject(err);
            }
          }
        );
      }
    });
  }
}

export default TranscriptGrabber;
