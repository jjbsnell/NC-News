const db = require('../db/connection');

exports.selectCommentsByArticleId = (article_id) => {
  return db.query(`
    SELECT comment_id, votes, created_at, author, body, article_id
    FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC;
  `, [article_id])
  .then(({ rows }) => rows);
};


const { selectArticleById } = require('./articles.model'); 

exports.selectCommentsByArticleId = async (article_id) => {
  await selectArticleById(article_id);

  const result = await db.query(`
    SELECT comment_id, votes, created_at, author, body, article_id
    FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC;
  `, [article_id]);

  return result.rows;
};

exports.insertCommentByArticleId = async (article_id, username, body) => {
    const result = await db.query(
      `
      INSERT INTO comments (author, body, article_id)
      VALUES ($1, $2, $3)
      RETURNING comment_id, votes, created_at, author, body, article_id;
      `,
      [username, body, article_id]
    );
    return result.rows[0];
  };