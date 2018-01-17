const Telegraf = require('telegraf')

const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

const Actions = require('./actions')
const DB = require('./database')
const gif = require('./gifs')

const bot = new Telegraf(process.env.BOT_TOKEN)
const db = new DB('db.db')

const { status, updateStatus, CHOOSE_DATE, TAKE_A_PILL, CHOOSE_CONTACT } = require('./status')

const actions = new Actions(db, bot)


bot.start((ctx) => {
  console.log('started:', ctx.from.id, ctx.from)
  db.createUser(ctx.from.id, ctx.from.first_name)
  ctx.telegram.sendMessage(ctx.from.id, 'Welcome! Please choose a starting date', Extra.markup(actions.showCalendar()))
  updateStatus(ctx.from.id, CHOOSE_DATE)
})

bot.on('message', (ctx) => {
    console.log('received', ctx.message, ctx.from)
    switch(status[ctx.from.id]){
        case CHOOSE_DATE: 
            day = parseInt(ctx.message.text)
            console.log('chosen day: ', day, ctx.message)
            if(day>0 && day<31) {
                db.setStartDate(ctx.from.id, day)
                updateStatus(ctx.from.id)
                return ctx.reply("You're all set. I'll notify you in the evening", actions.removeKeyboard) 
                /*return ctx.reply("If you want to, you can choose a contact that will be notified when you miss taking your pill", 
                    Extra.markup((markup) => {
                        return markup.resize()
                        .keyboard([
                            markup.contactRequestButton('Send contact')
                        ])
                    })) */
            } else {
                ctx.reply("Please choose a valid day")
            }
            break;

            
        // currently, in telegram this is not supported (requesting sharing of friend's contact)
        /*case CHOOSE_CONTACT: 
            console.log('chosen contact',  ctx.message)
            if(day>0 && day<31) {
                db.setStartDate(ctx.from.id, day)
                updateStatus(ctx.from.id)
                return ctx.reply("You're all set. I'll notify you in the evening", actions.removeKeyboard) 
            } else {
                ctx.reply("Please choose a valid contact")
            }
            break; */

        case TAKE_A_PILL:
            msg = ctx.message.text
            if(msg=='👍'){
                db.setPillTaken(ctx.from.id)
                updateStatus(ctx.from.id)

                
                //let gifs = await gif.searchGif('yeah', 2)
                //let randomGif = gifs[Math.floor(Math.random()*gifs.length)]
                ctx.reply('awesome', actions.removeKeyboard)
                ctx.telegram.sendDocument(ctx.from.id, {
                    url: 'http://thecatapi.com/api/images/get?format=src&type=gif',//randomGif.itemurl,
                    filename: 'awesome.gif'
                  })
            }
            break;
        default:
            ctx.reply('I did not get that')        
    }
    
})

bot.command('help', (ctx) => ctx.reply('Try send a sticker!'))
bot.on('sticker', (ctx) => ctx.reply('👍'))

bot.startPolling()

// this is run every minute to check whether we should send some notification
function checkLoop(){
    let handler = (err, result) => {
        console.log(result)
        for(let i=0; i<result.length; i++)
            actions.checkUser(result[i], actions.askForPill.bind(actions), actions.notify.bind(actions))
        
    }
    db.getActiveUsers(handler)
    
}
setTimeout(checkLoop, 3000)
setInterval(checkLoop, 1000 * 60 * 30) // check every 30 minutes



