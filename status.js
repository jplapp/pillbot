status = []

exports = module.exports

exports.status = status
exports.TAKE_A_PILL = 'tp'
exports.CHOOSE_DATE = 'cd'
exports.CHOOSE_CONTACT = 'cc'

exports.updateStatus = function(user_id, newStatus=null){
    status[user_id] = newStatus
}
