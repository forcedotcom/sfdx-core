import { ConfigFile } from '../../src/config/configFile';

export const configFileExamples = {
  classDoc: async () => {
    class MyConfig extends ConfigFile<ConfigFile.Options> {
      public static getFileName(): string {
        return 'myConfigFilename.json';
      }
    }
    const myConfig = await MyConfig.create({
      isGlobal: true
    });
    myConfig.set('mykey', 'myvalue');
    await myConfig.write();
  }
};
