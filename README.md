# SMTP Email Verification

This is a fork of [email-verify](https://github.com/EmailVerify/email-verify) and it has the following differences from the original project:

* It's entirely written in TypeScript
* It provides the response sent from the SMTP server in case of errors
* It adds the `BANNED_BY_SERVER` error code, trying to parse the error message sent by the server.

## Install

* `npm install bernardo -g` if you just want to use the CLI.
* `npm install bernardo` to use it in your app.

## Usage

### Callback

The callback is a function(err, info) that has an info object:

```json
{
  success: boolean
  info: string
  addr: the address being verified
  code: info code saying things on verification status
  banner: how server advertize itself
}
```

## Options

The options are:

* `port`: `integer`, port to connect to. (default: `25`)
* `sender`: `string`, sender's email address. (default: `name@example.org`).
* `timeout`: `integer`, socket timeout in milliseconds. (default: `0`, that is no timeout).
* `fqdn`: `string`, used as part of the HELO, defaults to `mail.example.org`.
* `dns`: `string | Array<string>`, ip address or array of ip addresses (as strings), used to set the servers of the dns check
* `ignore`: set an ending response code integer to ignore, such as 450 for greylisted emails.

## Flow

The basic flow is as follows:

1. Validate it is a proper email address
2. Get the domain of the email
3. Grab the DNS MX records for that domain
4. Create a TCP connection to the smtp server
5. Send a EHLO message
6. Send a MAIL FROM message
7. Send a RCPT TO message
8. If they all validate, return an object with success: true. If any stage fails, the callback object will have success: false.

This module has tests with Jest. Run `npm test` and make sure you have a solid connection.

Use (also see the app.js file):

```javascript
const verifier = require('email-verify');
const infoCodes = verifier.infoCodes;

verifier.verify( 'anemail@domain.com', ( err, info ) => {
  if (err) console.log(err);
  else {
    console.log( "Success (T/F): " + info.success );
    console.log( "Info: " + info.info );

    //Info object returns a code which representing a state of validation:

    //Connected to SMTP server and finished email verification
    console.log(info.code === infoCodes.finishedVerification);

    //Domain not found
    console.log(info.code === infoCodes.domainNotFound);

    //Email is not valid
    console.log(info.code === infoCodes.invalidEmailStructure);

    //No MX record in domain name
    console.log(info.code === infoCodes.noMxRecords);

    //SMTP connection timeout
    console.log(info.code === infoCodes.SMTPConnectionTimeout);

    //SMTP connection error
    console.log(info.code === infoCodes.SMTPConnectionError)
  }
});
```