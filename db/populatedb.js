require("dotenv").config();
const { Client } = require("pg");

const SQL = `CREATE TABLE IF NOT EXISTS users (id SERIAL4 PRIMARY KEY, firstname varchar(100), lastname varchar(100), username varchar(50), hash varchar(255), salt varchar(255), membership boolean, admin boolean`;

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
