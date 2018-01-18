const Actions = require('./actions')

const moment = require('moment')

const MAX_PILL_TAKE_TIME = 4 // after 4 hours, give up for the day


function test1(){
    // start 2 days ago, one hour till pill take time
    let twoDaysAgo = moment().subtract(2, 'days')
    twoDaysAgo = twoDaysAgo.subtract(1, 'hours')

    let user = {
        start_date: twoDaysAgo.unix()
    }

    // pill taken just now -> false
    let res = Actions.checkIfShouldTakePill(user, moment().format())
    console.assert(res === false)

    // pill taken one hour ago
    let res1 = Actions.checkIfShouldTakePill(user, moment().subtract(1, 'hours').format())
    console.assert(res1 === false)

    // pill taken 8 hours ago
    let res1 = Actions.checkIfShouldTakePill(user, moment().subtract(8, 'hours').format())
    console.assert(res1 === false)

    // pill taken yesterday -> true
    let res2 = Actions.checkIfShouldTakePill(user, moment().subtract(1, 'days').format())
    console.assert(res2 === true)

    // pill taken yesterday -> true
    let res3 = Actions.checkIfShouldTakePill(user, moment().subtract(26, 'h').format())
    console.assert(res3 === true)
    
    
}

function test2(){

    let twoDaysAgo = moment().subtract(2, 'days')
    twoDaysAgo = twoDaysAgo.subtract(MAX_PILL_TAKE_TIME+1, 'hours')

    let user = {
        start_date: twoDaysAgo.unix()
    }

   // pill taken just now -> false
   let res = Actions.checkIfShouldTakePill(user, moment().format())
   console.assert(res === false)

   // pill taken one hour ago
   let res1 = Actions.checkIfShouldTakePill(user, moment().subtract(1, 'hours').format())
   console.assert(res1 === false)

   // pill taken yesterday, but more than MAX_PILL_TAKE_TIME have passed, so skip this day -> false
   let res2 = Actions.checkIfShouldTakePill(user, moment().subtract(1, 'days').format())
   console.assert(res2 === false)

   // pill taken yesterday,but more than MAX_PILL_TAKE_TIME have passed, so skip this day -> false
   let res3 = Actions.checkIfShouldTakePill(user, moment().subtract(26, 'h').format())
   console.assert(res3 === false)
    
}
function test3(){

    let today = moment().subtract(1, 'hours')

    let user = {
        start_date: today.unix()
    }

   // pill taken just now -> false
   let res = Actions.checkIfShouldTakePill(user, moment().format())
   console.assert(res === false)

   // pill taken yesterday, but more than MAX_PILL_TAKE_TIME have passed, so skip this day -> false
   let res2 = Actions.checkIfShouldTakePill(user, moment().subtract(1, 'days').format())
   console.assert(res2 === true)
    
}
function test4(){

    let finalDayIsToday = moment().subtract(20, 'days')
    finalDayIsToday = finalDayIsToday.subtract(1, 'hours')

    let user = {
        start_date: finalDayIsToday.unix()
    }

   // pill taken just now -> false
   let res = Actions.checkIfShouldTakePill(user, moment().format())
   console.assert(res === false)

   // pill taken yesterday, but more than MAX_PILL_TAKE_TIME have passed, so skip this day -> false
   let res2 = Actions.checkIfShouldTakePill(user, moment().subtract(1, 'days').format())
   console.assert(res2 === true)
    
}
function test5(){

    let pause = moment().subtract(21, 'days')
    pause = pause.subtract(1, 'hours')

    let user = {
        start_date: pause.unix()
    }

   // pill taken just now -> false
   let res = Actions.checkIfShouldTakePill(user, moment().format())
   console.assert(res === false)

   // pill taken yesterday, but more than MAX_PILL_TAKE_TIME have passed, so skip this day -> false
   let res2 = Actions.checkIfShouldTakePill(user, moment().subtract(1, 'days').format())
   console.assert(res2 === false)
    
}
function test6(){

    let onePeriodAgo = moment().subtract(28, 'days')
    onePeriodAgo = onePeriodAgo.subtract(1, 'hours')

    let user = {
        start_date: onePeriodAgo.unix()
    }

   // pill taken just now -> false
   let res = Actions.checkIfShouldTakePill(user, moment().format())
   console.assert(res === false)

   // pill taken yesterday, but more than MAX_PILL_TAKE_TIME have passed, so skip this day -> false
   let res2 = Actions.checkIfShouldTakePill(user, moment().subtract(1, 'days').format())
   console.assert(res2 === true)
    
}

test1()
test2()
test3()
test4()
test5()
test6()

