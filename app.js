const express = require('express');
const app = express();
const endpoints = require('./endpoints.json');


app.use(express.json());


const { getTopics } = require('./controllers/topics.controller');
const { getArticleById } = require('./controllers/articles.controller');
const { getArticles } = require('./controllers/articles.controller');
const { patchArticleById } = require('./controllers/articles.controller');
const { getCommentsByArticleId } = require('./controllers/comments.controller');
const { postCommentByArticleId } = require('./controllers/comments.controller');
const { deleteCommentById } = require('./controllers/comments.controller');
const { getUsers } = require('./controllers/users.controller');


app.get('/api', (req, res) => {
  res.status(200).send({ endpoints });
});

app.get('/api/topics', getTopics);
app.get('/api/articles/:article_id', getArticleById);
app.get('/api/articles', getArticles);
app.patch('/api/articles/:article_id', patchArticleById);

app.get('/api/articles/:article_id/comments', getCommentsByArticleId);
app.post('/api/articles/:article_id/comments', postCommentByArticleId);

app.delete('/api/comments/:comment_id', deleteCommentById);

app.get('/api/users', getUsers);


app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else if (err.code === '22P02') {
    res.status(400).send({ msg: 'Bad Request' });
  } else if (err.code === '23503') {
    if (err.constraint === 'comments_article_id_fkey') {
      res.status(404).send({ msg: 'Article not found' });
    } else if (err.constraint === 'comments_author_fkey') {
      res.status(404).send({ msg: 'User not found' });
    } else {
      res.status(400).send({ msg: 'Bad Request' });
    }
  } else {
    console.log(err);
    res.status(500).send({ msg: 'Internal Server Error' });
  }
});

module.exports = app;