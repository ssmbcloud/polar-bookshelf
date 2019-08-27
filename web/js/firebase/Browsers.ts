import {isPresent} from "../Preconditions";

declare var window: any;
declare var document: any;

export class Browsers {

    public static hasDocument() {
        return typeof document === 'object' && isPresent(document);
    }

    /**
     * Return true if we have a localStorage object.
     */
    public static hasLocalStorage() {
        return typeof window === 'object' && isPresent(window) && isPresent(window.localStorage);
    }

}
