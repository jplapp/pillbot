const Actions = require('./actions');

let actions = new Actions(1,2);

const moment = require('moment');

function now(){
    let now = moment();
    now = now.set('hour', 17);
    return now
}

test('a', ()  => {
    
    // start 2 days ago, one hour till pill take time
    let twoDaysAgo = now().subtract(2, 'days');
    twoDaysAgo = twoDaysAgo.subtract(1, 'hours');

    let user = {
        start_date: twoDaysAgo.unix()
    };

    // pill taken just now -> false
    let res = actions.checkIfShouldTakePill(user, now().format(), now());
    expect(res).toBe(false);

    // pill taken one hour ago
    let res1 = actions.checkIfShouldTakePill(user, now().subtract(1, 'hours').format(), now());
    expect(res1).toBe(false);

    // pill taken 8 hours ago
    let res1a = actions.checkIfShouldTakePill(user, now().subtract(8, 'hours').format(), now());
    expect(res1a).toBe(false);

    // pill taken yesterday -> true
    let res2 = actions.checkIfShouldTakePill(user, now().subtract(1, 'days').format(), now());
    expect(res2).toBe(true);

    // pill taken yesterday -> true
    let res3 = actions.checkIfShouldTakePill(user, now().subtract(26, 'h').format(), now());
    expect(res3).toBe(true)


});

test('b', () => {

    let twoDaysAgo = now().subtract(2, 'days');
    twoDaysAgo = twoDaysAgo.subtract(actions.MAX_PILL_TAKE_TIME+1, 'hours');

    let user = {
        start_date: twoDaysAgo.unix()
    };

    // pill taken just now -> false
    let res = actions.checkIfShouldTakePill(user, now().format(), now());
    expect(res).toBe(false);

    // pill taken one hour ago
    let res1 = actions.checkIfShouldTakePill(user, now().subtract(1, 'hours').format(), now());
    expect(res1).toBe(false);

    // pill taken yesterday
    let res2 = actions.checkIfShouldTakePill(user, now().subtract(1, 'days').format(), now());
    expect(res2).toBe(false);

    // pill taken yesterday,but more than MAX_PILL_TAKE_TIME have passed, so skip this day -> false
    let res3 = actions.checkIfShouldTakePill(user, now().subtract(26, 'h').format(), now());
    expect(res3).toBe(false)
});

test('c', () => {


    let today = now().subtract(1, 'hours');

    let user = {
        start_date: today.unix()
    };

    // pill taken just now -> false
    let res = actions.checkIfShouldTakePill(user, now().format(), now());
    expect(res).toBe(false);

    // pill taken yesterday, but more than MAX_PILL_TAKE_TIME have passed, so skip this day -> false
    let res2 = actions.checkIfShouldTakePill(user, now().subtract(1, 'days').format(), now());
    expect(res2).toBe(true)
});

test('d', () => {

    let finalDayIsToday = now().subtract(20, 'days');
    finalDayIsToday = finalDayIsToday.subtract(1, 'hours');

    let user = {
        start_date: finalDayIsToday.unix()
    };

    // pill taken just now -> false
    let res = actions.checkIfShouldTakePill(user, now().format(), now());
    expect(res).toBe(false);

    // pill taken yesterday, but more than MAX_PILL_TAKE_TIME have passed, so skip this day -> false
    let res2 = actions.checkIfShouldTakePill(user, now().subtract(1, 'days').format(), now());
    expect(res2).toBe(true)
});

test('d', () => {

    let pause = now().subtract(21, 'days');
    pause = pause.subtract(1, 'hours');

    let user = {
        start_date: pause.unix()
    };

    // pill taken just now -> false
    let res = actions.checkIfShouldTakePill(user, now().format(), now());
    expect(res).toBe(false);

    // pill taken yesterday, but more than MAX_PILL_TAKE_TIME have passed, so skip this day -> false
    let res2 = actions.checkIfShouldTakePill(user, now().subtract(1, 'days').format(), now());
    expect(res2).toBe(false)
});

test('d', () => {

    let onePeriodAgo = now().subtract(28, 'days');
    onePeriodAgo = onePeriodAgo.subtract(1, 'hours');

    let user = {
        start_date: onePeriodAgo.unix()
    };

    // pill taken just now -> false
    let res = actions.checkIfShouldTakePill(user, now().format(), now());
    expect(res).toBe(false);

    // pill taken yesterday, but more than MAX_PILL_TAKE_TIME have passed, so skip this day -> false
    let res2 = actions.checkIfShouldTakePill(user, now().subtract(1, 'days').format(), now());
    expect(res2).toBe(true)

});
