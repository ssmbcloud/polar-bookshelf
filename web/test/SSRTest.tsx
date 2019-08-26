import * as React from 'react';
import ReactDOMServer from 'react-dom/server';
import {Firestore} from "../js/firebase/Firestore";

describe('SSR', function() {

    it("basic", async function() {

        const firestore = await Firestore.getInstance();

        const out = ReactDOMServer.renderToString(<div></div>);
        console.log(out);

    });

});
