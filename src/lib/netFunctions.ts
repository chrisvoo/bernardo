import dns from 'dns';
import net from 'net';
import { promisify } from 'util';
import logger from '../utils/logger';
import { ErrorMessages, infoCodes } from './enumz';
import { Result, SmtpParams, DefaultOptions } from './types';

const resolveMx = promisify(dns.resolveMx);

/**
 * It tries to send an email to the specified email address, parsing the server's responses.
 * @param {SmtpParams} params The parameters for tweaking the SMTP request.
 * @returns {Promise<Result>} The final result.
 */
export function smtpProbe(params: SmtpParams): Promise<Result> {
  return new Promise((resolve, reject) => {
    const {
      port, timeout, fqdn, sender, ignore,
    } = params.smtpOptions;
    const { email } = params;

    if (port === undefined || timeout === undefined) {
      throw new Error('Missing required params');
    }

    const result: Result = {
      success: false,
      info: '',
      addr: email,
      code: -1,
      lastResponse: '',
    };

    let stage: number = 0;
    let response: string = '';
    let completed: boolean = false;
    let ended: boolean = false;

    logger.info('Creating connection...');
    const socket = net.createConnection(port, params.host);

    const advanceToNextStage = () => {
      stage++;
      response = '';
    };

    if (timeout > 0) {
      socket.setTimeout(timeout, () => {
        ended = true;
        socket.destroy();

        resolve({
          success: false,
          info: ErrorMessages.NETWORK_TIMEOUT,
          addr: email,
          code: infoCodes.SMTP_CONNECTION_TIMEOUT,
        });
      });
    }

    socket.on('data', (data) => {
      response += data.toString();
      completed = response.slice(-1) === '\n';
      result.lastResponse = response;

      if (completed) {
        logger.info(`Server: ${response}`);
        switch (stage) {
          case 0:
            if (response.indexOf('220') > -1 && !ended) {
              // Connection Worked
              const cmd = `EHLO ${fqdn}\r\n`;
              logger.info(`Client: ${cmd}`);
              socket.write(cmd, advanceToNextStage);
            } else {
              socket.end();

              result.info = `${ErrorMessages.SMTP_UNAVAILABLE}: ${response}`;
              result.code = infoCodes.SMTP_UNAVAILABLE;
            }
            break;
          case 1:
            if (response.indexOf('250') > -1 && !ended) {
              // Connection Worked
              const cmd = `MAIL FROM:<${sender}>\r\n`;
              logger.info(`Client: ${cmd}`);
              socket.write(cmd, advanceToNextStage);
            } else {
              socket.end();

              result.info = `${ErrorMessages.SMTP_UNAVAILABLE}: ${response}`;
              result.code = infoCodes.SMTP_UNAVAILABLE;
            }
            break;
          case 2:
            if (response.indexOf('250') > -1 && !ended) {
              // MAIL Worked
              const cmd = `RCPT TO:<${params.email}>\r\n`;
              logger.info(`Client: ${cmd}`);
              socket.write(cmd, advanceToNextStage);
            } else {
              socket.end();

              result.info = `MAIL FROM failed: ${response}`;
              result.code = infoCodes.SMTP_UNAVAILABLE;
            }
            break;
          case 3:
            if (response.indexOf('250') > -1 || (ignore && response.indexOf(ignore) > -1)) {
              result.success = true;
              result.code = infoCodes.FINISHED_VERIFICATION;
              result.info = `${email} is a valid email`;
            } else if (/(blacklist|banned|block list)/ig.test(response)) {
              result.code = infoCodes.BANNED_BY_SERVER;
              result.info = `${ErrorMessages.BANNED_BY_SERVER}: ${response}`;
            } else {
              result.code = infoCodes.FINISHED_VERIFICATION;
              result.info = response;
            }

            // stage++;
            // response = '';
            // close the connection cleanly.
            if (!ended) {
              advanceToNextStage();
              const cmd = 'QUIT\r\n';
              logger.debug(`Client: ${cmd}`);
              socket.write(cmd);
            }
            break;
          case 4:
            socket.end();
            break;
          default:
            throw new Error(`Unknown stage: ${stage}`);
        }
      }
    });

    socket.once('connect', () => {
      logger.debug('Connected');
    });

    socket.once('error', (err) => {
      logger.error(`Socket error: ${err.message}`);
      ended = true;
      resolve({
        success: false,
        info: `${ErrorMessages.NETWORK_ERROR}: ${err.message}`,
        addr: email,
        code: infoCodes.SMTP_CONNECTION_ERROR,
      });
    });

    socket.once('end', () => {
      logger.debug('Closing connection');
      ended = true;

      resolve(result);
    });
  });
}

/**
 * It tries to resolve the email's domain and if it exists, it tries to send an email to verify
 * its existance.
 *
 * @param {string} email The email address to verify
 * @param {DefaultOptions} options The default options for making the requests to the SMTP servers.
 */
export async function dnsQuery(email: string, options: DefaultOptions): Promise<Result> {
  const domain = email.split(/[@]/).splice(-1)[0].toLowerCase();
  let addresses: Array<dns.MxRecord>;

  logger.debug(`Resolving DNS... ${domain}`);
  try {
    try {
      addresses = await resolveMx(domain);
    } catch (e) {
      let info = e.message;
      let code = infoCodes.UNKNOWN_ERROR;

      if (e.message.includes('ENOTFOUND')) {
        info = ErrorMessages.DOMAIN_NOT_FOUND;
        code = infoCodes.DOMAIN_NOT_FOUND;
      } else if (e.message.includes('ENODATA')) {
        info = ErrorMessages.NO_MX_RECORDS;
        code = infoCodes.NO_MX_RECORDS;
      }

      return {
        success: false,
        addr: email,
        info,
        code,
      };
    }

    if (addresses && addresses.length === 0) {
      return {
        success: false,
        addr: email,
        info: ErrorMessages.NO_MX_RECORDS,
        code: infoCodes.NO_MX_RECORDS,
      };
    }

    // Find the lowest priority mail server
    let priority: number = 10000;
    let lowestPriorityIndex: number = 0;

    for (let i = 0; i < addresses.length; i++) {
      if (addresses[i].priority < priority) {
        priority = addresses[i].priority;
        lowestPriorityIndex = i;
        logger.debug(`MX Records ${JSON.stringify(addresses[i])}`);
      }
    }

    const host = addresses[lowestPriorityIndex].exchange;
    logger.info(`Choosing ${host} for connection`);
    return smtpProbe({
      host,
      smtpOptions: options,
      email,
    });
  } catch (err) {
    logger.error(`DNS error: ${err.message}`);
    return {
      success: false,
      addr: email,
      info: `${ErrorMessages.NETWORK_ERROR}: ${err.message}`,
      code: infoCodes.FINISHED_VERIFICATION,
    };
  }
}
