import * as ReactDOM from 'react-dom';
import * as React from 'react';
import {Logger} from '../../../web/js/logger/Logger';
import {NULL_FUNCTION} from '../../../web/js/util/Functions';
import {TabNav} from '../../../web/js/ui/tabs/TabNav';

const log = Logger.create();

export class TabbedBrowserApp {

    public async start() {

        ReactDOM.render(

            <div style={{height: '100%'}}>

                <TabNav addTabBinder={NULL_FUNCTION}
                        initialTabs={[
                            // {
                            //     title: "Repository",
                            //     required: true,
                            //     content: <div>
                            //
                            //         <HashRouter hashType="noslash">
                            //
                            //             <Switch>
                            //                 <Route exact path='/(logout|overview|login|configured|invite|premium)?' render={renderDocRepoApp}/>
                            //                 <Route exact path='/annotations' render={renderAnnotationRepoApp}/>
                            //                 <Route exact path='/whats-new' render={renderWhatsNew}/>
                            //                 <Route exact path='/community' render={renderCommunity}/>
                            //                 <Route exact path='/stats' render={renderStats}/>
                            //                 <Route exact path='/logs' render={renderLogs}/>
                            //                 <Route exact path='/editors-picks' render={editorsPicks}/>
                            //             </Switch>
                            //
                            //         </HashRouter>
                            //
                            //     </div>
                            // },
                            {
                                title: "Document Repository",
                                content: "/apps/repository/index.html"
                            },
                            {
                                title: "Example Tab 1",
                                content: "https://www.msnbc.com"
                            },
                            {
                                title: "Example Tab 2",
                                content: "https://reddit.com"
                            }
                        ]}/>

            </div>,

            document.getElementById('root') as HTMLElement

        );

    }

}
