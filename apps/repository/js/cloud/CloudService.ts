import {Firebase} from '../../../../web/js/firestore/Firebase';
import * as firebase from '../../../../web/js/firestore/lib/firebase';
import {Logger} from '../../../../web/js/logger/Logger';
import {PersistenceLayerManager} from '../../../../web/js/datastore/PersistenceLayerManager';

const log = Logger.create();

export class CloudService {

    private readonly persistenceLayerManager: PersistenceLayerManager;

    constructor(persistenceLayerManager: PersistenceLayerManager) {
        this.persistenceLayerManager = persistenceLayerManager;
    }

    public start() {

        Firebase.init();

        firebase.auth()
            .onAuthStateChanged((user) => this.onAuth(user),
                                (err) => this.onAuthError(err));

    }


    private onAuth(user: firebase.User | null) {

        this.handleAuth(user)
            .catch(err => log.error("Failed to change persistence layer: ", err));

    }

    private async handleAuth(user: firebase.User | null) {

        console.log("onAuth: ", user);

        if (this.persistenceLayerManager.requiresReset()) {
            // when we're resetting don't attempt to change the persistence
            // layer
            return;
        }

        if (user) {
            log.info("Switching to cloud persistence layer");
            await this.persistenceLayerManager.change('cloud');
        } else {
            await this.persistenceLayerManager.change('local');
        }

    }

    private onAuthError(err: firebase.auth.Error) {
        log.error("Authentication error: ", err);
    }

}