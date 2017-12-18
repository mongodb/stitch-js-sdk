/* global expect, it, describe, global, afterEach, beforeEach, afterAll, beforeAll, require, Buffer, Promise */
import { buildClientTestHarness, extractTestFixtureDataPoints } from '../testutil';

const StitchMongoFixture = require('../fixtures/stitch_mongo_fixture');

describe('Client API executing user api crud functions', () => {
  let test = new StitchMongoFixture();
  let th;

  beforeAll(() => test.setup());
  afterAll(() => test.teardown());

  beforeEach(async() => {
    const { apiKey, groupId, serverUrl } = extractTestFixtureDataPoints(test);
    th = await buildClientTestHarness(apiKey, groupId, serverUrl);

    // enable api key auth provider
    let providers = await th.app().authProviders().list();
    await th.app().authProviders().authProvider(providers[0]._id).enable();
  });

  afterEach(async() => {
    await th.cleanup();
  });

  it('can get an empty user api key array', async() => {
    return th.stitchClient.getApiKeys()
      .then(response => {
        expect(response).toEqual([]);
      })
      .catch(e => {
        fail('Should not reach here');
      });
  });

  it('can insert an user api key', async() => {
    return th.stitchClient.createApiKey({'name': 'userKey1'})
      .then(response => {
        assertApiKey(response, 'userKey1', response._id, false)
      })
      .catch(e => {
        fail('Should not reach here');
      });
  });

  it('can delete an user api key', async() => {
    let apiID;
    return th.stitchClient.createApiKey({'name': 'userKey1'})
      .then(response => {
        apiID = response._id;
        assertApiKey(response, 'userKey1', apiID, false)
      })
      .catch(e => {
        fail('Should not reach here');
      })
      .then(() => {
        return th.stitchClient.deleteApiKeyByID(apiID).then(response => {
          expect(response.status).toEqual(204);
          return th.stitchClient.getApiKeys()
            .then(res => {
              expect(res).toEqual([]);
            })
            .catch(e => {
              fail('Should not reach here');
            });
        }).catch(e => {
          fail('Should not reach here');
        });
      });
  });

  it('can get the user api key array with element inserted', async() => {
    return th.stitchClient.createApiKey({'name': 'userKey1'})
      .then(response => {
        assertApiKey(response, 'userKey1', response._id, false)
      })
      .catch(e => {
        fail('Should not reach here');
      })
      .then(() => {
        return th.stitchClient.getApiKeys().then(response => {
          expect(response.length).toEqual(1);
        }).catch(e => {
          fail('Should not reach here');
        });
      });
  });

  it('can get the user api key by id with element inserted', async() => {
    let apiID;
    return th.stitchClient.createApiKey({'name': 'userKey1'})
      .then(response => {
        assertApiKey(response, 'userKey1', response._id, false)
        apiID = response._id;
      })
      .then(() => {
        return th.stitchClient.getApiKeyByID(apiID).then(response => {
          assertApiKey(response, 'userKey1', response._id, false)
        }).catch(e => {
          fail('Should not reach here');
        });
      });
  });

  it('can disable and endable an user api key', async() => {
    let apiID;
    return th.stitchClient.login()
      .then(() => {
        th.stitchClient.createApiKey({'name': 'userKey1'})
          .then(response => {
            assertApiKey(response, 'userKey1', response._id, false)
            apiID = response._id;
          })
          .then(() => {
            th.stitchClient.disableApiKeyByID(apiID)
              .then(res => {
                expect(res.status).toEqual(204);
                th.stitchClient.getApiKeyByID(apiID).then(res2 => {
                  assertApiKey(response, 'userKey1', response._id, true)
                  th.stitchClient.enableApiKeyByID(apiID)
                    .then(res3 => {
                      expect(res3.status).toEqual(204);
                      th.stitchClient.getApiKeyByID(apiID).then(res4 => {
                        assertApiKey(response, 'userKey1', response._id, false)
                      }).catch(e => {
                        fail('Should not reach here');
                      });
                    }).catch(e => {
                      fail('Should not reach here');
                    });
                }).catch(e => {
                  fail('Should not reach here');
                });
              });
          }).catch(e => {
            fail('Should not reach here');
          });
      });
  });

  it('tests the max number of api keys created', async() => {
    let ps = [];
    for (let i = 0; i < 20; i++) {
      ps.push(th.stitchClient.createApiKey({'name': `userKey${i}`}));
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    Promise.all(ps)
      .then(res => {
        expect(res.length).toEqual(20);
      })
      .catch(e => {
        fail('Should not reach here');
      });
  });


  it('tests the max number of api keys created', async() => {
    let ps = [];
    for (let i = 0; i < 21; i++) {
      ps.push(th.stitchClient.createApiKey({'name': `userKey${i}`}));
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    Promise.all(ps)
      .then(res => {
        fail('Should not reach here');
      })
      .catch(e => {
        expect(e).toBeInstanceOf(Error);
        expect(e.response.status).toBe(400);
        expect(e.code).toBe('MaxAPIKeysReached');
      });
  });

  // Test invalid key lookups
  it('will return a 404 when we try get an invalid key', async() => {
    return th.stitchClient.getApiKeyByID(1)
      .then(res => {
        fail('Should not reach here');
      })
      .catch(e => {
        assert404Error(e)
      });
  });

  it('will return a 404 when we try deleting an invalid key', async() => {
    return th.stitchClient.deleteApiKeyByID(1)
      .then(res => {
        fail('Should not reach here');
      })
      .catch(e => {
        assert404Error(e)
      });
  });

  it('will return a 404 when we try enabling an invalid key', async() => {
    return th.stitchClient.enableApiKeyByID(1)
      .then(res => {
        fail('Should not reach here');
      })
      .catch(e => {
        assert404Error(e)
      });
  });

  it('will return a 404 when we try disabling an invalid key', async() => {
    return th.stitchClient.disableApiKeyByID(1)
      .then(res => {
        fail('Should not reach here');
      })
      .catch(e => {
        assert404Error(e)
      });
  });
});

const assert404Error = (e) => {
  expect(e).toBeInstanceOf(Error);
  expect(e.response.status).toBe(404);
};

const assertApiKey = (key, name, id, disabled) => {
  expect(key._id).toEqual(id);
  expect(key.name).toEqual(name);
  expect(key.disabled).toEqual(disabled);
};
