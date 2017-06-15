import { serviceResponse } from '../src/util';

let test = {};
describe('util', () => {
  describe('serviceResponse', () => {
    beforeEach(() => {
      test.service = { client: { executePipeline: () => Promise.resolve(true) } };
    });

    it('should return a thenable', () => {
      let response = serviceResponse(test.service, { ok: 1 });
      expect(response).toBeInstanceOf(Object);
      expect(response.then()).toBeInstanceOf(Promise);
      return response.then(d => expect(d).toBe(true));
    });

    it('should return a thenable with arrays', () => {
      let response = serviceResponse(test.service, [ { ok: 1 }, { ok: 0 } ]);
      expect(response).toBeInstanceOf(Object);
      expect(response.then()).toBeInstanceOf(Promise);
      return response.then(d => expect(d).toBe(true));
    });

    it('should allow a finalizer', () => {
      let response = serviceResponse(test.service, { ok: 1 }, () => false);
      expect(response).toBeInstanceOf(Object);
      return response.then(d => expect(d).toBe(false));
    });

    it('should not modify the output when making objects thenables', () => {
      let response = serviceResponse(test.service, { ok: 1 });
      expect(JSON.stringify(response)).toBe('{"ok":1}');
    });

    it('should allow a `let` substage definition, after the stage', () => {
      let response = serviceResponse(test.service, { ok: 1 });
      response.withLet({ something: 'test' });
      expect(response).toHaveProperty('let');
      expect(response.let).toEqual({ something: 'test' });
    });

    it('should allow a `post` substage definition, after the stage', () => {
      let response = serviceResponse(test.service, { ok: 1 });
      response.withPost({ something: 'test' });
      expect(response).toHaveProperty('post');
      expect(response.post).toEqual({ something: 'test' });
    });
  });
});
