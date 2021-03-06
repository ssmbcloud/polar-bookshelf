import {TextHighlightRecords} from './TextHighlightRecords';
import {IRect} from 'polar-shared/src/util/rects/IRect';
import {TextRect} from './TextRect';
import {TextHighlight} from './TextHighlight';
import {Image} from './Image';
import {isPresent, notNull} from '../Preconditions';
import {PageMeta} from './PageMeta';
import {DocMetas} from './DocMetas';
import {Logger} from '../logger/Logger';
import {DocMeta} from './DocMeta';
import {IPageMeta} from "./IPageMeta";
import {IDocMeta} from "./IDocMeta";
import {ITextHighlight} from "./ITextHighlight";
import {HTMLStr} from "../util/Strings";
import {Text} from "./Text";

const log =  Logger.create();

export class TextHighlights {

    public static update(id: string,
                         docMeta: IDocMeta,
                         pageMeta: IPageMeta,
                         updates: Partial<ITextHighlight>) {

        const existing = pageMeta.textHighlights[id]!;

        if (!existing) {
            throw new Error("No existing for id: " + id);
        }

        const updated = new TextHighlight({...existing, ...updates});

        DocMetas.withBatchedMutations(docMeta, () => {
            // delete pageMeta.textHighlights[id];
            pageMeta.textHighlights[id] = updated;
        });

    }

    /**
     * Create a mock text highlight for testing.
     * @return {*}
     */
    public static createMockTextHighlight() {

        const rects: IRect[] = [ {top: 100, left: 100, right: 200, bottom: 200, width: 100, height: 100}];
        const textSelections = [new TextRect({text: "hello world"})];
        const text = "hello world";

        // create a basic TextHighlight object..
        return TextHighlightRecords.create(rects, textSelections, {TEXT: text}).value;

    }

    public static attachImage(textHighlight: TextHighlight, image: Image) {
        textHighlight.images[notNull(image.rel)] = image;
    }

    public static deleteTextHighlight(pageMeta: IPageMeta, textHighlight: ITextHighlight) {

        if (textHighlight.images) {

            Object.values(textHighlight.images).forEach(image => {

                // const screenshotURI = Screenshots.parseURI(image.src);
                //
                // if (screenshotURI) {
                //     delete pageMeta.screenshots[screenshotURI.id];
                // }

            });

        }

        delete pageMeta.textHighlights[textHighlight.id];

    }

    public static toHTML(textHighlight: ITextHighlight): HTMLStr {

        let html: string = "";

        if (typeof textHighlight.text === 'string') {
            html = `<p>${textHighlight.text}</p>`;
        }

        // TODO: prefer to use revisedText so that the user can edit the text
        // that we selected from the document without reverting to the original

        if (isPresent(textHighlight.text) && typeof textHighlight.text === 'object') {

            // TODO: move this to an isInstanceOf in Texts
            if ('TEXT' in <any> (textHighlight.text) || 'HTML' in <any> (textHighlight.text)) {

                const text = <Text> textHighlight.text;

                if (text.TEXT) {
                    html = `${text.TEXT}`;
                }

                if (text.HTML) {
                    html = text.HTML;
                }

            }

        }

        return html;

    }

}
