/* eslint-disable import/first */
import { consoleTransport } from '../src/utils/logger';
import { verify } from '../src/index';
import { infoCodes, ErrorMessages } from '../src/lib/enumz';

describe('bernardo', () => {
  it('existing email: should respond with an object where success is true', (done) => {
    consoleTransport.level = 'error';

    verify('support@github.com').then((info) => {
      expect(info.success).toBeTruthy();
      expect(info.code).toBe(infoCodes.FINISHED_VERIFICATION);
      expect(info.lastResponse?.length !== undefined && info.lastResponse.length > 0).toBeTruthy();
      done();
    });
  });

  it('non-existing domain: should respond with an object where success is false', (done) => {
    consoleTransport.level = 'error';

    verify('admin@klklklklkklklklkl.com').then((info) => {
      expect(info.success).toBeFalsy();
      expect(info.code).toBe(infoCodes.DOMAIN_NOT_FOUND);
      expect(info.info).toBe(ErrorMessages.DOMAIN_NOT_FOUND);
      done();
    });
  });

  it('existing domain without MX record: should respond with an object where success is false', (done) => {
    consoleTransport.level = 'error';

    verify('admin@test.com').then((info) => {
      expect(info.success).toBeFalsy();
      expect(info.code).toBe(infoCodes.NO_MX_RECORDS);
      expect(info.info).toBe(ErrorMessages.NO_MX_RECORDS);
      done();
    });
  });

  it('non-existing email: should respond with an object where success is false', (done) => {
    consoleTransport.level = 'error';

    verify('admin@github.com').then((info) => {
      expect(info.success).toBeFalsy();
      expect(info.code).toBe(infoCodes.FINISHED_VERIFICATION);
      done();
    });
  });

  it('badly formed email: should respond with an object where success is false', (done) => {
    consoleTransport.level = 'error';

    verify('badlyformed##email@email@.com').then((info) => {
      expect(info.success).toBeFalsy();
      expect(info.code).toBe(infoCodes.INVALID_EMAIL_STRUCTURE);
      done();
    });
  });

  it('short timeout: should respond with an object where success is false', (done) => {
    consoleTransport.level = 'error';

    verify('support@github.com', { timeout: 1, port: 25 }).then((info) => {
      expect(info.success).toBeFalsy();
      expect(info.code).toBe(infoCodes.SMTP_CONNECTION_TIMEOUT);
      done();
    });
  });

  it('long timeout: should respond with an object where success is true', (done) => {
    consoleTransport.level = 'error';

    verify('support@github.com', { timeout: 5000, port: 25 }).then((info) => {
      expect(info.success).toBeTruthy();
      expect(info.code).toBe(infoCodes.FINISHED_VERIFICATION);
      done();
    });
  });

  it('bad smtp port: should respond with an object where success is false', (done) => {
    verify('admin@github.com', { timeout: 5000, port: 6464 }).then((info) => {
      expect(info.success).toBeFalsy();
      expect(info.code).toBe(infoCodes.SMTP_CONNECTION_TIMEOUT);
      done();
    });
  }, 10000);
});
