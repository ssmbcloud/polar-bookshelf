import {IDocInfo} from '../metadata/IDocInfo';
import {DocMetaRef} from './DocMetaRef';
import {PersistenceEventType} from './PersistenceEventType';

export interface PersistenceLayerEvent {
    docInfo: IDocInfo;
    docMetaRef: DocMetaRef;
    eventType: PersistenceEventType;
}
