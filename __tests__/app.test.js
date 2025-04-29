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