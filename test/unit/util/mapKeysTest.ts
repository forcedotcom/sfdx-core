/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import { upperFirst, lowerFirst } from '@salesforce/kit';
import mapKeys from '../../../src/util/mapKeys';

const SHALLOW_LOWECASE_OBJECT = {
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

const SHALLOW_UPPERCASE_OBJECT = {
  Name: 'Anna',
  Address: 'Ocean Drive 101',
  Phone: 123456789,
  Alias: ['Anita', 'Anny'],
  Cars: {
    primary: {
      brand: 'Honda',
      model: 'Civic',
      year: '2016',
    },
  },
};

const NESTED_LOWECASE_OBJECT = {
  name: 'Anna',
  address: 'Ocean Drive 101',
  phone: 123456789,
  pets: {
    oliver: {
      family: 'feline',
      age: 5,
      color: ['orange', 'withe'],
      vaccines: [2017, 2018, 2019, 2020, 2021],
      foods: [
        {
          brand: 'purina',
        },
        {
          brand: 'eukanuba',
        },
      ],
      alias: {
        oli: {
          usedby: 'mom',
        },
        olin: {
          usedby: 'dad',
        },
        miau: {
          usedby: 'baby',
        },
      },
    },
    star: {
      family: 'canine',
      age: 2,
      color: ['brown'],
      vaccines: [2020, 2021],
      foods: [
        {
          brand: 'purina',
        },
        {
          brand: 'eukanuba',
        },
      ],
      alias: {
        bright: {
          usedby: 'mom',
        },
        moon: {
          usedby: 'dad',
        },
        waw: {
          usedby: 'baby',
        },
      },
    },
  },
};

const NESTED_UPPERCASE_OBJECT = {
  Name: 'Anna',
  Address: 'Ocean Drive 101',
  Phone: 123456789,
  Pets: {
    Oliver: {
      Family: 'feline',
      Age: 5,
      Color: ['orange', 'withe'],
      Vaccines: [2017, 2018, 2019, 2020, 2021],
      Foods: [
        {
          Brand: 'purina',
        },
        {
          Brand: 'eukanuba',
        },
      ],
      Alias: {
        Oli: {
          Usedby: 'mom',
        },
        Olin: {
          Usedby: 'dad',
        },
        Miau: {
          Usedby: 'baby',
        },
      },
    },
    Star: {
      Family: 'canine',
      Age: 2,
      Color: ['brown'],
      Vaccines: [2020, 2021],
      Foods: [
        {
          Brand: 'purina',
        },
        {
          Brand: 'eukanuba',
        },
      ],
      Alias: {
        Bright: {
          Usedby: 'mom',
        },
        Moon: {
          Usedby: 'dad',
        },
        Waw: {
          Usedby: 'baby',
        },
      },
    },
  },
};

describe('mapKeys', () => {
  it('map shallow keys w/upperFirst', () => {
    const result = mapKeys(SHALLOW_LOWECASE_OBJECT, upperFirst);
    expect(result).to.deep.equal(SHALLOW_UPPERCASE_OBJECT);
  });
  it('map shallow keys w/lowerFirst', () => {
    const result = mapKeys(SHALLOW_UPPERCASE_OBJECT, lowerFirst);
    expect(result).to.deep.equal(SHALLOW_LOWECASE_OBJECT);
  });

  it('map nested keys w/upperFirst', () => {
    const result = mapKeys(NESTED_LOWECASE_OBJECT, upperFirst, true);
    expect(result).to.deep.equal(NESTED_UPPERCASE_OBJECT);
  });
  it('map nested keys w/lowerFirst', () => {
    const result = mapKeys(NESTED_UPPERCASE_OBJECT, lowerFirst, true);
    expect(result).to.deep.equal(NESTED_LOWECASE_OBJECT);
  });
});
