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

const { getArticles } = require('./controllers/articles.controller');

app.get('/api/articles', getArticles);

const { getCommentsByArticleId } = require('./controllers/comments.controller');

app.get('/api/articles/:article_id/comments', getCommentsByArticleId);




app.get('/api/articles/:article_id/comments', getCommentsByArticleId);


app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else if (err.code === '22P02') {
    res.status(400).send({ msg: 'Bad Request' });
  } else {
    console.log(err);
    res.status(500).send({ msg: 'Internal Server Error' });
  }
});


module.exports = app;