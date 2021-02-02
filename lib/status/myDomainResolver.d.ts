import { URL } from 'url';
import { AsyncOptionalCreatable, Duration } from '@salesforce/kit';
/**
 * A class used to resolve MyDomains. After a ScratchOrg is created it's host name my not be propagated to the
 * Salesforce DNS service. This service is not exclusive to Salesforce My Domain URL and could be used for any hostname.
 *
 * ```
 * (async () => {
 *  const options: MyDomainResolver.Options = {
 *      url: new URL('http://mydomain.salesforce.com'),
 *      timeout: Duration.minutes(5),
 *      frequency: Duration.seconds(10)
 *  };
 *  const resolver: MyDomainResolver = await MyDomainResolver.create(options);
 *  const ipAddress: AnyJson = await resolver.resolve();
 *  console.log(`Successfully resolved host: ${options.url} to address: ${ipAddress}`);
 * })();
 * ```
 */
export declare class MyDomainResolver extends AsyncOptionalCreatable<MyDomainResolver.Options> {
  static DEFAULT_DOMAIN: URL;
  private logger;
  private options;
  constructor(options?: MyDomainResolver.Options);
  /**
   * Method that performs the dns lookup of the host. If the lookup fails the internal polling client will try again
   * given the optional interval. Returns the resolved ip address.
   */
  resolve(): Promise<string>;
  /**
   * Used to initialize asynchronous components.
   */
  protected init(): Promise<void>;
}
export declare namespace MyDomainResolver {
  /**
   * Options for the MyDomain DNS resolver.
   */
  interface Options {
    /**
     * The host to resolve.
     */
    url: URL;
    /**
     * The retry interval.
     */
    timeout?: Duration;
    /**
     * The retry timeout.
     */
    frequency?: Duration;
  }
}
