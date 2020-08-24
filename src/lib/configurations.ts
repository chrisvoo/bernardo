import dns from 'dns';
import { DefaultOptions } from './types';

/**
 * Sets the options for the verify function.
 * @param {DefaultOptions | undefined } options The options for the verify function
 * @returns {DefaultOptions} The selected options merged with the default ones.
 */
export function getOptions(options: DefaultOptions = {}): DefaultOptions {
  const defaultOptions: DefaultOptions = {
    port: 25,
    sender: 'name@example.org',
    timeout: 5000,
    fqdn: 'mail.example.org',
    ignore: undefined,
  };

  return { ...defaultOptions, ...options };
}

/**
 * Sets the IP address and port of servers to be used when performing DNS resolution.
 * @param {string | Array<string>} dnsServers One or more DNS IP addresses
 * @returns {void}
 */
export function setDNSServers(dnsServers: string | Array<string>): void {
  try {
    if (Array.isArray(dnsServers)) dns.setServers(dnsServers);
    else dns.setServers([dnsServers]);
  } catch (e) {
    throw new Error(`Invalid DNS Options: ${e.message}`);
  }
}
