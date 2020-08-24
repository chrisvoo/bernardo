export enum infoCodes {
  FINISHED_VERIFICATION = 1,
  INVALID_EMAIL_STRUCTURE = 2,
  NO_MX_RECORDS = 3,
  SMTP_CONNECTION_TIMEOUT = 4,
  DOMAIN_NOT_FOUND = 5,
  SMTP_CONNECTION_ERROR = 6,
  BANNED_BY_SERVER = 7,
  SMTP_UNAVAILABLE = 8,
  UNKNOWN_ERROR = 9
}

export enum ErrorMessages {
  INVALID_EMAIL_STRUCTURE = 'Invalid email structure',
  BANNED_BY_SERVER = 'Your IP has been banned by the SMTP server',
  NO_MX_RECORDS = 'No MX records found',
  DOMAIN_NOT_FOUND = 'Domain not found',
  SMTP_UNAVAILABLE = 'Remote SMTP server wasn\'t available',
  NETWORK_ERROR = 'Connection error',
  NETWORK_TIMEOUT = 'Connection timeout'
}
