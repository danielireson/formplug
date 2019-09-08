const config = require('../config.json')
const { decrypt } = require('../src/lib/encryption.js')

const args = process.argv.slice(2)

if (args.length === 0) {
  console.error('Please provide an email address to decrypt as an argument')
  process.exit(0)
}

if (!config.ENCRYPTION_KEY) {
  console.error('Please set the ENCRYPTION_KEY config variable')
  process.exit(0)
}

args.forEach(encryptedEmail => {
  try {
    let plainTextEmail = decrypt(encryptedEmail, config.ENCRYPTION_KEY)
    console.log(`${encryptedEmail} => ${plainTextEmail}`)
  } catch (error) {
    console.error(`An error occurred: ${error.message}`)
  }
})
