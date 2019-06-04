import {Fingerprints} from './Fingerprints';

import {assert} from 'chai';

describe('Fingerprints', function() {

    it("create", async function () {

        assert.equal(Fingerprints.create("xxxxx"), "1Ufomfbkk3Js2YGDZr4c");

    });

});
