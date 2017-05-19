import { serviceResponse } from '../src/util';

describe('util', () => {
  describe('serviceResponse', () => {
    it('should return a thenable', () => {
      let client = { executePipeline: () => Promise.resolve(true) };
      let response = serviceResponse(client, { ok: 1 });
      expect(response).toBeInstanceOf(Object);
      expect(response.then()).toBeInstanceOf(Promise);
      return response.then(d => expect(d).toBe(true));
    });

    it('should return a thenable with arrays', () => {
      let client = { executePipeline: () => Promise.resolve(true) };
      let response = serviceResponse(client, [ { ok: 1 }, { ok: 0 } ]);
      expect(response).toBeInstanceOf(Object);
      expect(response.then()).toBeInstanceOf(Promise);
      return response.then(d => expect(d).toBe(true));
    });

    it('should allow a finalizer', () => {
      let client = { executePipeline: () => Promise.resolve(true) };
      let response = serviceResponse(client, { ok: 1 }, () => false);
      expect(response).toBeInstanceOf(Object);
      return response.then(d => expect(d).toBe(false));
    });

    it('should not modify the output when making objects thenables', () => {
      let client = { executePipeline: () => Promise.resolve(true) };
      let response = serviceResponse(client, { ok: 1 });
      expect(JSON.stringify(response)).toBe('{"ok":1}');
    })
  });
});
