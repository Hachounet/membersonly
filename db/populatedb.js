require("dotenv").config();
const { Client } = require("pg");

const SQL = `CREATE TABLE IF NOT EXISTS users (
  id SERIAL4 PRIMARY KEY,
  firstname VARCHAR(100),
  lastname VARCHAR(100),
  username VARCHAR(50),
  hash VARCHAR(255),
  membership BOOLEAN,
  admin BOOLEAN
);


CREATE TABLE IF NOT EXISTS messages (
  id SERIAL4 PRIMARY KEY,
  title VARCHAR(100),
  date DATE,
  text VARCHAR(255),
  author INTEGER,
  FOREIGN KEY (author) REFERENCES users(id) ON DELETE CASCADE
);

`;

async function main() {
  console.log("Seeding...");
  const client = new Client({
    connectionString: `${process.env.DB_STRING}`,
  });

  try {
    await client.connect();
    await client.query(SQL);
  } catch (error) {
    console.log("Error seeding database...", error);
  } finally {
    await client.end();
    console.log("Operation finished.");
  }
}

main();
