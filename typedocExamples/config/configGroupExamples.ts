import { ConfigGroup } from '../../src/config/configGroup';

JSON.stringify({
  classDoc: async () => {
    class MyPluginConfig extends ConfigGroup<ConfigGroup.Options> {
      public static getFileName(): string {
        return 'myPluginConfigFilename.json';
      }
    }
    const myConfig = await MyPluginConfig.retrieve<
      ConfigGroup<ConfigGroup.Options>
    >(ConfigGroup.getOptions('all'));
    myConfig.setDefaultGroup('myCommand'); // Can be set in your command's init.
    myConfig.set('mykey', 'myvalue'); // Sets 'myKey' for the 'myCommand' group.
    myConfig.setInGroup('myKey', 'myvalue', 'all'); // Manually set in another group.
    await myConfig.write();
  }
});
