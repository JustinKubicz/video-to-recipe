//http://www.passportjs.org/tutorials/password/prompt/
//https://www.youtube.com/watch?v=Ud5xKCYQTjM
import MyPool from "../config/db.js";
import bcrypt from "bcrypt";
/*
async function storeAccessToken(email, accessToken) {
  await pool.query(
    `UPDATE appointments SET zoom_access_token = ${accessToken} WHERE student_email = ${email}`
  );
}*/
let pool = new MyPool();
class userAuthenticator {
  constructor() {}

  async createUser(email, password) {
    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log(salt);
      console.log(hashedPassword);
      pool.myPool.query(`INSERT INTO Users (Email,Password) VALUES($1,$2);`, [
        email,
        hashedPassword,
      ]);

      return 200;
    } catch (error) {
      console.error("error: userAuthenticator.js", error);
      return error;
    }
  }

  async loginUser(email, password) {
    try {
      const result = await pool.myPool.query(
        `SELECT Email, Password FROM Users WHERE Email = $1;`,
        [email]
      );
      const user = result.rows[0];
      console.log(user.email);
      console.log(user.password);
      if (!user) return 400;

      const match = await bcrypt.compare(password, user.password);

      if (match) {
        return 200; // Password matches
      } else {
        return "password compare fail"; // Password does not match
      }
    } catch (error) {
      console.error("error: userAuthenticator.js", error);
      return error;
    }
  }
}

export default userAuthenticator;
