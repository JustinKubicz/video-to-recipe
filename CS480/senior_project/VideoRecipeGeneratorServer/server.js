import express, { json, urlencoded } from "express";
import cors from "cors";
import videoDownloader from "./src/videoDownloader.js";
import transcriptGrabber from "./src/transcriptGrabber.js";

const app = express();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

async function readUrl(aUrl) {
  if (aUrl.includes("shorts")) {
    //if yt shorts, convert to watch url and proceed like normal yt
    let modifiedUrl = aUrl.replace("shorts/", "watch?v=");
    console.log("converted shorts url to: ", modifiedUrl);
    return await videoDownloader.downloadVideoYT(modifiedUrl);
  } else if (aUrl.includes("tiktok")) {
    //if tiktok
    //coming soon...
  } else {
    //regular youtube video
    return await videoDownloader.downloadVideoYT(aUrl);
  }
}

app.post("/api/generate", async (req, res) => {
  try {
    const { url } = req.body;
    console.log("POST RECEIVED: ", url);
    const videoPath = await readUrl(url);
    const transcriptPath = transcriptGrabber.generateTranscript(videoPath);
    res.status(200).json({ videoPath });
    console.log("VIDEO DOWNLOADED: ", videoPath);
  } catch (error) {
    console.error("Error processing video:", error);
    res.status(500).json({ error: "Error processing video" });
  }
});
