import { SfdxProject } from '../src/sfdxProject';

JSON.stringify({
  classDoc: async () => {
    const project = await SfdxProject.resolve();
    const projectJson = await project.resolveProjectConfig();
    console.log(projectJson.sfdcLoginUrl);
  }
});
