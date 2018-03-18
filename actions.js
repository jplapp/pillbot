const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

const moment = require('moment')
const PImage = require('pureimage');
const fs = require('fs')
const path = require('path')

const { status, updateStatus, TAKE_A_PILL } = require('./status')

const MAX_PILL_TAKE_TIME = 4 // after 4 hours, give up for the day
const NOTIFY_TIME = 1 // notify 'friend' after X hours
        
var that = null

const NOTIFY_USER_ID = 178787954  // my telegram id, should be modified if used by other people

module.exports = class {

    constructor(db, bot){
        this.db = db
        this.bot = bot

        this.removeKeyboard = Extra.markup(Markup.removeKeyboard())
        this.contactChooserKeyboard = Extra.markup(Markup.inlineKeyboard(Markup.contactRequestButton('contact')))

        that = this
    }

    showCalendar(){
        let num_days = 31
        let board = [[]]

        let today = moment()
        let onePeriodAgo = today.subtract(28, 'days')

        let startOffset = onePeriodAgo.day()
        // add empty buttons in the top row
        for(let i=0; i<startOffset; i++)
            board[0].push(Markup.button('_'))

        let addToBoard = (offset, content) => {
            let rowIndex = Math.floor((offset + startOffset) / 7)
            if(board.length <= rowIndex) board[rowIndex] = []
            board[rowIndex].push(content)
        }
        for(let i=0; i<28; i++){
            let date = onePeriodAgo.add(1, 'days').date()
            
            addToBoard(i, Markup.button(date))
        }

        // add empty buttons in the last row
        while(board[board.length-1].length < 7)
            board[board.length-1].push(Markup.button(' '))
    
        const keyboard = Markup.keyboard(board, {resizeKeyboard: true})
    
        return keyboard
    }

    checkIfShouldTakePill(user, lastTakenDate){
        let start = moment.unix(user.start_date)
        let now = moment()

        console.log('start', start, 'now', now, now.diff(start, 'hours'))

        // check if we should take a pill
        if(now.diff(start, 'days') % 28 < 21 && now.diff(start, 'hours') % 24 < MAX_PILL_TAKE_TIME){
            console.log('should take one')
            //check if user has not already taken a pill today
            let diffLastTakenToNow = now.diff(lastTakenDate, 'hours')
            if(isNaN(diffLastTakenToNow) || diffLastTakenToNow > MAX_PILL_TAKE_TIME){
                // we should take a pill
                return true
            } 
        }
        return false
    }

    // method assumes that user should take a pill
    checkIfShouldNotify(user){
        let start = moment.unix(user.start_date)
        let now = moment()
        console.log('start', start, 'difference in hours for notification: ', now.diff(start, 'hours') % 24)
        return (now.diff(start, 'hours') % 24 >= NOTIFY_TIME)
    }
    
        
    // check if user has to take the pill
    checkUser(user, onTakePill, onNotify){
        console.log('checking user', user)
        
        let handler = (err, res) => {        
            console.log('checked user with res', res)
            let d = moment(res.d)
            
            if(that.checkIfShouldTakePill(user, d)){
                onTakePill(user)

                if(that.checkIfShouldNotify(user)){
                    console.log('notifying')
                    onNotify(user)
                }
            }
            
        }
        this.db.getLastTakenDate(user.id, handler)
    }

    askForPill(user){
        let keyboard = Markup.keyboard([Markup.button('👍')], {resizeKeyboard: true})
        updateStatus(user.id, TAKE_A_PILL)
        this.bot.telegram.sendMessage(user.id, 'Take a Pill!', Extra.markup(keyboard))
    }

    notify(user){
        updateStatus(NOTIFY_USER_ID)
        this.bot.telegram.sendMessage(NOTIFY_USER_ID, 'Your friend '+user.name+' has not taken a pill for 2 hours now. You might want to let her know.')
    }

    getCycleOverview(user_id, resultCb){
        
        function pos(day){
            const radius = 118
            const centerX = 143
            const centerY = 145
            day -= 0.5
            //day -= 11   // for some reason, it starts at the wrong point
            let x = Math.sin(day / 28 * 3.14 * 2) * radius
            let y = Math.cos(day / 28 * 3.14 * 2) * radius

            x+=centerX
            y+=centerY

            y = 300-y
            return {x, y}
        }
        function circle(ctx, center){
            ctx.beginPath();
            ctx.arc(center.x, center.y,10,0,Math.PI*2); // Outer circle
            ctx.closePath();
            ctx.fill();
        }

        let takenDaysCb = (err, days) => {
            console.log(days)
            
            // yeah. welcome to callback hell
            function cb(err, user){
                console.log('user is', user, user_id)
    
                let now = moment()
                let start = moment.unix(user.start_date)
                
                let minDate = Math.floor(now.diff(start, 'days') / 28)
                let takenDays = []
                for(let i=0; i<days.length; i++){
                    let ts = days[i].d 
                    if(ts>15213939110)  // normalize
                        ts /= 1000
                    
                    let dayInCycle = moment.unix(ts).diff(start, 'days') 
                    if(dayInCycle < minDate)
                        continue
                    takenDays.push(dayInCycle % 28)         
                }
                console.log(takenDays)
    
                let dayInCycle = now.diff(start, 'days') % 28
    
                let img = fs.createReadStream(path.join(__dirname,"cycle.jpg"))
                console.log(pos(dayInCycle), dayInCycle)
                
                PImage.decodeJPEGFromStream(img).then((img) => {
                    console.log("size is",img.width,img.height);
                    
                    var img2 = PImage.make(300,300);
                    var c = img2.getContext('2d');
                    c.drawImage(img,
                        0, 0, img.width, img.height, // source dimensions
                        0, 0, 300, 300                 // destination dimensions
                    );
    
                    for(let i=1; i<=dayInCycle; i++){
                        if(takenDays.includes(i))     //yay, we took it, makes it green!
                            c.fillStyle = 'rgba(0,150,0, 1)';
                        else
                            c.fillStyle = 'rgba(150,0,0, 1)';
                        
                            let curPos = pos(i)
                        circle(c, curPos)
                    }
    
                    //c.fillStyle = 'rgba(100,100,100,1)';
                    //let curPos = pos(dayInCycle)
                    //circle(c, curPos)
                    
                    var pth = "result.jpg";
                    PImage.encodeJPEGToStream(img2,fs.createWriteStream(pth)).then(() => {
                        let stream = fs.createReadStream(pth)   // we could omit saving and send it correctly. but who's got time for that?
                        resultCb(stream)
                        
                    });
                });
            }

            this.db.getUser(user_id, cb)
        }

        this.db.getAllTakenDates(user_id, takenDaysCb)
        
    }


}