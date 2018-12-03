import { SfdxProject } from '../src/sfdxProject';

export const sfdxProjectExamples = {
  classDoc: async () => {
    const project = await SfdxProject.resolve();
    const projectJson = await project.resolveProjectConfig();
    console.log(projectJson.sfdcLoginUrl);
  }
};
