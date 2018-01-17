const sqlite3 = require('sqlite3').verbose()
const moment = require('moment')

// database

class DB {

    constructor(filename){
        this.db = new sqlite3.Database('db.db')

        this.createTables()
    }
    
    createTables(){
        this.db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER, name TEXT, lang TEXT, start_date INTEGER, contact INTEGER)");
        this.db.run("CREATE TABLE IF NOT EXISTS log (id INTEGER, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, taken INTEGER)");
    }

    createUser(id, name){
        this.db.serialize(()=>{
            this.db.run("delete from users where id =?", [id])
            this.db.run("INSERT INTO users (id, name, lang) VALUES (?, ?, 'de')", [id, name])
            this.db.run("delete from log where id =?", [id])
        })
     }
     
     setStartDate(id, day, hours=20, minutes=0){
         let d = moment()

         //if from previous month, substract one month
         if(day > d.date())
            d.set('month', (d.month()+12-1) % 12)
         d.set('date', day)
         d.set('hour', hours)
         d.set('minute', minutes)
         console.log('starting at', d.format())
         this.db.run("UPDATE users set start_date=? where id=?", [d.unix(), id])
     }

     setPillTaken(id){
        this.db.run("INSERT INTO log (id, taken) VALUES(?, 1)", [id])
    }

    getActiveUsers(cb){
        this.db.all('SELECT id, name, lang, start_date FROM users WHERE start_date is not NULL', cb)
    }

    getLastTakenDate(id, cb){
        this.db.get('SELECT max(date) as d from log where id=?', [id], cb)
    }
     
}

module.exports = DB