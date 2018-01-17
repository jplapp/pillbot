const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

const moment = require('moment')

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
        console.log('difference in hours for notification: ', now.diff(start, 'hours') % 24)
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


}