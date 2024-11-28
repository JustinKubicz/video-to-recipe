const dwn = require("ytdlp-nodejs"); //https://github.com/iqbal-rashed/ytdlp-nodejs
const ProgressBar = require("progress");

function decipherYTVideoID(aUrl) {
  if (aUrl) {
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
exports.downloadVideoYT = async function downloadVideo(aUrl) {
  // download video
  return new Promise((resolve, reject) => {
    let id = decipherYTVideoID(aUrl);
    const bar = new ProgressBar(":bar :percent", { total: 100 });
    console.log("DOWNLOADING: ", aUrl);
    dwn
      .download(aUrl, {
        filter: "mergevideo",
        quality: "480p",
        format: "webm",
        embedSubs: true,
        output: {
          fileName: id + ".webm",
          outDir: "test",
        },
      })
      .on("progress", (data) => {
        let prog = data.downloaded / data.total;
        bar.update(prog);
      })
      .on("finished", () => {
        console.log("\nFINISHED DOWNLOADING: ./test/" + id + ".webm");
        resolve("./test/" + id + ".webm");
      })
      .on("error", (e) => {
        console.error(e);
        reject(e);
      });
  });
};
