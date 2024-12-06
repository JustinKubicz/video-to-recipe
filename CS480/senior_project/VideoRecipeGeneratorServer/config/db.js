import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;
dotenv.config();

// Log the environment variables to ensure they are loaded correctly
console.log("PG_USER:", process.env.PG_USER);
console.log("PG_PASSWORD:", process.env.PG_PASSWORD);
console.log("PG_DATABASE:", process.env.PG_DATABASE);
console.log("PG_HOST:", process.env.PG_HOST);
console.log("PG_PORT:", process.env.PG_PORT);

class MyPool {
  constructor() {
    this.myPool = new Pool({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DATABASE,
      password: String(process.env.PG_PASSWORD), // Ensure password is a string
      port: Number(process.env.PG_PORT) || 5432, // Ensure port is a number
    });
  }
}

export default MyPool;
