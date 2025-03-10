import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;
dotenv.config();
//https://node-postgres.com/apis/result
class MyPool {
  constructor() {
    this.myPool = new Pool({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DATABASE,
      password: String(process.env.PG_PASSWORD),
      port: Number(process.env.PG_PORT) || 5432,
      // user: "justin2",
      // host: "localhost",
      // database: "senior_project",
      // password: "admin",
      // port: 5432,
    });
  }
}

export default MyPool;
