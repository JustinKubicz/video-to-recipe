//http://www.passportjs.org/tutorials/password/prompt/
//https://www.youtube.com/watch?v=Ud5xKCYQTjM
import MyPool from "../config/db.js";
import bcrypt from "bcrypt";

let pool = new MyPool();
class userAuthenticator {
  constructor() {}

  async createUser(email, password) {
    try {
      if (!(await this.userAlreadyExists(email))) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        await pool.myPool.query(
          `INSERT INTO Users (Email,Password) VALUES($1,$2);`,
          [email, hashedPassword]
        );

        return 200;
      } else {
        return 409; //Conflict, user already exists
      }
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
      if (!user) return 404;
      console.log(user.email);
      console.log(user.password);

      const match = await bcrypt.compare(password, user.password);

      if (match) {
        return 200;
      } else {
        return 401;
      }
    } catch (error) {
      console.error("error: userAuthenticator.js", error);
      return error;
    }
  }
  async userAlreadyExists(anEmail) {
    try {
      let response = await pool.myPool.query(
        `SELECT FROM USERS WHERE email = $1;`,
        [anEmail]
      );
      if (response.rows[0]) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("error: userAuthenticator.js", error);
      return false;
    }
  }
}

export default userAuthenticator;
