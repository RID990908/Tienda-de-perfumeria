import bcrypt from "bcrypt";

const password = "Lili**240415";
const hash = await bcrypt.hash(password, 10);
console.log(`Email: lilianafernandez@gmail.com`);
console.log(`Password: ${password}`);
console.log(`Hash: ${hash}`);
