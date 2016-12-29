// Node
const path = require('path');

// Thirdparty
const { expect, assert } = require('chai');

// Local Module
const messages = require(path.join(__dirname, '..', '..', 'lib', 'messages'));

/**
 * Test cases for the Config API.
 */
describe('messages', () => {
    describe('#getMessage(locale)', () => {
        it('Should return a valid message.', () => {
            const testLabel = 'TestMessage';
            const message = messages.getMessage(testLabel);

            expect(message).to.equal('This is a test message do not change.');
        });

        it('Should throw an UndefinedLocalizedLabel error', () => {
            const testLabel = '12xzy';

            // The assert.throws method executes a function and in this case it will detect an exception when the label
            // is null.
            const testThrows = () => {
                messages.getMessage(testLabel);
            };

            assert.throws(testThrows, Error);
        });
    });
});
