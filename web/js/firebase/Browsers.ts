import {isPresent} from "../Preconditions";

declare var window: any;

export class Browsers {

    /**
     * Return true if we have a localStorage object.
     */
    public static hasLocalStorage() {
        return typeof window === 'object' && isPresent(window) && isPresent(window.localStorage);
    }

}
