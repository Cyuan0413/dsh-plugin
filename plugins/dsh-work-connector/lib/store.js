import { DatabaseSync } from 'node:sqlite';
import { chmodSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

// SQLite transactions couple the source cursor with its outbox entry. No await
// inside a transaction; a parallel MCP request cannot overwrite a stale copy.
export class Store {
  constructor(dir) {
    mkdirSync(dir,{recursive:true,mode:0o700}); chmodSync(dir,0o700);
    this.db=new DatabaseSync(join(dir,'connector.db')); chmodSync(join(dir,'connector.db'),0o600);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;
      CREATE TABLE IF NOT EXISTS records(kind TEXT,id TEXT,data TEXT,PRIMARY KEY(kind,id));`);
    this.read=this.db.prepare('SELECT data FROM records WHERE kind=? AND id=?');
    this.rows=this.db.prepare('SELECT data FROM records WHERE kind=? ORDER BY rowid');
    this.write=this.db.prepare('INSERT OR REPLACE INTO records(kind,id,data) VALUES(?,?,?)');
    this.del=this.db.prepare('DELETE FROM records WHERE kind=? AND id=?');
  }
  get(kind,id) { const row=this.read.get(kind,id);return row && JSON.parse(row.data); }
  all(kind) { return this.rows.all(kind).map(row=>JSON.parse(row.data)); }
  put(kind,item) { this.write.run(kind,item.id,JSON.stringify(item)); }
  remove(kind,id) { this.del.run(kind,id); }
  transaction(fn) { this.db.exec('BEGIN IMMEDIATE');try{const res=fn();this.db.exec('COMMIT');return res;}catch(e){this.db.exec('ROLLBACK');throw e;} }
  close() {this.db.close();}
}
