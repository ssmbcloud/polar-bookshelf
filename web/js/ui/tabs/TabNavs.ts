

export class TabNavs {

    public static CHANNEL = 'tab-navs.open-link-with-new-tab';

    public static openLinkWithNewTab(link: string) {

        window.postMessage({type: this.CHANNEL, link}, '*');

    }

}

export interface OpenLinkWithNewTabMessage {
    readonly link: string;
}
