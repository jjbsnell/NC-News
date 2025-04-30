const { selectCommentsByArticleId } = require('../models/comments.model');

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  selectCommentsByArticleId(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

const { insertCommentByArticleId } = require('../models/comments.model');



exports.postCommentByArticleId = (req, res, next) => {
    const { article_id } = req.params;
    const { username, body } = req.body;
  
    if (!username || !body) {
      return res.status(400).send({ msg: 'Bad Request' });
    }
  
    insertCommentByArticleId(article_id, username, body)
      .then((comment) => {
        res.status(201).send({ comment });
      })
      .catch(next);
  };