import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;
dotenv.config();

class MyPool {
  constructor() {
    this.myPool = new Pool({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DATABASE,
      password: String(process.env.PG_PASSWORD),
      port: Number(process.env.PG_PORT) || 5432,
    });
  }
}

export default MyPool;
