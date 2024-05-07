/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { PackagePackageDir } from '@salesforce/schemas';
import { SfError } from '../../sfError';
import { Connection } from '../connection';
import { messages } from './scratchOrgInfoGenerator';

export const queryAncestorFromHighest = async ({
  packageId,
  packageDir,
  conn,
}: {
  packageId: string;
  packageDir: PackagePackageDir;
  conn: Connection;
}): Promise<string> => {
  const query =
    'SELECT Id FROM Package2Version ' +
    `WHERE Package2Id = '${packageId}' AND IsReleased = True AND IsDeprecated = False AND PatchVersion = 0 ` +
    'ORDER BY MajorVersion Desc, MinorVersion Desc, PatchVersion Desc, BuildNumber Desc LIMIT 1';
  try {
    return (await conn.singleRecordQuery<{ Id: string }>(query, { tooling: true })).Id;
  } catch (err) {
    const versionOrId = packageDir.ancestorVersion === 'HIGHEST' ? packageDir.ancestorVersion : packageDir.ancestorId;
    throw new SfError(
      messages.getMessage('NoMatchingAncestorError', [versionOrId, packageDir.package]),
      'NoMatchingAncestorError',
      [messages.getMessage('AncestorNotReleasedError', [versionOrId])]
    );
  }
};
/** given a packageDir with an ancestor, query the org to find the ID of a released ancestor */
export const queryIdFromAncestorVersion = async ({
  packageDir,
  packageId,
  conn,
}: {
  packageId: string;
  packageDir: PackagePackageDir & { ancestorVersion: string };
  conn: Connection;
}): Promise<string> => {
  if (!/^[0-9]+.[0-9]+.[0-9]+(.[0-9]+)?$/.test(packageDir.ancestorVersion)) {
    throw messages.createError('InvalidAncestorVersionFormatError', [packageDir.ancestorVersion]);
  }
  const [major, minor, patch] = packageDir.ancestorVersion.split('.');

  try {
    const releasedAncestor = await conn.singleRecordQuery<{ Id: string }>(
      `SELECT Id, IsReleased FROM Package2Version WHERE Package2Id = '${packageId}' AND MajorVersion = ${major} AND MinorVersion = ${minor} AND PatchVersion = ${patch} and IsReleased = true`,
      { tooling: true }
    );

    if (packageDir.ancestorId && packageDir.ancestorId !== releasedAncestor.Id) {
      throw messages.createError('AncestorIdVersionMismatchError', [packageDir.ancestorVersion, packageDir.ancestorId]);
    }

    return releasedAncestor.Id;
  } catch (err) {
    if (err instanceof Error && err.message === 'SingleRecordQuery_NoRecords') {
      throw new SfError(
        messages.getMessage('NoMatchingAncestorError', [packageDir.ancestorVersion, packageDir.package]),
        'NoMatchingAncestorError',
        [messages.getMessage('AncestorNotReleasedError', [packageDir.ancestorVersion])]
      );
    }
    throw err;
  }
};
export const packageHasAncestorVersion = (
  packageDir: PackagePackageDir
): packageDir is PackagePackageDir & Pick<Required<PackagePackageDir>, 'ancestorVersion'> =>
  packageDir.ancestorVersion !== undefined;
