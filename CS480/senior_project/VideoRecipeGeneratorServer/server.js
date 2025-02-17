import express, { json, urlencoded } from "express";
import cors from "cors";
import VideoDownloader from "./src/videoDownloader.js";
import TranscriptGrabber from "./src/transcriptGrabber.js";

import fs from "fs";
import userAuthenticator from "./src/userAuthenticator.js";
import jwt from "jsonwebtoken";
import MyPool from "./config/db.js";
import generateParse from "./src/geminiParser.js";
const app = express();
const pool = new MyPool();
/*
EXAMPLE URL: https://www.youtube.com/shorts/Qwwm7zlpMPs
TODO:
  BEFORE ANY RECIPES ARE GENERATED CHECK IF A PARSE ALREADY EXISTS!
  THERE'S NO REASON TO CLEAN PARSE FILES UNLIKE THERE IS NEED TO CLEAN VIDEO FILES

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

async function startGeneration(aUrl) {
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
        console.error("error: readJSON", error);
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
    const videoPath = await startGeneration(url);
    let videoId = downloader.decipherYTVideoID(url);
    const transcript = await transcriptor.generateTranscript(videoPath);

    await generateParse(transcript, videoId).then(async (data) => {
      await readJSON(data).then(async (data2) => {
        let vidId = await downloader.decipherYTVideoID(url);
        //if data2 changes here, it must change in recipe.jsx
        let response = {
          data: data2,
          id: vidId,
        };
        res.status(200).json(response);
      });
    });
  } catch (error) {
    console.error("Error processing video:", error);
    res.status(500).send(error);
  }
});

app.post("/api/users", async (req, res) => {
  let ua = new userAuthenticator();
  try {
    let createUser = await ua.createUser(req.body.email, req.body.password);
    if (createUser == 200) {
      res.status(200).send("User Created");
    }
  } catch (error) {
    console.error("error: server.js: ", error);
    res.status(500).send(error);
  }
});

app.post("/api/login", async (req, res) => {
  let ua = new userAuthenticator();
  try {
    const login = await ua.loginUser(req.body.email, req.body.password);
    console.log(login);
    if (login == 400) {
      res.status(400).send("400: User not found");
    }
    if (login == 200) {
      let jwToken = jwt.sign(
        {
          id: req.body.email,
          email: req.body.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res
        .status(200)
        .json({ message: "200: Logged In Success", token: jwToken });
    }
    if (login == "password compare fail") {
      res.status(500).send("Bad Password");
    }
  } catch (error) {
    console.error("error: /login ", error);
    res.status(500).send(error);
  }
});

app.post("/api/save", async (req, res) => {
  try {
    let email = req.body.email;
    let toSave = req.body.id;
    console.log("saving " + toSave + "\nto " + email);
    await pool.myPool
      .query(`SELECT UserId FROM Users WHERE Email='${email}';`)
      .then(async (data) => {
        console.log(data.rows[0].userid);
        await pool.myPool.query(
          `INSERT INTO User_Recipes(VideoID, UserId) VALUES  ('${toSave}',${data.rows[0].userid})`
        );

        res.status(200).send(`Successfully Saved ${toSave}`);
      });
  } catch (error) {
    console.error("error: /save", error);
    res.status(500).send("error: /save", error);
  }
});
app.get("/api/buildMyRecipes", async (req, res) => {
  try {
    let email = req.query.email;
    console.log("building myRecipes for: " + email);
    await pool.myPool
      .query(`SELECT UserId FROM Users WHERE Email='${email}';`)
      .then(async (data) => {
        console.log("user pulled: " + email + "userID: " + data.rows[0].userid);
        let user = data.rows[0].userid;
        await pool.myPool
          .query(`SELECT videoid FROM user_recipes WHERE userId = '${user}';`)
          .then(async (data) => {
            let size = data.rows.length;
            let result = [];
            for (let i = 0; i < size; i++) {
              result[i] = data.rows[i].videoid;
              console.log(`USER ${email} saved recipe found: ${result[i]}`);
            }
            if (result.length != 0) {
              for (let i = 0; i < result.length; i++) {
                let temp = result[i];
                result[i] = await readJSON(
                  `./outputFiles/parseFiles/parse-${result[i]}.json`
                );
                result[i].videoId = temp;
              }
              res.status(200).json(result);
            } else {
              res
                .status(200)
                .json({ messsage: `'${email}': User has no recipes` });
            }
          });
      });
  } catch (error) {
    console.error("error: /buildMyRecipes: ", error);
    res.status(500).send("error: /buildMyRecipes: " + error);
  }
});

app.delete("/api/delete", async (req, res) => {
  try {
    //email and videoid sent in query, looks up user
    let email = req.query.email;
    let videoId = req.query.id;
    let userId;
    console.log(`deleting ${videoId} from user: ${email}`);
    await pool.myPool
      .query(`SELECT userid FROM users WHERE email=${email}`)
      .then((data) => {
        userId = data.rows[0].userid;
      });

    await pool.myPool
      .query(
        `DELETE FROM user_recipes WHERE userid=${userId} AND videoId=${videoId}`
      )
      .then((data) => {
        console.log(data);
        res.status(200).send(data); //probably don't need to send this
      });
  } catch (error) {
    console.log("api/delete error: ", error);
    res.status(500).send(error);
  }
});
