const Telegraf = require('telegraf');

const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');

const Actions = require('./actions');
const DB = require('./database');

const bot = new Telegraf(process.env.BOT_TOKEN);
const db = new DB('db.db');

const { status, updateStatus, CHOOSE_DATE, TAKE_A_PILL, CHOOSE_CONTACT } = require('./status');

const actions = new Actions(db, bot);


bot.start((ctx) => {
    console.log('started:', ctx.from.id, ctx.from);
    db.createUser(ctx.from.id, ctx.from.first_name);
    ctx.reply('Hi '+ctx.from.first_name+'! Should I remind you to take your pill, or do you want to follow someone to help them?')
});

bot.on('message', (ctx) => {
    console.log('received', ctx.message, ctx.from);
    msg = ctx.message.text;
    switch(status[ctx.from.id]){
        case CHOOSE_DATE:
            day = parseInt(ctx.message.text);
            console.log('chosen day: ', day, ctx.message);
            if(day>0 && day<31) {
                db.setStartDate(ctx.from.id, day);
                updateStatus(ctx.from.id);
                ctx.reply("You're all set. I'll notify you in the evening! ", actions.removeKeyboard);
                ctx.reply("I can ask others to tell you when I cannot reach you, so they can contact you offline." +
                    " To do so, please ask your friends to contact me directly. They will need your username, which is "+ctx.from.first_name)
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

        case TAKE_A_PILL:
            if(msg=='👍'){
                db.setPillTaken(ctx.from.id);
                updateStatus(ctx.from.id);

                ctx.reply('awesome', actions.removeKeyboard);
                ctx.telegram.sendDocument(ctx.from.id, {
                    url: 'http://thecatapi.com/api/images/get?format=src&type=gif',
                    filename: 'awesome.gif'
                })
            }
            break;
        default:
            if(msg.toLowerCase().indexOf('status') >= 0){
                let re = (stream) => {
                    ctx.replyWithPhoto({
                        source: stream
                    })
                };
                actions.sendCycleOverview(ctx.from.id, re)
            }
            else if(msg.toLowerCase().indexOf('remind') >= 0){
                ctx.telegram.sendMessage(ctx.from.id, "OK. Let's configure the start of your period!" +
                    " Please choose the date of the first day you have taken your pill in this current cycle."
                    , Extra.markup(actions.showCalendar()));
                updateStatus(ctx.from.id, CHOOSE_DATE)
            }
            else if(msg.toLowerCase().indexOf('follow') >= 0){
                let userIndex = msg.lastIndexOf(' ');
                if(userIndex > 0){
                    let userName = msg.substring(userIndex+1);
                    let onUserFound = (err, user) => {
                        console.log('user found', user);
                        if(!user){
                            ctx.reply('User '+userName+ ' not found. Please check that the name was spelled correctly and try again.')
                        } else {
                            db.setUserContact(user.id, ctx.from.id);
                            ctx.reply('You will now receive alerts when ' + user.name + ' misses taking their pill.')
                        }
                    };
                    let userToFollow = db.findUserByName(userName, onUserFound)
                } else {
                    ctx.reply('Please enter a Telegram user name to follow, e.g. "follow Gerdigunde"')
                }
            }
            else {
                ctx.reply("Whoops, I'm just a bot! Even though I'm probably more clever than Siri, I did not understand that.")
            }
    }

});

bot.startPolling();


// this is run every minute to check whether we should send some notification
function checkLoop(){
    let handler = (err, result) => {
        console.log(result);
        for(let i=0; i<result.length; i++)
            actions.checkUser(result[i], actions.askForPill.bind(actions), actions.notify.bind(actions))

    };
    db.getActiveUsers(handler)

}
setTimeout(checkLoop, 3000);
setInterval(checkLoop, 1000 * 60 * 30); // check every 30 minutes



