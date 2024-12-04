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
        //   console.log("Original String: ", aUrl);
        //   console.log("Match: ", match[0]);
        //   console.log("VideoId: ", result);
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
      const outputFilePath = outputDir + id + ".webm";
      if (!existsSync(outputFilePath)) {
        pkg
          .download(aUrl, {
            filter: "mergevideo",
            quality: "480p",
            format: "webm",
            embedSubs: true,
            output: {
              fileName: id + ".webm",
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
              reject("failed to find video file after download");
            }
          })
          .on("error", (e) => {
            console.error(e);
            reject(e);
          });
      } else {
        console.log("data should exist already, retrieving: ");
        let newOutputFilePath = outputFilePath.replace(/\\/g, "/");
        resolve(newOutputFilePath);
      }
    });
  }
}

export default VideoDownloader;
