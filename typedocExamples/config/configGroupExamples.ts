import { ConfigGroup } from '../../src/config/configGroup';

export const configGroupExamples = {
  classDoc: async () => {
    class MyPluginConfig extends ConfigGroup<ConfigGroup.Options> {
      public static getFileName(): string {
        return 'myPluginConfigFilename.json';
      }
    }
    const myConfig = await MyPluginConfig.create(ConfigGroup.getOptions('all'));
    myConfig.setDefaultGroup('myCommand'); // Can be set in your command's init.
    myConfig.set('mykey', 'myvalue'); // Sets 'myKey' for the 'myCommand' group.
    myConfig.setInGroup('myKey', 'myvalue', 'all'); // Manually set in another group.
    await myConfig.write();
  }
};
