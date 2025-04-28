const db = require("../connection");
const format = require("pg-format");
const { convertTimestampToDate, createRef } = require("./utils");

const seed = ({ topicData, userData, articleData, commentData }) => {
  return db
    .query(`DROP TABLE IF EXISTS comments, articles, users, topics;`)
    .then(() => {
      return db.query(`
        CREATE TABLE topics (
          slug VARCHAR(100) PRIMARY KEY,
          description VARCHAR(100) NOT NULL,
          img_url VARCHAR(1000) NOT NULL
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE users (
          username VARCHAR(100) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          avatar_url VARCHAR(1000) NOT NULL
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE articles (
          article_id SERIAL PRIMARY KEY,
          title VARCHAR(100) NOT NULL,
          topic VARCHAR(100) NOT NULL REFERENCES topics(slug),
          author VARCHAR(100) NOT NULL REFERENCES users(username),
          body TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          votes INT DEFAULT 0,
          article_img_url VARCHAR(1000) NOT NULL
        );
      `);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE comments (
          comment_id SERIAL PRIMARY KEY,
          article_id INT NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
          author VARCHAR(100) NOT NULL REFERENCES users(username),
          body TEXT NOT NULL,
          votes INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    })

    // Insert topics
    .then(() => {
      const insertTopicsQuery = format(
        `INSERT INTO topics (slug, description, img_url) VALUES %L RETURNING *;`,
        topicData.map(({ slug, description, img_url }) => [slug, description, img_url])
      );
      return db.query(insertTopicsQuery);
    })

    // Insert users
    .then(() => {
      const insertUsersQuery = format(
        `INSERT INTO users (username, name, avatar_url) VALUES %L RETURNING *;`,
        userData.map(({ username, name, avatar_url }) => [username, name, avatar_url])
      );
      return db.query(insertUsersQuery);
    })

    // Insert articles
    .then(() => {
      const formattedArticles = articleData.map(convertTimestampToDate);
      const insertArticlesQuery = format(
        `INSERT INTO articles (title, topic, author, body, created_at, votes, article_img_url) VALUES %L RETURNING *;`,
        formattedArticles.map(
          ({ title, topic, author, body, created_at, votes, article_img_url }) => [
            title,
            topic,
            author,
            body,
            created_at,
            votes,
            article_img_url,
          ]
        )
      );
      return db.query(insertArticlesQuery);
    })

    // Insert comments
    .then(({ rows: insertedArticles }) => {
      const articleRef = createRef(insertedArticles, "title", "article_id");

      const formattedComments = commentData.map((comment) => {
        const legitComment = convertTimestampToDate(comment);
        return [
          articleRef[comment.article_title], // this must match correctly!
          legitComment.body,
          legitComment.votes,
          legitComment.author,
          legitComment.created_at,
        ];
      });

      const insertCommentsQuery = format(
        `INSERT INTO comments (article_id, body, votes, author, created_at) VALUES %L;`,
        formattedComments
      );

      return db.query(insertCommentsQuery);
    });
};

module.exports = seed;