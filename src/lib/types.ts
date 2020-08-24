export type DefaultOptions = {
  port?: number // integer, port to connect with defaults to 25
  sender?: string // email, sender address, defaults to name@example.org
  timeout?: number, // integer, socket timeout in milliseconds, defaults to 0 which is no timeout
  fqdn?: string // domain, used as part of the HELO, defaults to mail.example.org
  dns?: string[], // array of ip addresses, used to set the servers of the dns check,
  ignore?: string // ending response code integer to ignore (eg 450 for greylisted emails)
}

export type Result = {
  success: boolean
  info: string
  addr: string
  code: number // see infoCodes inside configurations.ts
  lastResponse?: string
};

export type SmtpParams = {
  host: string
  smtpOptions: DefaultOptions
  email: string
}
