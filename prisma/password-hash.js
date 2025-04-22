const bcrypt = require("bcryptjs");

const password = "12345678";
async function hash() {
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword);
}

hash();
