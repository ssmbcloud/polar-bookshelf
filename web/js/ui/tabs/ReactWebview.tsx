import * as React from 'react';

/**
 * A ReactWebview component which renders as a 'webview' and is smart on how
 * to handle props without reloading.
 */
export class ReactWebview extends React.PureComponent<IProps, any> {

    constructor(props: IProps, context: any) {
        super(props, context);
    }

    public render() {

        const trueAsStr = 'true' as any;
        const falseAsStr = 'false' as any;

        return <webview id={'tab-webview-' + this.props.id}
                        disablewebsecurity={this.props.disablewebsecurity ? trueAsStr : falseAsStr}
                        autosize={this.props.autosize ? trueAsStr : falseAsStr}
                        nodeintegration={this.props.nodeintegration ? trueAsStr : falseAsStr}
                        style={{
                            width: this.props.cssWidth,
                            height: this.props.cssHeight
                        }}
                        src={this.props.src}/>;

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
}
