const config = require('../config.json')
const Encrypter = require('../src/common/Encrypter.js')

const args = process.argv.slice(2)

if (args.length === 0) {
  console.error('Please provide an email address to decrypt as an argument')
  console.log("e.g. 'npm run decrypt -- johndoe@example.com'")
  process.exit(0)
}

const encrypter = new Encrypter(config.ENCRYPTION_KEY)
args.forEach(function (encryptedEmail) {
  try {
    let plainTextEmail = encrypter.decrypt(encryptedEmail)
    console.log(`${encryptedEmail} => ${plainTextEmail}`)
  } catch (error) {
    console.error(`An error occurred: ${error.message}`)
    console.log('Please ensure you have set ENCRYPTION_KEY in config.json')
  }
})
