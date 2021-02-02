import { ConfigFile } from './configFile';
import { ConfigContents } from './configStore';
/**
 * Represent a key chain config backed by a json file.
 */
export declare class KeychainConfig extends ConfigFile<ConfigFile.Options> {
  static getFileName(): string;
  /**
   * Gets default options for the KeychainConfig
   */
  static getDefaultOptions(): ConfigFile.Options;
  /**
   * Write the config file with new contents. If no new contents are passed in
   * it will write this.contents that was set from read(). Returns the written contents.
   *
   * @param newContents the new contents of the file
   */
  write(newContents?: ConfigContents): Promise<ConfigContents>;
}
