import express, { json } from "express";
import cors from "cors";
import VideoDownloader from "./src/VideoDownloader.js";
import TranscriptGrabber from "./src/TranscriptGrabber.js";
import fs from "fs";
import userAuthenticator from "./src/UserAuthenticator.js";
import jwt from "jsonwebtoken";
import MyPool from "./config/db.js";
import GeminiParser from "./src/GeminiParser.js";
import TikTokDownloader from "./src/TikTokDownloader.js";
import CleanUp from "./src/CleanUp.js";

//INTERNALS
const app = express();
const pool = new MyPool();
const transcriptor = new TranscriptGrabber();
const ytDownloader = new VideoDownloader();
const parser = new GeminiParser();
const ttDownloader = new TikTokDownloader();
const port = 5000;

//MIDDLEWARE
app.use(cors());
app.use(json());

//START SERVER
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

//ENDPOINTS
app.post("/api/generate", async (req, res) => {
  //Takes a URL and sees if the video alreay exists in our library, then, coordinates the generation by calling on the downloader, transcriptor and parser.
  try {
    const { url } = req.body;
    let videoPath = checkIfParseFileExists(url); //Check if a parse file exists already, if it doesn't this will be an empty string
    console.log("POST RECEIVED: ", url);
    let videoId = videoPath.match(/.+\/parse-(.+)\./); //Isolate the videoId if the parse did exist
    if (videoPath == "") {
      videoPath = await startGeneration(url); //If no videoPath already exists, begin generating
      const transcript = await transcriptor.generateTranscript(videoPath);
      videoId = videoPath.match(/.*\/(.+)\./);
      videoPath = await parser.generateParse(transcript, videoId[1]);
    }
    let data = await readJSON(videoPath); //Put the parsed recipe into an object
    let response = {
      //compose a response with the recipe data and the videoId
      data: data,
      id: videoId[1],
    };
    let outputDir = "./outputFiles";
    let cleaner = new CleanUp(outputDir, videoId[1]);
    res.status(200).json(response); //send response with 200 code
    cleaner.cleanUp(); //start the cleanup
  } catch (error) {
    console.error("Error processing video:", error);
    res.status(500).send(error);
  }
});

app.post("/api/users", async (req, res) => {
  //Takes an email and a password and forwards them to the Authenticator module, which either creates or denies the new profile
  let ua = new userAuthenticator();
  try {
    let createUser = await ua.createUser(req.body.email, req.body.password); //send email and password to the userAuthenticator to create the user
    if (createUser == 200) {
      res.status(200).send("User Created"); //user made
    } else if (createUser == 409) {
      res.status(409).send("User Already exists"); //user exists already
    }
  } catch (error) {
    console.error("error: server.js: ", error);
    res.status(500).send(error);
  }
});

