import express, { json, urlencoded } from "express";
import cors from "cors";
import VideoDownloader from "./src/videoDownloader.js";
import TranscriptGrabber from "./src/transcriptGrabber.js";
import { execFile } from "child_process";
import fs from "fs";

const app = express();
/*
EXAMPLE URL: https://www.youtube.com/shorts/Qwwm7zlpMPs
TODO:


*/
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
const transcriptor = new TranscriptGrabber();
const downloader = new VideoDownloader();
const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
async function parseIngredientsWithPython(transcript, id) {
  return new Promise((resolve, reject) => {
    execFile(
      "python",
      ["src/geminiParser.py", transcript, id],
      (error, stdout, stderr) => {
        if (error) {
          console.error("Error calling Python script:", error);
        }
        if (stderr) {
          console.error("Standard error from Python script:", stderr);
        }
        if (stdout) {
          console.log("Python complete.");
        }
        if (fs.existsSync("./outputFiles/parseFiles/parse-" + id + ".json")) {
          resolve("./outputFiles/parseFiles/parse-" + id + ".json");
        } else {
          reject("failed to create parse file.");
        }
      }
    );
  });
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
async function readJSON(aFilePath) {
  return new Promise((resolve, reject) => {
    let jsonData = "";
    fs.readFile(aFilePath, (error, data) => {
      if (data) {
        jsonData = JSON.parse(data);
        resolve(jsonData);
      } else if (error) {
        console.error("error: ", error);
        reject(error);
      }
    });
  });
}
app.post("/api/generate", async (req, res) => {
  try {
    const event = new Event("progress");
    const { url } = req.body;
    console.log("POST RECEIVED: ", url);
    const videoPath = await start(url);

    const transcript = await transcriptor.generateTranscript(videoPath);

    await parseIngredientsWithPython(
      transcript,
      downloader.decipherYTVideoID(url)
    ).then(async (data) => {
      await readJSON(data).then((data2) => {
        //if data2 changes here, it must change in recipe.jsx
        res.status(200).json({ data2 });
      });
    });
  } catch (error) {
    console.error("Error processing video:", error);
    res.status(500).json({ error });
  }
});
