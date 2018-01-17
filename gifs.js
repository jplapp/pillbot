TENOR_API_KEY = '5VPK1UWLLMGN'
const fetch = require('node-fetch')

searchGif = async function(theme, limit=20){
    return fetch(' https://api.tenor.com/v1/search?key='+TENOR_API_KEY+'&q='+theme+'&limit='+limit)
        .then(res => res.json())
        .then(res => {
            console.log(res)
            return res.results
        })   
}

module.exports = {searchGif}