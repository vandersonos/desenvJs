
require('dotenv').config()
const app = require('./App')()
const port = process.env.port;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports = app;
