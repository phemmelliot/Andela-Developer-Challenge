import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import router from './app/routes';
import addTables from './app/db/db';

addTables();
dotenv.config();

// create express app
const app = express();
// const entries = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use('/v1', routes)(app, pool);
router(app);
// require('./app/routes')(app, array);

// listen for requests
const server = app.listen(process.env.PORT || 5000, () => {
  // console.log('Server is listening on port 5000');
});

// module.exports = [server, array];
export default { server };
