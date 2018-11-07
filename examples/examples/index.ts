import * as sfdxCore from '@salesforce/core';
import * as _ from 'lodash';

console.log('\n*** Exported Sfdx-Core Modules ***');
_.forEach(sfdxCore, (v, k) => console.log(`sfdx-core: ${k}`));
