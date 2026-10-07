import { scryptSync, randomBytes } from "node:crypto"
// Read from stdin so a password is not included in shell history or process arguments.
let password = ""
for await (const chunk of process.stdin) password += chunk
password = password.replace(/\r?\n$/, "")
if (password.length < 12 || password.length > 256)
  throw new Error("Use a password between 12 and 256 characters")
const salt = randomBytes(16).toString("hex")
process.stdout.write(salt + ":" + scryptSync(password, salt, 64).toString("hex") + "\n")
