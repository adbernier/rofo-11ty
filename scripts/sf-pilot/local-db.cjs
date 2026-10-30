// Synthetic local test adapter: executes real SQLite SQL using the D1 binding shape.
// Never opens any existing Wrangler/customer database.
const {DatabaseSync}=require('node:sqlite');
class LocalD1 {
 constructor(file=':memory:'){this.sqlite=new DatabaseSync(file);}
 prepare(sql){const db=this;return {args:[],bind(...args){this.args=args;return this;},async first(){return db.sqlite.prepare(sql).get(...this.args)||null;},async all(){return {results:db.sqlite.prepare(sql).all(...this.args)};},async run(){const r=db.sqlite.prepare(sql).run(...this.args);return {success:true,meta:{changes:Number(r.changes),last_row_id:Number(r.lastInsertRowid)}};}};}
 async batch(statements){this.sqlite.exec('BEGIN IMMEDIATE');try{const out=[];for(const stmt of statements)out.push(await stmt.run());this.sqlite.exec('COMMIT');return out;}catch(e){this.sqlite.exec('ROLLBACK');throw e;}}
 close(){this.sqlite.close();}
}
module.exports={LocalD1};
