const { YoutubeTranscript } = require("youtube-transcript"); //https://www.npmjs.com/package/youtube-transcript YOUTUBE TRANSCRIPT FETCHER
const { OpenAI } = require("openai");
const ffmpeg = require("fluent-ffmpeg");

const fs = require("fs");
exports.fetchTrYT = async function fetchTr(aUrl) {
  const tr = await YoutubeTranscript.fetchTranscript(aUrl).then(console.log);
  console.log(tr);
  return tr;
};

const openAI = new OpenAI({
  apiKey:
    "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",
});

async function convertToMp3(aFilePath) {
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

exports.generateTranscript = async function generateTranscript(aFilePath) {
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
    if (!fs.existsSync("transcript-" + result + ".txt")) {
      console.log(aFilePath);
      convertToMp3(aFilePath).then(async (mp3) => {
        console.log("starting transcription: ", mp3);
        if (fs.existsSync(mp3)) {
          try {
            const transcription = await openAI.audio.transcriptions.create({
              file: fs.createReadStream(mp3),
              model: "whisper-1",
              response_format: "verbose_json",
              timestamp_granularities: ["word"],
            });
            let writeStream = fs.createWriteStream(
              "transcript-" + result + ".txt"
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
      console.log("transcript-" + result + ".txt exists already retrieving: ");
      let retrieval = "";
      fs.readFile("transcript-" + result + ".txt", "utf-8", (err, data) => {
        if (data) {
          resolve(data);
        } else if (err) {
          console.error("error: ", err);
          reject(err);
        }
      });
    }
  });
};
