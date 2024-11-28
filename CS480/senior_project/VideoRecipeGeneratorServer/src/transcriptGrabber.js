const { YoutubeTranscript } = require("youtube-transcript"); //https://www.npmjs.com/package/youtube-transcript YOUTUBE TRANSCRIPT FETCHER
const Whisper = require("nodejs-whisper"); //https://www.npmjs.com/package/nodejs-whisper TRANSCRIPT GENERATOR
//nodejs-whisper requires: https://cygwin.com/install.html specifically the make utility

exports.fetchTrYT = async function fetchTr(aUrl) {
  const tr = await YoutubeTranscript.fetchTranscript(aUrl).then(console.log);
  console.log(tr);
  return tr;
};

exports.generateTranscript = async function generateTranscript(aFilePath) {
  let pattern = /(.*\/.*\/)/g;
  let match = pattern.exec(aFilePath);
  let result = "";

  if (match) {
    let matchEndIndex = match[0].length;
    result = aFilePath.slice(matchEndIndex).trim();
    console.log("Original String: ", aFilePath);
    console.log("Match: ", match[0]);
    console.log("FileName before .txt: ", result);
  }
  await Whisper.nodewhisper(aFilePath, {
    modelName: "tiny.en",
    output: result + ".txt",
    verbose: true,
    removeWavFileAfterTranscription: false,
    withCuda: false,
    autoDownloadModelName: false,
    whisperOptions: {
      outputInText: true, //output in txt
      outputInVtt: false,
      outputInSrt: false,
      outputInCsv: false,
      translateToEnglish: false,
      timestamps_length: 20,
      wordTimestamps: false,
      splitOnWord: true,
    },
  });
};
