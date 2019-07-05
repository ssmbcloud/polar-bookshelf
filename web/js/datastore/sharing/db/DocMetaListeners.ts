import {GroupIDStr} from "../../Datastore";
import {UserGroup, UserGroups} from "./UserGroups";
import {GroupDoc, GroupDocs} from "./GroupDocs";
import {DocMeta} from "../../../metadata/DocMeta";
import {SetArrays} from "../../../util/SetArrays";
import {PageMeta} from "../../../metadata/PageMeta";
import {Collections, DocumentChange} from "./Collections";
import {DocIDStr} from "../rpc/GroupProvisions";
import {DocMetaHolder, RecordHolder} from "../../FirebaseDatastore";
import {DocMetas} from "../../../metadata/DocMetas";
import {Optional} from "../../../util/ts/Optional";
import {Proxies} from "../../../proxies/Proxies";
import {ProfileOwners} from "./ProfileOwners";
import {Profile, ProfileIDStr, Profiles} from "./Profiles";
import {Author} from "../../../metadata/Author";
import {Annotation} from "../../../metadata/Annotation";
import {Logger} from "../../../logger/Logger";
import {UserProfile, UserProfiles} from "./UserProfiles";

const log = Logger.create();

export class DocMetaListener {

    private docMetaIndex: {[docID: string]: DocMeta} = {};

    private groupDocMonitors  = new Set<DocIDStr>();

    private groupDocMonitors2: string[] = [];

    // the current groups being monitored
    private monitoredGroups = new Set<GroupIDStr>();

    constructor(private readonly fingerprint: string,
                private readonly profileID: ProfileIDStr,
                private readonly docMetaHandler: (docMeta: DocMeta, groupDoc: GroupDoc) => void,
                private readonly errHandler: (err: Error) => void) {

    }

    public start() {

        // TODO: exclude my OWN documents by getting my profile and excluding all the docs matching my profile.

        // TODO: we could have a stop method if we added support for keeping the
        // unsubscribe functions.

        const handleUserGroups = async () => {
            await UserGroups.onSnapshot(userGroup => this.onSnapshotForUserGroup(userGroup));
        };

        handleUserGroups()
            .catch(err => this.errHandler(err));

    }

    public onSnapshotForUserGroup(userGroup: UserGroup | undefined) {

        console.log("FIXME680");

        if (! userGroup) {
            return;
        }

        if (! userGroup.groups) {
            log.warn("No user groups on object: ", userGroup);
            return;
        }

        for (const groupID of userGroup.groups) {

            if (this.monitoredGroups.has(groupID)) {
                continue;
            }

            this.monitoredGroups.add(groupID);

            this.handleGroup(groupID)
                .catch(err => this.errHandler(err));

        }

    }

    public async handleGroup(groupID: GroupIDStr) {

        await GroupDocs.onSnapshotForByGroupIDAndFingerprint(groupID,
                                                             this.fingerprint,
                                                             groupDocs => this.onSnapshotForGroupDocs(groupDocs));

    }

    public onSnapshotForGroupDocs(groupDocChanges: ReadonlyArray<DocumentChange<GroupDoc>>) {
        console.log("FIXME681");

        for (const groupDocChange of groupDocChanges) {

            this.handleGroupDoc(groupDocChange)
                .catch(err => this.errHandler(err));

        }

    }

    public async handleGroupDoc(groupDocChange: DocumentChange<GroupDoc>) {

        // TODO: we technically need to keep track and unsubscribe when documents are
        // removed from the group.

        if (groupDocChange.type === 'removed') {
            // we only care about added or updated
            return;
        }

        const groupDoc = groupDocChange.value;

        console.log("FIXME681, groupDoc ", groupDoc)

        const {docID, profileID} = groupDoc;

        if (profileID === this.profileID) {
            // this is my OWN doc so sort of pointless to index it.
            return;
        }

        console.log("FIXME682: goign to handle it now ", groupDoc)

        if (! this.groupDocMonitors.has(docID)) {

            const handler = async () => {

                // FIXME: this doesn't seem to be working and the groupDocMonitors doesn't seem to be getting updated

                // FIXME: I think we're getting two document records... one cache and one live due to this issue

                console.log("FIXME 668: groupDocMonitors", this.groupDocMonitors);
                console.log("FIXME 669: groupDocMonitors2", this.groupDocMonitors2);

                console.log("FIXME670: going to push: " + docID);

                // add it before we try collect snapshots because we await
                this.groupDocMonitors.add(docID);
                this.groupDocMonitors2.push(docID);

                console.log("FIXME 671: groupDocMonitors", this.groupDocMonitors);
                console.log("FIXME 672: groupDocMonitors2", this.groupDocMonitors2);

                // start listening to snapshots on this docID
                await DocMetaRecords.onSnapshot(docID,
                    docMetaRecord => this.onSnapshotForDocMetaRecord(groupDoc, docMetaRecord));

            };

            await handler();

        }

    }

    public onSnapshotForDocMetaRecord(groupDoc: GroupDoc,
                                      docMetaRecord: DocMetaRecord | undefined) {

        console.log("FIXME:666 got onSnapshotForDocMetaRecord: ", groupDoc);

        this.handleDocMetaRecord(groupDoc, docMetaRecord)
            .catch(err => this.errHandler(err));

    }

