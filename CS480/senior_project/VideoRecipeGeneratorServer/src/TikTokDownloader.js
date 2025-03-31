import { exec } from "node:child_process";
import fs from "fs";
import path from "path";

class TikTokDownloader {
  //TikTokDownloader utilizes yt-dlp's CLI tool and the nodejs exec function to execute the download.
  //I vastly prefer this approach to how I used yt-dlp in the youtube downloader. However I did write that code months prior to this code
  //and was unaware I could do it this way, the youtube downloader (VideoDownloader) utilizes a yt-dlp Node wrapper package instead of just the CLI directly which is only marginally more complicated I feel like.
  //especially now that I understand promises better after this project

  constructor() {}
  #__dirname = import.meta.dirname; //https://nodejs.org/api/esm.html#importmetadirname
  #path = path.resolve(this.#__dirname, `../outputFiles/videoFiles/`);
  #ytdlpOptions = `-o "${
    this.#path
  }/%(id)s.%(ext)s" --extract-audio --audio-format "mp3"`; //-o "test video.%(ext)s" [URL] -x <- from the yt-dlp docs
  async downloadTikTok(aUrl) {
    return new Promise((resolve, reject) => {
      if (
        fs.existsSync(
          `./outputFiles/videoFiles/${this.extractVideoIdFromTikTokUrl(
            aUrl
          )}.mp3`
        )
      ) {
        resolve(
          `./outputFiles/videoFiles/${this.extractVideoIdFromTikTokUrl(
            aUrl
          )}.mp3`
        );
      } else {
        exec(
          `yt-dlp ${this.#ytdlpOptions}  "${aUrl}"`,
          (err, stdout, stderr) => {
            //https://nodejs.org/api/child_process.html#child-process
            if (err) reject(err);
            if (stdout) {
              let filename = stdout.match(
                /\[ExtractAudio\]\sDestination:\s(.*)\n/
              );
              if (filename == null)
                reject(new Error("TikTokDownloader: unable to match filePath"));
              if (fs.existsSync(filename[1])) {
                filename[1] = filename[1].replace(/\\/g, "/");
                resolve(filename[1]);
              } else {
                reject(
                  new Error(
                    "TikTokDownloader: unable to verify download location"
                  )
                );
              }
            }
          }
        );
      }
    });
  }

  extractVideoIdFromTikTokUrl(aUrl) {
    let data = aUrl.match(/.+\/video\/(\d+)\?/);
    if (data[1]) return data[1];
    else throw new Error("Failed to Match TikTok ID");
  }
}

export default TikTokDownloader;
