/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { promises as fs } from 'fs';
import { expect } from 'chai';
import { SinonStub } from 'sinon';
import { stubMethod } from '@salesforce/ts-sinon';
import { shouldThrow, testSetup } from '../../../src/testSetup';
import { writeJSONasXML, fixExistingDollarSign } from '../../../src/util/jsonXmlTools';

const $$ = testSetup();
const XML_PATH = '/tmp/myXml.xml';
const TEST_JSON = {
  name: 'Anna',
  address: 'Ocean Drive 101',
  phone: 123456789,
  alias: ['Anita', 'Anny'],
  cars: {
    primary: {
      brand: 'Honda',
      model: 'Civic',
      year: '2016',
    },
  },
};
const TEST_XML =
  '<?xml version="1.0" encoding="UTF-8"?>\n<RecordType>\n    <name>Anna</name>\n    <address>Ocean Drive 101</address>\n    <phone>123456789</phone>\n    <alias>Anita</alias>\n    <alias>Anny</alias>\n    <cars>\n        <primary>\n            <brand>Honda</brand>\n            <model>Civic</model>\n            <year>2016</year>\n        </primary>\n    </cars>\n</RecordType>';
const DOLLARSIGN_OBJECT = {
  $: 'value',
};

describe('jsonXmlTools', () => {
  let fsWriteFileStub: SinonStub;
  beforeEach(() => {
    fsWriteFileStub = stubMethod($$.SANDBOX, fs, 'writeFile').callsFake((fsPath, xml) => {
      expect(fsPath).to.be.a('string').and.to.have.length.greaterThan(0).and.to.be.equal(XML_PATH);
      expect(xml).to.be.a('string').and.to.have.length.greaterThan(0);
      return Promise.resolve();
    });
  });

  afterEach(() => {
    $$.SANDBOX.restore();
  });

  it('writes json as xml', async () => {
    const result = await writeJSONasXML({
      path: XML_PATH,
      type: 'RecordType',
      json: TEST_JSON,
    });
    expect(fsWriteFileStub.callCount).to.be.equal(1);
    expect(fsWriteFileStub.firstCall.args[1]).to.equal(TEST_XML);
    // undefined means write operation succeeded https://nodejs.org/api/fs.html#fs_fspromises_writefile_file_data_options
    expect(result).to.be.undefined;
  });

  it('fails to write json as xml but fails', async () => {
    fsWriteFileStub.restore();
    fsWriteFileStub = stubMethod($$.SANDBOX, fs, 'writeFile').rejects();
    try {
      // create() calls read() which calls schemaValidate()
      await shouldThrow(
        writeJSONasXML({
          path: XML_PATH,
          type: 'RecordType',
          json: TEST_JSON,
        })
      );
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(e.name).to.equal('Error');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(e.message).to.equal('Error');
    }
  });
});

describe('fixExistingDollarSign', () => {
  it('fixes existing dollar sing key in object', () => {
    const result = fixExistingDollarSign(DOLLARSIGN_OBJECT);
    expect(result).to.deep.equal({
      '@': 'value',
    });
  });
});
