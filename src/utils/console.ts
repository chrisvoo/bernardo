import colors from 'colors';

type ConsoleInput = string | object

enum MessageType {
  ERROR,
  WARNING,
  INFO,
  SUCCESS
}

/**
 * Wrapper for console methods with colors applied.
 * @param {string} message The message
 * @param {MessageType} type if it's an error, a warning, etc
 */
function output(message: ConsoleInput, type: MessageType): void {
  let consoleFunction: string;
  let finalColor: string;

  switch (type) {
    case MessageType.ERROR:
      consoleFunction = 'error';
      finalColor = 'red';
      break;
    case MessageType.INFO:
      consoleFunction = 'info';
      finalColor = 'white';
      break;
    case MessageType.WARNING:
      consoleFunction = 'warn';
      finalColor = 'yellow';
      break;
    case MessageType.SUCCESS:
      consoleFunction = 'log';
      finalColor = 'green';
      break;
    default:
      throw new Error(`Unkown type: ${type}`);
  }

  (console as any)[consoleFunction](
    (colors as any)[finalColor](
      (typeof message === 'object')
        ? JSON.stringify(message, null, 2)
        : message,
    ),
  );
}

export function error(message: ConsoleInput): void {
  output(message, MessageType.ERROR);
}

export function warn(message: ConsoleInput): void {
  output(message, MessageType.WARNING);
}

export function info(message: ConsoleInput): void {
  output(message, MessageType.INFO);
}

export function success(message: ConsoleInput): void {
  output(message, MessageType.SUCCESS);
}
