import {Hashcodes} from '../Hashcodes';
import {FilePaths} from "./FilePaths";

export class Fingerprints {

    public static fromPath(path: string) {
        return this.create(FilePaths.basename(path));
    }

    /**
     * Create a fingerprint from the given data.
     *
     * @param data
     */
    public static create(data: string) {
        return Hashcodes.create(data).substring(0, 20);
    }

}
