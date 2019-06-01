import {Logger} from '../../../web/js/logger/Logger';
import {Logging} from '../../../web/js/logger/Logging';
import {TabbedBrowserApp} from './TabbedBrowserApp';

const log = Logger.create();

async function start() {

    await Logging.init();

    const app = new TabbedBrowserApp();
    await app.start();

}

start().catch(err => log.error("Could not start app: ", err));

