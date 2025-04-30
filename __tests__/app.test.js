const endpointsJson = require("../endpoints.json");
/* Set up your test imports here */
const request = require('supertest');
const app = require('../app');
/* Set up your beforeEach & afterAll functions here */

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});



describe('GET /api/topics', () => {
  test('200: responds with an array of topics, each having slug and description', () => {
    
return request(app)
      .get('/api/topics')
      .expect(200)
      .then((res) => {
        const { topics } = res.body;

        
   expect(Array.isArray(topics)).toBe(true);
   expect(topics.length).toBeGreaterThan(0);
    topics.forEach((topic) => {
          expect(topic).toEqual(
          expect.objectContaining({
          slug: expect.any(String),
          description: expect.any(String),
            })
          );
        });
      });
  });
});


describe('GET /api/articles/:article_id', () => {
  test('200: responds with the correct article object for a valid ID', () => {
    return request(app)
      .get('/api/articles/1')
      .expect(200)
      .then((response) => {
        const article = response.body.article;

        expect(article).toEqual(
          expect.objectContaining({
            author: expect.any(String),
            title: expect.any(String),
            article_id: 1,
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          })
        );
      });
  });

  test('404: responds with "Article not found" for valid but non-existent article_id', () => {
    return request(app)
      .get('/api/articles/999999')
      .expect(404)
      .then((response) => {
        const errorResponse = response.body;
        expect(errorResponse.msg).toBe('Article not found');
      });
  });

  test('400: responds with "Bad Request" for invalid article_id', () => {
    return request(app)
      .get('/api/articles/katherine')
      .expect(400)
      .then((response) => {
        const errorResponse = response.body;
        expect(errorResponse.msg).toBe('Bad Request');
      });
  });
});


describe('GET /api/articles', () => {
  test('200: responds with an array of article objects with correct fields and sorted by date', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then((res) => {
        const { articles } = res.body;
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBeGreaterThan(0);

        articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            })
          );
          expect(article).not.toHaveProperty('body');
        });

        for (let i = 1; i < articles.length; i++) {
          const current = new Date(articles[i].created_at).getTime();
          const previous = new Date(articles[i - 1].created_at).getTime();
          expect(current).toBeLessThanOrEqual(previous);
        }
      });
  });
});


describe('GET /api/articles/:article_id/comments', () => {
  test('200: responds with an array of comments for the given article_id', () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(Array.isArray(comments)).toBe(true);
        comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: 1
            })
          );
        });
       
        for (let i = 1; i < comments.length; i++) {
          const current = new Date(comments[i].created_at).getTime();
          const previous = new Date(comments[i - 1].created_at).getTime();
          expect(current).toBeLessThanOrEqual(previous);
        }
      });
  });

  test('200: responds with an empty array if the article exists but has no comments', () => {
    return request(app)
      .get('/api/articles/4/comments') 
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });

  test('400: responds with "Bad Request" if article_id is not a number', () => {
    return request(app)
      .get('/api/articles/notanumber/comments')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad Request');
      });
  });

  test('404: responds with "Article not found" if article does not exist', () => {
    return request(app)
      .get('/api/articles/999999/comments')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Article not found');
      });
  });
});



describe('POST /api/articles/:article_id/comments', () => {
  test('201: responds with the posted comment', () => {
    const newComment = {
      username: 'icellusedkars',
      body: 'Nice article!'
    };

    return request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            votes: 0,
            created_at: expect.any(String),
            author: 'icellusedkars',
            body: 'Nice article!',
            article_id: 1
          })
        );
      });
  });

  test('400: responds with "Bad Request" if required fields are missing', () => {
    return request(app)
      .post('/api/articles/1/comments')
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad Request');
      });
  });

  test('400: responds with "Bad Request" if article_id is invalid', () => {
    return request(app)
      .post('/api/articles/notanid/comments')
      .send({ username: 'icellusedkars', body: 'Cool' })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad Request');
      });
  });

  test('404: responds with "Article not found" if article does not exist', () => {
    return request(app)
      .post('/api/articles/9999/comments')
      .send({ username: 'icellusedkars', body: 'Nice try' })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Article not found');
      });
  });

  test('404: responds with "User not found" if username does not exist', () => {
    return request(app)
      .post('/api/articles/1/comments')
      .send({ username: 'not_a_user', body: 'Hello?' })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('User not found');
      });
  });
});

describe('PATCH /api/articles/:article_id', () => {
  test('200: responds with updated article after vote increment', () => {
    return request(app)
      .patch('/api/articles/1')
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            article_id: 1,
            votes: 101,
          })
        );
      });
  });

  test('200: can decrement votes', () => {
    return request(app)
      .patch('/api/articles/1')
      .send({ inc_votes: -50 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toHaveProperty('votes');
        expect(typeof body.article.votes).toBe('number');
      });
  });

  test('400: responds with "Bad Request" if inc_votes is missing or not a number', () => {
    return request(app)
      .patch('/api/articles/1')
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad Request');
      });
  });

  test('400: responds with "Bad Request" for invalid article_id', () => {
    return request(app)
      .patch('/api/articles/notanid')
      .send({ inc_votes: 1 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad Request');
      });
  });

  test('404: responds with "Article not found" for valid but missing article_id', () => {
    return request(app)
      .patch('/api/articles/9999')
      .send({ inc_votes: 1 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Article not found');
      });
  });
});