    public async handleDocMetaRecord(groupDoc: GroupDoc,
                                     docMetaRecord: DocMetaRecord | undefined) {

        // listen to snapshots of this DocMeta and then perform the merger...

        if (!docMetaRecord) {
            // doc was removed
            return;
        }

        const {docID, fingerprint} = groupDoc;

        const prev = Optional.of(this.docMetaIndex[docID]).getOrUndefined();

        const createDocMeta = () => {

            const result = DocMetas.deserialize(docMetaRecord.value.value, fingerprint);

            if (prev) {
                return result;
            }

            console.log("FIXME666: creating proxy");
            return Proxies.create(result);

        };

        const curr = createDocMeta();

        await DocMetaRecords.applyAuthorsFromGroupDoc(curr, groupDoc);

        if (prev) {

            console.log("FIXME doing merge update");
            // now merge the metadata so we get our events fired.
            DocMetaRecords.mergeDocMetaUpdate(curr, prev);
        } else {
            // only emit on the FIRST time we see the doc and then give the caller a
            // proxied object after that...
            this.docMetaHandler(curr, groupDoc);
        }

        // now update the index...
        this.docMetaIndex[docID] = curr;

    }

}

export class DocMetaListeners {

    public static async register(fingerprint: string,
                                 docMetaHandler: (docMeta: DocMeta, groupDoc: GroupDoc) => void,
                                 errHandler: (err: Error) => void) {

        console.log("FIXME677");

        const profileOwner = await ProfileOwners.get();

        if (! profileOwner) {
            throw new Error("No profile");
        }

        const {profileID} = profileOwner;

        new DocMetaListener(fingerprint, profileID, docMetaHandler, errHandler).start();

    }

}

interface StringDict<T> {
    [key: string]: T;
}

class StringDicts {

    public static merge<T>(source: StringDict<T>, target: StringDict<T>, type: string) {

        console.log("FIXME: ======== merging type: " + type);

        // *** delete excess in the target that were deleted in the source

        const deletable = SetArrays.difference(Object.keys(target), Object.keys(source));

        if (deletable.length > 0) {
            console.log("FIXME deletable: " + deletable.length);
        }

        for (const key of deletable) {
            delete target[key];
        }

        // FIXME: I think we have to update this to ALSO look at the GUID... and if when the GUID
        // is updated we also have to update that too.
        //
        // I think the BEST way to do this would be to compute a key which is ID+guid (if guid is designed)...

        // *** copy new keys into the target
        const copyable = SetArrays.difference(Object.keys(source), Object.keys(target));

        if (copyable.length > 0) {
            console.log("FIXME copyable: " + copyable.length);
        }

        for (const key of copyable) {
            console.log("FIXME going to copy: ", source[key]);

            target[key] = source[key];

        }

    }

}

export class DocMetaRecords {

    public static readonly COLLECTION = 'doc_meta';

    public static async onSnapshot(id: DocMetaIDStr, handler: (record: DocMetaRecord | undefined) => void) {

        return await Collections.onDocumentSnapshot<DocMetaRecord>(this.COLLECTION,
                                                                   id,
                                                                   record => handler(record));

    }

    /**
     * Start with the source and perform a diff against the target.
     */
    public static mergeDocMetaUpdate(source: DocMeta, target: DocMeta) {

        const mergePageMeta = (source: PageMeta, target: PageMeta) => {

            StringDicts.merge(source.textHighlights, target.textHighlights, "text-highlights");
            StringDicts.merge(source.areaHighlights, target.areaHighlights, "area-highlights");
            StringDicts.merge(source.notes, target.notes, "notes");
            StringDicts.merge(source.comments, target.comments, "comments");
            StringDicts.merge(source.questions, target.questions, "questions");
            StringDicts.merge(source.flashcards, target.flashcards, "flashcards");

        };

        for (const page of Object.keys(source.pageMetas)) {
            mergePageMeta(source.pageMetas[page], target.pageMetas[page]);
        }

    }

    public static async applyAuthorsFromGroupDoc(docMeta: DocMeta, groupDoc: GroupDoc) {
        return await this.applyAuthorsFromProfileID(docMeta, groupDoc.profileID);
    }

    public static async applyAuthorsFromProfileID(docMeta: DocMeta, profileID: ProfileIDStr) {

        const userProfile = await UserProfiles.get(profileID);

        return this.applyAuthorsFromUserProfile(docMeta, userProfile);

    }

    public static applyAuthorsFromUserProfile(docMeta: DocMeta, userProfile: UserProfile) {

        const {profile} = userProfile;

        const createAuthorFromProfile = () => {

            const profileID = profile.id;

            const name = profile!.name || profile!.handle || 'unknown';

            const image = {
                src: profile!.image!.url
            };

            return new Author({name, image, profileID, guest: ! userProfile.self});

        };

        const author = createAuthorFromProfile();

        const applyAuthorToAnnotations = (dict: {[key: string]: Annotation}) => {

            for (const annotation of Object.values(dict)) {
                annotation.author = author;
            }

        };

        const applyAuthorToPage = (pageMeta: PageMeta) => {

            applyAuthorToAnnotations(pageMeta.textHighlights);
            applyAuthorToAnnotations(pageMeta.areaHighlights);
            applyAuthorToAnnotations(pageMeta.notes);
            applyAuthorToAnnotations(pageMeta.comments);
            applyAuthorToAnnotations(pageMeta.questions);
            applyAuthorToAnnotations(pageMeta.flashcards);

        };

        for (const page of Object.keys(docMeta.pageMetas)) {
            applyAuthorToPage(docMeta.pageMetas[page]);
        }

    }

}

export type DocMetaIDStr = string;

export type DocMetaRecord = RecordHolder<DocMetaHolder>;
