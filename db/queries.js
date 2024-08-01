const pool = require("./pool");

async function findUser(username) {
  const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return rows;
}

async function findUserById(id) {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return rows;
}

async function getAllMessages() {
  const { rows } = await pool.query(
    "SELECT messages.id, messages.title, messages.date, messages.text, messages.author, users.firstname, users.lastname, users.username FROM messages JOIN users ON messages.author = users.id",
  );
  return rows;
}

module.exports = {
  findUser,
  findUserById,
  getAllMessages,
};
