import {Arrays} from './Arrays';

import {assert} from 'chai';
import {assertJSON} from '../test/Assertions';

describe('Arrays', function() {

    describe('toDict', function() {

        it("pass it an array", function () {
            assertJSON(Arrays.toDict(["hello"]), { '0': 'hello' })
        });

        it("already a dictionary", function () {
            const expected = {
                "hello": "world"
            };
            assertJSON({hello: "world"}, expected)
        });

        it("failure", function () {
            assert.throws(() => Arrays.toDict(101));
        });

    });

    describe('replace', function() {

        it("no replacement", function() {

            const matcher = () => false;

            assertJSON(Arrays.replace([1, 2, 3], 1, matcher ), [1, 2, 3]);

        });

        it("no values", function() {

            const matcher = () => false;

            assertJSON(Arrays.replace([], 1, matcher ), []);

        });


        it("one replaced", function() {

            const matcher = (value: number) => value === 1;

            assertJSON(Arrays.replace([1, 2, 3], 6, matcher ), [6, 2, 3]);

        });


    });


});
