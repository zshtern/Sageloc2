import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Content } from 'ionic-angular';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);
const remote = 'http://localhost:5984/sagelocdb';

@Injectable()
export class StorageService {
    private db: PouchDB.Database<Content>;

    constructor(private storage: Storage) {
        this.db = new PouchDB('sagelocdb');
        // this.db.sync(remote, {live: true, retry: true});
        this.db.changes({live: true, since: 'now', include_docs: true})
            .on('change', (change) => {
                // console.log(change)
            });
    }

    init() {
        return this.storage.ready();
    }

    storeLocal(key: string, data: any) {
        return this.storage.set(key, data);

    }

    getLocal(key: string): Promise<any> {
        return this.storage.get(key)
    }

    store(doc): Promise<any> {
        doc._id = new Date().toJSON();
        return this.db.put(doc);
    }

    getById(id) {
        this.db.get(id);
    }

    getDocs() {
        return this.db.allDocs({include_docs: true})
            .then((result) => {
                const data = [];
                result.rows.map((row) => data.push(row.doc));
                return data;
            });
    }

    getByType(type): Promise<any> {
        return this.db
            .createIndex({index: {fields: ['type']}})
            .then(() => {
                return this.db.find({
                    selector: {
                        type: type
                    },
                    sort: ['_id']
                });
            });
    }

    remove(doc: any) {
        return this.db.remove(doc);
    }
}
