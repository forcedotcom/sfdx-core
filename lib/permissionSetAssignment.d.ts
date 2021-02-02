import { Org } from './org';
/**
 * Map of fields name for a permission set assignment
 */
export interface PermissionSetAssignmentFields {
  assigneeId: string;
  permissionSetId: string;
}
/**
 * A class for assigning a Salesforce User to one or more permission sets.
 */
export declare class PermissionSetAssignment {
  /**
   * Creates a new instance of PermissionSetAssignment.
   * @param org The target org for the assignment.
   */
  static init(org: Org): Promise<PermissionSetAssignment>;
  private logger;
  private org;
  private constructor();
  /**
   * Assigns a user to one or more permission sets.
   * @param id A user id
   * @param permSetString An array of permission set names.
   */
  create(id: string, permSetString: string): Promise<PermissionSetAssignmentFields>;
  /**
   * Parses a permission set name based on if it has a namespace or not.
   * @param permSetString The permission set string.
   */
  private parsePermissionSetString;
}
