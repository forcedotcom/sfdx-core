import { SfProject } from '../src/sfProject';

export const sfProjectExamples = {
  classDoc: async () => {
    const project = await SfProject.resolve();
    const projectJson = await project.resolveProjectConfig();
    console.log(projectJson.sfdcLoginUrl);
  },
};
