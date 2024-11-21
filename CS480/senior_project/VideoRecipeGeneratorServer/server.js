const express = require("express");
const cors = require("cors");
const app = express();
const fs = require("fs"); //https://www.npmjs.com/package/ytdl-core
const ytdl = require("ytdl-core"); //https://www.npmjs.com/package/ytdl-core video downloading done with ytdl-core
app.use(cors()); //enables the "cross port" interaction between my server.js and app.jsx

app.get("/api", (req, res) => {
  res.json({ users: ["user1", "user2", "user3"] });
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.post("/api/transcribe", async (req, res) => {
  try {
    console.log(req.body);
    const { url } = req.body;
    console.log("POST RECEIVED: ", url);
    const videoPath = await downloadVideo(url);
    // const transcript = await transcribeAudio(videoPath);
    // const recipe = parseTranscript(transcript);
    // res.json({ transcript, recipe });
    res.json("received post client. - server");
    console.log("VIDEO DOWNLOADED: ", videoPath);
  } catch (error) {
    res.status(500).json({ error: "Error processing video" });
  }
});

async function downloadVideo(aUrl) {
  //https://www.npmjs.com/package/ytdl-core
  ytdl(aUrl).pipe(fs.createWriteStream("./video.mp4"));
}
