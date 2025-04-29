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
  test('responds with the correct article object for a valid ID', () => {
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
    })})