#!/usr/bin/env node

import { program } from 'commander';
import { allSettled } from 'q';
import { verify } from './index';
import { consoleTransport } from './utils/logger';
import { DefaultOptions, Result } from './lib/types';
import { getOptions } from './lib/configurations';
import { error, info, success } from './utils/console';

const version = '1.0.0';
program
  .name('bernardo')
  .version(version, '-v, --version', 'Output the current version');

const options: DefaultOptions = {};

program
  .option('-d, --debug', 'Output extra debugging')
  .option('-t, --timeout', 'Socket timeout in milliseconds for connecting to an SMTP server, defaults to 5000', '5000')
  .option(
    '-p, --port <number>',
    'SMTP port, default 25',
    (value) => {
      const parsed = parseInt(value, 10);
      if (isNaN(parsed)) {
        error('port (-p) requires a number between 1 and 65535');
        process.exit(1);
      } else if (parsed < 1 || parsed > 65535) {
        error('port (-p) requires a number between 1 and 65535');
        process.exit(1);
      }

      options.port = parsed;
    },
  )
  .option(
    '-s, --sender <sender>',
    'Sender address, defaults to name@example.org',
    (value) => { options.sender = value; },
  )
  .requiredOption(
    '-l, --list <emails>',
    'Comma-separated list of emails',
    (value) => {
      const list = value.split(',').filter((e) => e.trim().length !== 0 && e.includes('@'));
      if (list.length === 0) {
        error("I haven't recognized any email!");
        process.exit(-1);
      }

      return list;
    },
  );

program.parse(process.argv);

consoleTransport.level = program.debug ? 'debug' : 'silent';

const finalOptions: DefaultOptions = getOptions(options);

info(`Using port ${finalOptions.port} with a timeout of ${finalOptions.timeout} ms for checking emails: ${program.list}`);

const promises: Array<Promise<Result>> = [];

program.list.forEach((email: string) => {
  promises.push(verify(email, finalOptions));
});

allSettled(promises)
  .then((result) => success(result))
  .catch((e: Error) => error(e.message));
