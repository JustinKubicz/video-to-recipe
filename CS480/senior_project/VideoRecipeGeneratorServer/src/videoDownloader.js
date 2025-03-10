import pkg from "ytdlp-nodejs"; //https://github.com/iqbal-rashed/ytdlp-nodejs
import ProgressBar from "progress";
import { existsSync } from "fs";

class VideoDownloader {
  constructor() {}

  decipherYTVideoID(aUrl) {
    if (aUrl) {
      if (aUrl.includes("shorts")) {
        //if yt shorts, convert to watch url and proceed like normal yt
        let modifiedUrl = aUrl.replace("shorts/", "watch?v=");
        aUrl = modifiedUrl;
      }
      let pattern = /.*(\w{5}\?\w\=)/g; //thanks Sarkela!
      let match = pattern.exec(aUrl);
      if (match) {
        let matchEndIndex = match[0].length;
        let result = aUrl.slice(matchEndIndex).trim();
        return result;
      }
    }
  }

  async downloadVideo(aUrl) {
    return new Promise((resolve, reject) => {
      let id = this.decipherYTVideoID(aUrl);
      const bar = new ProgressBar(":bar :percent", { total: 100 });
      console.log("DOWNLOADING: ", aUrl);

      const outputDir = "./outputFiles/videoFiles/";
      const outputFilePath = outputDir + id + ".mp3";
      if (existsSync(outputFilePath)) {
        console.log(
          "videoDownloader.js: File Exists Already, resolving with that"
        );
        return resolve(outputFilePath);
      }
      pkg
        .download(aUrl, {
          filter: "audioonly",
          format: "mp3",
          output: {
            fileName: id + ".mp3",
            outDir: outputDir,
          },
        })
        .on("progress", (data) => {
          let prog = data.downloaded / data.total;
          bar.update(prog);
        })
        .on("finished", () => {
          console.log("\nFINISHED DOWNLOADING: " + outputFilePath);
          if (existsSync(outputFilePath)) {
            let newOutputFilePath = outputFilePath.replace(/\\/g, "/");
            console.log(newOutputFilePath);
            resolve(newOutputFilePath);
          } else {
            reject("failed to find audio file after download");
          }
        })
        .on("error", (e) => {
          console.error("videoDownloader.js" + e);
          reject(e);
        });
    });
  }
}

export default VideoDownloader;
