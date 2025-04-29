const express = require('express');
const app = express();
const endpoints = require('./endpoints.json');
app.use(express.json());
const { getTopics } = require('./controllers/topics.controller');
const { getArticleById } = require('./controllers/articles.controller');

app.get('/api', (req, res) => {
    res.status(200).send({ endpoints });
  });
  


  app.get('/api/topics', getTopics);

  app.get('/api/articles/:article_id', getArticleById);



  module.exports = app;