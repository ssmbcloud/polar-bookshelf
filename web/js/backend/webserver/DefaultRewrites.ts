import {Rewrite} from "./WebserverConfig";

export class DefaultRewrites {

    public static create(): ReadonlyArray<Rewrite> {
        return [
            {
                "source": "/",
                "destination": "/apps/repository/index.html"
            },
            {
                "source": "/index.html",
                "destination": "/apps/repository/index.html"
            },
            {
                "source": "/group/:group/highlights",
                "destination": "/apps/repository/index.html"
            },
            {
                "source": "/group",
                "destination": "/apps/repository/index.html"
            },
            {
                "source": "/groups",
                "destination": "/apps/repository/index.html"
            },
            {
                "source": "/groups/create",
                "destination": "/apps/repository/index.html"
            },
            {
                "source": "/user/:user",
                "destination": "/apps/repository/index.html"
            },
            {
                "source": "/login.html",
                "destination": "/apps/repository/login.html"
            },

            {
                "source": "/pdfjsWorker-bundle.js",
                "destination": "/web/dist/pdfjsWorker-bundle.js"
            }
        ];
    }
}
