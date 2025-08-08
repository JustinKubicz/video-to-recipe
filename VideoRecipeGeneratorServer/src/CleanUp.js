import fs from "fs";
import path from "path";
import MyPool from "../config/db.js";

/*
  The CleanUp class instance gets activated at the end of generating by calling CleanUp(), it automatically deletes the transcript and mp3 files,
  then, it scans the parse files and ensures the total size is under the MAXSPACE limit, if necessary it deletes from the parse files until directory 
  size is under the limt.
*/
class CleanUp {
  constructor(outDir, aVideoId) {
    this.DIR = outDir;
    this.MAXSPACE = 250000000;
    this.pool = new MyPool();
    this.id = aVideoId;
  }
  async #seeIfUserSavedFile(aVideoId) {
    //Queries DB to see if aVideoId appears anywhere in it, if it does, return true

    try {
      let data = await this.pool.myPool.query(
        `SELECT FROM user_recipes WHERE videoid=$1`,
        [aVideoId]
      );
      if (data.rows[0]) return true;
      else return false;
    } catch (error) {
      console.error("CleanUp.js:seeIfUserSavedFile: ", error);
    }
  }
  #swap(ar, inA, inB) {
    //QuickSort swap function
    if (Array.isArray(ar) && inA >= 0 && inB >= 0) {
      let temp = ar[inA];
      ar[inA] = ar[inB];
      ar[inB] = temp;
    } else {
      throw new Error("swap error");
    }
  }
  #sortFilesByLastModified(anArrayOfFiles, start, end) {
    //QuickSort on the array of file data, sorts based on modified date
    if (start >= end) return;
    let pIndex = Math.floor(Math.random() * (end - start) + start);
    let p = anArrayOfFiles[pIndex];
    let i = start - 1;
    this.#swap(anArrayOfFiles, end, pIndex);
    for (let j = start; j < end; j++) {
      //partition array
      let fileToSwap = anArrayOfFiles[j];
      if (
        fileToSwap.Time < p.Time ||
        (fileToSwap.time == p.Time && Math.floor(2 * Math.random()) == 0)
      ) {
        i++;
        this.#swap(anArrayOfFiles, i, j);
      }
    }
    i++;
    this.#swap(anArrayOfFiles, i, end);
    this.#sortFilesByLastModified(anArrayOfFiles, start, i);
    this.#sortFilesByLastModified(anArrayOfFiles, i + 1, end);
  }
  #readDirectory(aDir) {
    //Reads the parse directory into an array of stat structs
    return new Promise((resolve, reject) => {
      //Call readDir on the path
      fs.readdir(aDir, async (err, files) => {
        if (err) {
          reject(err);
        }
        for (let i = 0; i < files.length; i++) {
          //for each name, add the rest of the file path
          let fp = path.join(aDir, files[i]);
          //grab the stats of each file
          if (fs.existsSync(fp)) {
            let stats = fs.statSync(fp);
            //add the stats to the array in place of the name
            files[i] = {
              Name: files[i],
              Time: stats.mtimeMs,
              Size: stats.size,
            };
          }
        }
        resolve(files);
      });
    });
  }
  async #deleteFromParseDirectory() {
    //Grabs parse dir data, compares the size against the max, deletes based on oldest file if necessary to get under size limit
    let parseDir = `${this.DIR}/parseFiles`;
    try {
      let files = await this.#readDirectory(parseDir); //get array of file stats
      this.#sortFilesByLastModified(files, 0, files.length - 1); //sort em
      let index = 0;
      let size = await this.#getStorageSize(); // get total size of directory
      while (size > this.MAXSPACE) {
        //while the size is too big, cull it
        let toDelete = files[index];
        let id = toDelete.Name.match(/parse-(.*).txt/);
        if (id && id[1]) id = id[1]; //if videId was found, replace the array result of match with just the needed string
        if (!(await this.#seeIfUserSavedFile(this.id))) {
          //if the file is saved to someone's account, skip it, otherwise delete it from the fs and reread/sort the directory
          let pathToDelete = `${parseDir}/${toDelete.Name}`;
          fs.unlinkSync(pathToDelete);
          files = await this.#readDirectory(parseDir);
          size = await this.#getStorageSize();
          this.#sortFilesByLastModified(files, 0, files.length - 1);
        }
        index++;
      }
    } catch (err) {
      console.error("CleanUp.js: deleteFromParseDirectory(): ", err);
    }
  }
  async #getStorageSize() {
    //checks size of parse-directory
    let path = `${this.DIR}/parseFiles`;
    let parseDirectory = await this.#readDirectory(path);
    let totalSize = 0;
    for (let i = 0; i < parseDirectory.length; i++) {
      totalSize += parseDirectory[i].Size;
    }
    return totalSize;
  }
  cleanUp() {
    return new Promise(async (resolve) => {
      let transcriptPath = `${this.DIR}/transcriptFiles/transcript-${this.id}.mp3.txt`;
      if (fs.existsSync(transcriptPath)) {
        fs.unlinkSync(transcriptPath);
      }
      let audioPath = `${this.DIR}/videoFiles/${this.id}.mp3`;
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
      let size = await this.#getStorageSize();
      if (size > this.MAXSPACE) {
        this.#deleteFromParseDirectory();
      }
      return resolve;
    });
  }
}

export default CleanUp;
