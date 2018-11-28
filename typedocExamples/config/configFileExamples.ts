import { ConfigFile } from '../../src/config/configFile';

JSON.stringify({
  classDoc: async () => {
    class MyConfig extends ConfigFile {
      public static getFileName(): string {
        return 'myConfigFilename.json';
      }
    }
    const myConfig = await MyConfig.create({});
    myConfig.set('mykey', 'myvalue');
    await myConfig.write();
  }
});
