import {Hashcodes} from '../Hashcodes';
import {TextHighlight} from './TextHighlight';
import {Text} from './Text';
import {Arrays} from '../util/Arrays';
import {TextRect} from './TextRect';
import {IRect} from 'polar-shared/src/util/rects/IRect';
import {ISODateTimeStrings} from './ISODateTimeStrings';
import {ITextHighlight} from "./ITextHighlight";
import {HighlightColor} from "./IBaseHighlight";
import {ITextRect} from "./ITextRect";

export class TextHighlightRecords {

    /**
     * Create a TextHighlight by specifying all required rows.
     *
     * We also automatically assign the created and lastUpdated values of this
     * object as we're working with it.
     *
     * @return an object with an "id" for a unique hash and a "value" of the
     * TextHighlight to use.
     */
    public static create(rects: IRect[],
                         textSelections: ITextRect[],
                         text: Text,
                         color: HighlightColor = 'yellow'): TextHighlightRecord {

        const id = Hashcodes.createID(rects);

        const created = ISODateTimeStrings.create();
        const lastUpdated = created;

        const textHighlight = new TextHighlight({
            id,
            created,
            lastUpdated,
            rects: Arrays.toDict(rects),
            textSelections: Arrays.toDict(textSelections),
            text,
            images: {},
            notes: {},
            questions: {},
            flashcards: {},
            guid: id,
            color
        });

        return {id, value: textHighlight};

    }

}

export interface TextHighlightRecord {
    readonly id: string;
    readonly value: ITextHighlight;
}
