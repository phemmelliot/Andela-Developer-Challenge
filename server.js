import express from 'express';
import bodyParser from 'body-parser';
import router from './app/routes';

// const express = require('express');
// const bodyParser = require('body-parser');

// create express app
const app = express();
const array = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
router(app, array);
// require('./app/routes')(app, array);

// define a simple route
// app.get('/', (req, res) => {
//   res.json({ message: 'Welcome to my diary' });
// });

// listen for requests
const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Server is listening on port 5000');
});

// module.exports = [server, array];
export { server, array };
