import {Hashcodes} from '../Hashcodes';
import {notNull} from '../Preconditions';

export class Fingerprints {

    /**
     * Parse the fingerprint from the filename.
     */
    public static fromFilename(filename: string) {
        const match = filename.match(/-([^-]+)\.[^.]+$/);
        return notNull(match)[1];
    }

    /**
     * Remove the extension from a file, add the fingerprint, then add the
     * extension again.
     */
    public static toFilename(path: string, fingerprint: string) {
        const index = path.lastIndexOf(".");

        const prefix = path.substring(0, index);
        const suffix = path.substring(index + 1, path.length);

        return `${prefix}-${fingerprint}.${suffix}`;
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
