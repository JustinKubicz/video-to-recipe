import express, { json, urlencoded } from "express";
import cors from "cors";
import VideoDownloader from "./src/videoDownloader.js";
import TranscriptGrabber from "./src/transcriptGrabber.js";
import { execFile } from "child_process";
import RecipesParser from "./src/recipesParser.js";

const app = express();
/*
TODO:
  . If files exist, don't remake them, especially the transcript.
*/
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
const transcriptor = new TranscriptGrabber();
const parser = new RecipesParser();
const downloader = new VideoDownloader();
const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
async function parseIngredientsWithPython(transcript, id) {
  execFile(
    "python",
    ["src/ingredientParserNlp.py", transcript, id],
    (error, stdout, stderr) => {
      if (error) {
        console.error("Error calling Python script:", error);
      }
      if (stderr) {
        console.error("Standard error from Python script:", stderr);
      }
    }
  );
}
async function start(aUrl) {
  if (aUrl.includes("shorts")) {
    //if yt shorts, convert to watch url and proceed like normal yt
    let modifiedUrl = aUrl.replace("shorts/", "watch?v=");
    console.log("converted shorts url to: ", modifiedUrl);
    return await downloader.downloadVideo(modifiedUrl);
  } else if (aUrl.includes("tiktok")) {
    //if tiktok
    //coming soon...
  } else {
    //regular youtube video
    return await downloader.downloadVideo(aUrl);
  }
}

app.post("/api/generate", async (req, res) => {
  try {
    const { url } = req.body;
    console.log("POST RECEIVED: ", url);
    const videoPath = await start(url);
    const transcript = await transcriptor.generateTranscript(videoPath);
    // await parseIngredientsWithPython(
    //   transcript,
    //   videoDownloader.decipherYTVideoID(url)
    // );
    const parse = await parser.doParse(
      transcript,
      downloader.decipherYTVideoID(url)
    );

    res.status(200).json({ videoPath });
    console.log("VIDEO DOWNLOADED: ", videoPath);
  } catch (error) {
    console.error("Error processing video:", error);
    res.status(500).json({ error: "Error processing video" });
  }
});

// function decipherYTVideoID(aUrl) {
//   if (aUrl.includes("shorts")) {
//     //if yt shorts, convert to watch url and proceed like normal yt
//     let modifiedUrl = aUrl.replace("shorts/", "watch?v=");
//     aUrl = modifiedUrl;
//   }
//   let pattern = /.*(\w{5}\?\w\=)/g; //thanks Sarkela!
//   let match = pattern.exec(aUrl);
//   if (match) {
//     let matchEndIndex = match[0].length;
//     let result = aUrl.slice(matchEndIndex).trim();
//     //   console.log("Original String: ", aUrl);
//     //   console.log("Match: ", match[0]);
//     //   console.log("VideoId: ", result);
//     return result;
//   }
// }
