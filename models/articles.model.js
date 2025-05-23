const db = require('../db/connection');

exports.selectArticleById = (article_id) => {
  return db
    .query(
      `
      SELECT articles.*, COUNT(comments.comment_id)::INT AS comment_count
      FROM articles
      LEFT JOIN comments ON comments.article_id = articles.article_id
      WHERE articles.article_id = $1
      GROUP BY articles.article_id;
      `,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'Article not found' });
      }
      return rows[0];
    });
};

exports.selectArticles = () => {
    return db.query(`
      SELECT 
        articles.author,
        articles.title,
        articles.article_id,
        articles.topic,
        articles.created_at,
        articles.votes,
        articles.article_img_url,
        COUNT(comments.comment_id)::INT AS comment_count
      FROM articles
      LEFT JOIN comments ON comments.article_id = articles.article_id
      GROUP BY articles.article_id
      ORDER BY articles.created_at DESC;
    `)
    .then(({ rows }) => rows);
  };

  exports.updateArticleVotesById = (article_id, inc_votes) => {
    return db.query(
      `
      UPDATE articles
      SET votes = votes + $1
      WHERE article_id = $2
      RETURNING *;
      `,
      [inc_votes, article_id]
    ).then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: 'Article not found' });
      }
      return rows[0];
    });
  };

  exports.selectArticles = async (topic, sort_by = "created_at", order = "desc") => {
    const validSortColumns = [
      "article_id", "title", "topic", "author", "created_at",
      "votes", "article_img_url", "comment_count"
    ];
    const validOrders = ["asc", "desc"];
  
    if (!validSortColumns.includes(sort_by) || !validOrders.includes(order.toLowerCase())) {
      return Promise.reject({ status: 400, msg: "Bad Request" });
    }
  
    const queryValues = [];
    let queryStr = `
      SELECT articles.article_id,
             articles.title,
             articles.topic,
             articles.author,
             articles.created_at,
             articles.votes,
             articles.article_img_url,
             COUNT(comments.comment_id)::INT AS comment_count
      FROM articles
      LEFT JOIN comments ON comments.article_id = articles.article_id
    `;
  
    if (topic) {
      queryValues.push(topic);
      queryStr += `WHERE articles.topic = $1 `;
    }
  
    queryStr += `
      GROUP BY articles.article_id
      ORDER BY ${sort_by === "comment_count" ? "comment_count" : `articles.${sort_by}`} ${order.toUpperCase()};
    `;
  
    const { rows } = await db.query(queryStr, queryValues);
  
    if (topic && rows.length === 0) {
      const topicExists = await db.query(`SELECT * FROM topics WHERE slug = $1;`, [topic]);
      if (topicExists.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Topic not found" });
      }
    }
  
    return rows;
  };