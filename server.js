const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');
const connectDB = require('./config/db');

connectDB();

const port = process.env.PORT || 8000;
// eslint-disable-next-line no-console
app.listen(port, () => {
  const date = new Date();
  console.log(
    `🟢 ${date.getHours()}:${date.getMinutes()} Server started an port ${port}`
  );
});
