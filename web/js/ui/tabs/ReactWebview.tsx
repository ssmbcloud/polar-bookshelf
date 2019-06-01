import * as React from 'react';
import {NULL_FUNCTION} from '../../util/Functions';
import {WebviewTag} from 'electron';

/**
 * A ReactWebview component which renders as a 'webview' and is smart on how
 * to handle props without reloading.
 */
export class ReactWebview extends React.PureComponent<IProps, any> {

    constructor(props: IProps, context: any) {
        super(props, context);
        this.onRef = this.onRef.bind(this);
        this.onTitleUpdated = this.onTitleUpdated.bind(this);

    }

    public render() {

        const trueAsStr = 'true' as any;
        const falseAsStr = 'false' as any;

        return <webview ref={ref => this.onRef(ref)}
                        id={'tab-webview-' + this.props.id}
                        disablewebsecurity={this.props.disablewebsecurity ? trueAsStr : falseAsStr}
                        autosize={this.props.autosize ? trueAsStr : falseAsStr}
                        nodeintegration={this.props.nodeintegration ? trueAsStr : falseAsStr}
                        style={{
                            width: this.props.cssWidth,
                            height: this.props.cssHeight
                        }}
                        src={this.props.src}/>;

    }

    private onRef(ref: HTMLWebViewElement | null) {

        if (! ref) {
            console.warn("No ref");
            return;
        }

        const webviewTag = ref as WebviewTag;

        webviewTag.addEventListener('page-title-updated', event => {
            this.onTitleUpdated(event.title);
        });

    }

    private onTitleUpdated(title: string) {

        const onTitleUpdated = this.props.onTitleUpdated || NULL_FUNCTION;
        onTitleUpdated(title);

    }

}

interface IProps {
    readonly id: string;
    readonly disablewebsecurity: boolean;
    readonly autosize: boolean;
    readonly nodeintegration: boolean;
    readonly cssWidth: string | number;
    readonly cssHeight: string | number;
    readonly src: string;
    readonly onTitleUpdated: (title: string) => void;
}