app.post("/api/login", async (req, res) => {
  //Takes an email and a passwword and forwards them to the Authenticator module, which verifies the password via bcrypt and denies or approves the login
  let ua = new userAuthenticator();
  try {
    const login = await ua.loginUser(req.body.email, req.body.password); //send email and password to userAuthenticator
    if (login == 404) {
      res.status(404).send(" User not found");
    }
    if (login == 200) {
      //sign in approved by the Authenticator, supply a token that expires in 1 hour
      let jwToken = jwt.sign(
        {
          id: req.body.email,
          email: req.body.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.status(200).json({ message: "Logged In Success", token: jwToken }); //send token to client
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
  //Takes an email and recipeId, saves the ID into the DB under the userID
  try {
    //Request data, email and videoId to save
    let email = req.body.email;
    let toSave = req.body.id;
    let data = await pool.myPool.query(
      //Grab primary key for the user from the DB
      `SELECT UserId FROM Users WHERE Email=$1;`,
      [email]
    );
    await pool.myPool.query(
      //Save the videoId into to the User_Recipe table with the VideoId, UserId key pair
      `INSERT INTO User_Recipes(VideoID, UserId) VALUES  ($1, $2)`,
      [toSave, data.rows[0].userid]
    );
    res.status(200).send(`Successfully Saved ${toSave}`); //Send valid code indicating successful save
  } catch (error) {
    console.error("error: /save", error);
    res.status(500).send("error: /save", error);
  }
});
app.get("/api/buildMyRecipes", async (req, res) => {
  //Takes an email, queries DB for associated recipes, generates array of recipe objects and sends that to the client
  try {
    //Request data, email
    let email = req.query.email;
    pool.myPool
      .query(`SELECT UserId FROM Users WHERE Email='${email}';`) //Query DB for userID
      .then(async (data) => {
        let user = data.rows[0].userid; //userID result
        pool.myPool
          .query(`SELECT videoid FROM user_recipes WHERE userId = '${user}';`) //Query DB for all recipeIDs needed to build out their profile
          .then(async (data) => {
            let size = data.rows.length;
            let result = [];
            for (let i = 0; i < size; i++) {
              result[i] = data.rows[i].videoid;
            }
            if (result.length != 0) {
              //if recipeIDs were found, generate an array of those recipes
              for (let i = 0; i < result.length; i++) {
                let temp = result[i];
                result[i] = await readJSON(
                  `./outputFiles/parseFiles/parse-${result[i]}.txt`
                );
                result[i].videoId = temp;
              }
              res.status(200).json(result); //send JSON response to client with recipes
            } else {
              res
                .status(200)
                .json({ messsage: `'${email}': User has no recipes` }); //respond with user has none!
            }
          });
      });
  } catch (error) {
    console.error("error: /buildMyRecipes: ", error);
    res.status(500).send("error: /buildMyRecipes: " + error);
  }
});

app.delete("/api/delete", async (req, res) => {
  //Takes an email and a recipeID, queries DB to delete the link between the email and the recipeID
  try {
    //Request data, email and videoId
    let email = req.query.email;
    let videoId = req.query.id;
    let userId;
    //Query DB for userId
    await pool.myPool
      .query(`SELECT userid FROM users WHERE email=$1`, [email])
      .then((data) => {
        userId = data.rows[0].userid;
      });

    //Delete the recipeID from the user_recipes table associated with the userId
    await pool.myPool
      .query(`DELETE FROM user_recipes WHERE userid=$1 AND videoId=$2`, [
        userId,
        videoId,
      ])
      .then((data) => {
        res.status(200).json(data); //Send confirmation
      });
  } catch (error) {
    console.error("api/delete error: ", error);
    res.status(500).send(error);
  }
});

app.post("/api/update", async (req, res) => {
  //Takes the recipeID of the old version and the new recipe, updates a new parse file with a new recipeID, if the recipe was saved to a profile already, update it in that profile
  try {
    //receive updated recipe object and the id and assign them to variables
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
      let userId = await pool.myPool
        .query(`SELECT userid FROM users WHERE email=$1`, [body.email])
        .then((data) => {
          return data.rows[0].userid;
        });
      await pool.myPool.query(
        "UPDATE user_recipes SET videoid=$1 WHERE videoid=$2 AND userid=$3",
        [newId, recipeId, userId]
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

//UTILITY FUNCTIONS
function isValidChar(aNumber) {
  //filter out special characters for getNewId, I just googled what the codes were and return false in those instances
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
  let number = Math.floor(Math.random() * 75 + 48); //begin grabbing random characters
  while (ans.length < 8) {
    while (!isValidChar(number)) {
      //check if the first one grabbed was valid
      number = Math.floor(Math.random() * 75 + 48); //if not, keep grabbing them until a valid one is grabbed
      //to pick, pick a random number between 0 and 1, scale that to between 0 and 75, add 48 to make it between 48 and 122 which covers digits, upper/lower case alphabet and some special characters
    }
    ans += String.fromCharCode(number); //append to id
    number = Math.floor(Math.random() * 75 + 48); //grab a new char
  }
  if (fs.existsSync(`./outputFiles/parseFiles/pase-${ans}.txt`)) {
    return (ans = getNewId()); //if we somehow generate an id that already exists, recurse
  } else {
    return ans;
  }
}
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
  //Reads a file from aFilePath and processes the bytes with JSON.parse()
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
function checkIfParseFileExists(aURL) {
  //Checks for the existence of a ParseFileFile, used to determine whether or not a recipe gets generated.
  let dir = fs.readdirSync("./outputFiles/parseFiles");
  for (let i = 0; i < dir.length; i++) {
    let idOfFile = dir[i].match(/parse-(.+)\./);
    if (idOfFile[1]) {
      if (aURL.includes(idOfFile[1])) {
        return `./outputFiles/parseFiles/${dir[i]}`;
      }
    }
  }
  return "";
}
