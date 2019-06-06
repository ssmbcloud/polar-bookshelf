import {CurrentDocState, DocFormat} from './DocFormat';
import {Optional} from '../util/ts/Optional';

declare var window: any;

export class PDFFormat extends DocFormat {

    public readonly name = 'pdf';

    constructor() {
        super();
    }

    /**
     * Get the current state of the doc.
     */
    public currentState(): CurrentDocState {

        return {
            nrPages: window.PDFViewerApplication.pagesCount,
            currentPageNumber: window.PDFViewerApplication.pdfViewer.currentPageNumber,
        };

    }

    public supportThumbnails() {
        return true;
    }

    public targetDocument(): HTMLDocument | null {
        return document;
    }

    public currentScale() {
        return window.PDFViewerApplication.pdfViewer._currentScale;
    }

}


