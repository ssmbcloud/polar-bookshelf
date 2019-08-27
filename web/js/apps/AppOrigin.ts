import {Browsers} from "../firebase/Browsers";

export class AppOrigin {

    public static configure() {

        if (Browsers.hasDocument() && document.location && document.location.href) {

            const href = document.location.href;
            if (href.indexOf('getpolarized.io') !== -1) {
                document.domain = 'getpolarized.io';
            }

        }

    }

}
