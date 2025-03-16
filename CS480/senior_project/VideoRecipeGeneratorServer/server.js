import express, { json, urlencoded } from "express";
import cors from "cors";
import VideoDownloader from "./src/VideoDownloader.js";
import TranscriptGrabber from "./src/TranscriptGrabber.js";
import path from "path";
import fs from "fs";
import userAuthenticator from "./src/UserAuthenticator.js";
import jwt from "jsonwebtoken";
import MyPool from "./config/db.js";
import GeminiParser from "./src/GeminiParser.js";
import TikTokDownloader from "./src/TikTokDownloader.js";
import CleanUp from "./src/cleanup.js";
const app = express();
const pool = new MyPool();
/*
DOCS:
https://github.com/brianc/node-postgres/blob/master/docs/pages/apis/client.mdx
EXAMPLE URL: https://www.youtube.com/shorts/Qwwm7zlpMPs
TODO:
  BEFORE ANY RECIPES ARE GENERATED CHECK IF A PARSE ALREADY EXISTS!
  THERE'S NO REASON TO CLEAN PARSE FILES UNLIKE THERE IS NEED TO CLEAN VIDEO FILES

*/
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
const transcriptor = new TranscriptGrabber();
const ytDownloader = new VideoDownloader();
const parser = new GeminiParser();
const ttDownloader = new TikTokDownloader();
const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

async function startGeneration(aUrl) {
  if (aUrl.includes("shorts")) {
    //if yt shorts, convert to watch url and proceed like normal yt
    let modifiedUrl = aUrl.replace("shorts/", "watch?v=");
    console.log("converted shorts url to: ", modifiedUrl);
    let path = await ytDownloader.downloadVideo(modifiedUrl);
    return path;
  } else if (aUrl.includes("tiktok")) {
    //if tiktok
    let path = await ttDownloader.downloadTikTok(aUrl);
    return path;
  } else {
    //regular youtube video
    let path = await ytDownloader.downloadVideo(aUrl);
    return path;
  }
}
async function readJSON(aFilePath) {
  return new Promise((resolve, reject) => {
    let jsonData = "";
    fs.readFile(aFilePath, (error, data) => {
      if (data) {
        jsonData = JSON.parse(data);
        return resolve(jsonData);
      } else if (error) {
        console.error("error: readJSON", error);
        return reject();
      }
    });
  });
}

app.post("/api/generate", async (req, res) => {
  try {
    const { url } = req.body;
    console.log("POST RECEIVED: ", url);
    const videoPath = await startGeneration(url);
    let videoId = videoPath.match(/.*\/(.+)\./);
    const transcript = await transcriptor.generateTranscript(videoPath);
    let data = await parser.generateParse(transcript, videoId[1]);
    let data2 = await readJSON(data);
    let response = {
      data: data2,
      id: videoId[1],
    };
    let outputDir = "./outputFiles";
    let cleaner = new CleanUp(outputDir, videoId[1]);
    res.status(200).json(response);
    cleaner.cleanUp();
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
    } else if (createUser == 409) {
      res.status(409).send("User Already exists");
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
    if (login == 404) {
      res.status(404).send(" User not found");
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

      res.status(200).json({ message: "Logged In Success", token: jwToken });
    }
    if (login == 401) {
      res.status(401).send("Bad Password");
    }
  } catch (error) {
    console.error("error: /login ", error);
    res.status(501).send(error);
  }
});

app.post("/api/save", async (req, res) => {
  try {
    let email = req.body.email;
    let toSave = req.body.id;
    console.log("saving " + toSave + " to " + email);
    let data = await pool.myPool.query(
      `SELECT UserId FROM Users WHERE Email=$1;`,
      [email]
    );
    await pool.myPool.query(
      `INSERT INTO User_Recipes(VideoID, UserId) VALUES  ($1, $2)`,
      [toSave, data.rows[0].userid]
    );
    res.status(200).send(`Successfully Saved ${toSave}`);
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
        console.log(
          "user pulled: " + email + " userID: " + data.rows[0].userid
        );
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
                  `./outputFiles/parseFiles/parse-${result[i]}.txt`
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
    //email and videoid sent in query, looks up userId in Postgre
    //then DELETE's from user_recipes where userId = userId and videoId=videoId
    let email = req.query.email;
    let videoId = req.query.id;
    let userId;
    console.log(`deleting ${videoId} from user: ${email}`);
    await pool.myPool
      .query(`SELECT userid FROM users WHERE email=$1`, [email])
      .then((data) => {
        userId = data.rows[0].userid;
      });

    await pool.myPool
      .query(`DELETE FROM user_recipes WHERE userid=$1 AND videoId=$2`, [
        userId,
        videoId,
      ])
      .then((data) => {
        res.status(200).send(data); //probably don't need to send this
      });
  } catch (error) {
    console.error("api/delete error: ", error);
    res.status(500).send(error);
  }
});
function isValidChar(aNumber) {
  //filter out special characters for getNewId
  //I'd like to switch this to a single conditional that checks aNumber against an array if there's time
  switch (aNumber) {
    case 58:
    case 59:
    case 60:
    case 61:
    case 62:
    case 63:
    case 64:
    case 91:
    case 92:
    case 93:
    case 94:
    case 95:
    case 96:
      return false;
    default:
      return true;
  }
}
function getNewId() {
  let ans = "";
  let number = Math.floor(Math.random() * 75 + 48);
  while (ans.length < 8) {
    while (!isValidChar(number)) {
      number = Math.floor(Math.random() * 75 + 48);
    } //pick a random number between 0 and 1, scale that to between 0 and 75, add 48 to make it between 48 and 122
    ans += String.fromCharCode(number);
    number = Math.floor(Math.random() * 75 + 48);
  }
  if (fs.existsSync(`./outputFiles/parseFiles/pase-${ans}.txt`)) {
    ans = getNewId();
  } else {
    return ans;
  }
}
app.post("/api/update", async (req, res) => {
  try {
    //receive updated recipe and the id and assign them to variables
    let body = req.body;
    let recipe = body.recipe;
    let recipeId = body.recipeId;
    let isAlreadySaved = body.isAlreadySaved;

    //write the recipe to a new parse file, with a new unique id
    let newId = getNewId();
    let fp = `./outputFiles/parseFiles/parse-${newId}.txt`;
    console.log("api/update: new file path: ", fp);
    fs.writeFileSync(fp, JSON.stringify(recipe));
    //find user's saved recipe (if applicable) and change the recipeId to the new id
    if (isAlreadySaved) {
      let resp = await pool.myPool.query(
        "UPDATE user_recipes SET videoid=$1 WHERE videoid=$2",
        [newId, recipeId]
      );
    }
    //responsd to client with success code and new recipeid
    res.status(201).json({
      recipeId: newId,
    });
  } catch (error) {
    console.error("api/update error: ", error);
    res.status(500).send(error);
  }
});
