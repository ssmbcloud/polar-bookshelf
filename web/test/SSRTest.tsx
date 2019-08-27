import * as React from 'react';
import ReactDOMServer from 'react-dom/server';
import {Firestore} from "../js/firebase/Firestore";
import {RepositoryApp} from "../js/apps/repository/RepositoryApp";

describe('SSR', function() {

    it("basic", async function() {

        const firestore = await Firestore.getInstance();

        const renderer = (element: React.ReactElement<any>): void => {

            console.log("rendering...");
            const out = ReactDOMServer.renderToString(<div></div>);
            console.log(out);
            console.log("rendering...done");

        };

        new RepositoryApp().start(renderer);

    });

});
