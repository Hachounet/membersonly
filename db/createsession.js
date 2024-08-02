require("dotenv").config();
const { Client } = require("pg");

const SQL = `
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");
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
