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
     
     setStartDate(id, day, hours=17, minutes=0){
         let d = moment()

         //if from previous month, substract one month
         if(day > d.date()){
            d.set('month', (d.month()+12-1) % 12)
            if(d.month() == 11){
                d.set('year', d.year()-1)  // go one year back from jan to dec
            }
         }
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
        this.db.all('SELECT id, name, lang, start_date, contact FROM users WHERE start_date is not NULL', cb)
    }
    getUser(user_id, cb){
        this.db.get('SELECT id, name, lang, start_date, contact FROM users WHERE id=?', [user_id],cb)
    }

    getLastTakenDate(id, cb){
        this.db.get('SELECT max(date) as d from log where id=?', [id], cb)
    }
    getAllTakenDates(id, cb){
        this.db.all('SELECT date as d from log where id=? and taken=1', [id], cb)
    }

    findUserByName(name, cb){
        this.db.get("SELECT * from users where LOWER(name)=LOWER(?)", name, cb)
    }
    setUserContact(user_id, contact_user_id){
        this.db.run("UPDATE users set contact=? where id=?", [contact_user_id, user_id])
    }
     
}

module.exports = DB