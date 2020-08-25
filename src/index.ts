import isEmail from 'validator/lib/isEmail';
import logger from './utils/logger';
import { getOptions, setDNSServers } from './lib/configurations';
import { DefaultOptions, Result } from './lib/types';
import { ErrorMessages, infoCodes } from './lib/enumz';
import { dnsQuery } from './lib/netFunctions';

export const VerifyCodes = infoCodes;
export * from './lib/types';

/**
 * It verifies the validity and the existence of an email.
 * @param {string} email The email to be verified
 * @param {?DefaultOptions} options The options for this function.
 */
export const verify = async (email: string, options: DefaultOptions = {}): Promise<Result> => {
  const finalOptions = getOptions(options);
  logger.debug(`Final options: ${JSON.stringify(finalOptions)}`);

  if (!email || email.trim().length === 0) {
    throw new Error('email param is mandatory');
  }

  if (!isEmail(email)) {
    return {
      success: false,
      info: ErrorMessages.INVALID_EMAIL_STRUCTURE,
      addr: email,
      code: infoCodes.INVALID_EMAIL_STRUCTURE,
    };
  }

  if (finalOptions.dns?.length) {
    setDNSServers(finalOptions.dns!);
  }

  logger.info(`# Veryfing ${email}`);

  return dnsQuery(email, finalOptions);
};
