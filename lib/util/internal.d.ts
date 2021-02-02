/**
 * The name of the project config file.
 * @ignore
 */
export declare const SFDX_PROJECT_JSON = 'sfdx-project.json';
/**
 * Performs an upward directory search for an sfdx project file. Returns the absolute path to the project.
 *
 * **See** {@link SFDX_PROJECT_JSON}
 *
 * **See** {@link traverseForFile}
 *
 * **Throws** *{@link SfdxError}{ name: 'InvalidProjectWorkspace' }* If the current folder is not located in a workspace.
 * @param dir The directory path to start traversing from.
 * @ignore
 */
export declare function resolveProjectPath(dir?: string): Promise<string>;
