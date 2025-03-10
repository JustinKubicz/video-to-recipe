import fs from "fs";
import path from "path";
import MyPool from "../config/db.js";
class CleanUp {
  constructor(outDir, aVideoId) {
    this.dir = outDir;
    this.maxSpace = 250000000;
    this.pool = new MyPool();
    this.id = aVideoId;
  }
  async #seeIfUserSavedFile(aVideoId) {
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
    if (Array.isArray(ar) && inA >= 0 && inB >= 0) {
      let temp = ar[inA];
      ar[inA] = ar[inB];
      ar[inB] = temp;
    } else {
      throw new Error("swap error");
    }
  }
  #sortFilesByLastModified(anArrayOfFiles, start, end) {
    //Quick sort!
    if (start >= end) return;
    let pIndex = Math.floor(Math.random() * (end - start) + start);
    let p = anArrayOfFiles[pIndex];
    let i = start - 1;
    this.#swap(anArrayOfFiles, end, pIndex);
    for (let j = start; j < end; j++) {
      //partition array
      let fileToSwap = anArrayOfFiles[j];
      if (fileToSwap.Time < p.Time || fileToSwap.time == p.Time) {
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
    return new Promise((resolve, reject) => {
      fs.readdir(aDir, async (err, files) => {
        if (err) {
          reject(err);
        }
        for (let i = 0; i < files.length; i++) {
          let fp = path.join(aDir, files[i]);
          if (fs.existsSync(fp)) {
            let stats = fs.statSync(fp);
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
    let parseDir = `${this.dir}/parseFiles`;
    try {
      let files = await this.#readDirectory(parseDir);
      this.#sortFilesByLastModified(files, 0, files.length - 1);
      let index = 0;
      let size = await this.#getStorageSize();
      while (size > this.maxSpace) {
        let toDelete = files[index];
        let id = toDelete.Name.match(/parse-(.*).txt/);
        if (id && id[1]) id = id[1];
        if (!(await this.#seeIfUserSavedFile(this.id))) {
          let pathToDelete = `${parseDir}/${toDelete.Name}`;
          fs.unlinkSync(pathToDelete);
          files = await this.#readDirectory(parseDir);
          size = await this.#getStorageSize();
        }
        index++;
      }
    } catch (err) {
      console.error("CleanUp.js: deleteFromParseDirectory(): ", err);
    }
  }
  async #getStorageSize() {
    //checks size of parse-directory
    let path = `${this.dir}/parseFiles`;
    let parseDirectory = await this.#readDirectory(path);
    let totalSize = 0;
    for (let i = 0; i < parseDirectory.length; i++) {
      totalSize += parseDirectory[i].Size;
    }
    return totalSize;
  }
  cleanUp() {
    return new Promise(async (resolve) => {
      let transcriptPath = `${this.dir}/transcriptFiles/transcript-${this.id}.mp3.txt`;
      if (fs.existsSync(transcriptPath)) {
        fs.unlinkSync(transcriptPath);
      }
      let audioPath = `${this.dir}/videoFiles/${this.id}.mp3`;
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
      let size = await this.#getStorageSize();
      if (size > this.maxSpace) {
        this.#deleteFromParseDirectory();
      }
      return resolve;
    });
  }
}

export default CleanUp;
