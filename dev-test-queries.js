const db = require('./db/connection');

const runQueries = async () => {
  try {
    const users = await db.query(`SELECT * FROM users;`);
    console.log("Users:", users.rows);

    const codingArticles = await db.query(`SELECT * FROM articles WHERE topic = 'coding';`);
    console.log("Articles about coding:", codingArticles.rows);

    const negativeVotesComments = await db.query(`SELECT * FROM comments WHERE votes < 0;`);
    console.log("Comments with negative votes:", negativeVotesComments.rows);

    const topics = await db.query(`SELECT * FROM topics;`);
    console.log("Topics:", topics.rows);

    const grumpyArticles = await db.query(`SELECT * FROM articles WHERE author = 'grumpy19';`);
    console.log("Articles by grumpy19:", grumpyArticles.rows);

    const spicyComments = await db.query(`SELECT * FROM comments WHERE votes > 10;`);
    console.log("Comments with more than 10 votes:", spicyComments.rows);
  } catch (err) {
    console.error(err);
  } finally {
    db.end();
  }
};

runQueries();