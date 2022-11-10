const router = require("express").Router();
const { User, Friend, FriendReq } = require("../models");
require('dotenv').config();
const request = require('request');
var rp = require('request-promise');
const { parse } = require("handlebars");


let temp1;
let temp2;
let temp3
let newsArray = [];
let newsPerGame = []
let start;
let games
router.get('/', async (req, res) => {
    if (!req.session.loggedIn) {
        res.redirect("/login");
    } else {
        try {
            const userData = await User.findByPk(req.session.user, {
                where: {
                    id: req.params.id
                }
            })
            temp1;
            temp2;
            temp3;
            newsArray = [];
            newsPerGame = []
            const user = userData.get({ plain: true });
            const steam = user.steam_id
            start = 0

            var url = 'http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=' + process.env.APIkey + '&steamid=' + steam + '&format=json'

            rp(url, async function (err, response, body) {
                if (!err && response.statusCode < 400) {
                    temp1 = JSON.parse(body)
                    //  res.send(temp1)
                    const userRecentlyPlayed = await temp1
                    return temp1
                }
            }).then(function (playedData) {
                let parsedData = JSON.parse(playedData)
                // console.log(parsedData.response.games[0].appid + "first.then HERE");
                games = parsedData.response.games
                
                console.log(games[0].name+"line 49")
                // var url = ;

                function getNews() {
                    rp('http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=' + parsedData.response.games[start].appid + '&count=3&maxlength=300&format=json)', async function (err, response, body) {
                        if (!err && response.statusCode < 400) {
                            temp2 = JSON.parse(body)
                            
                            const recentlyPlayedNews = await temp2
                            
                            newsArray = [];
                            newsTemp = []
                            newsArray.push(recentlyPlayedNews)
                            let parsedArray = JSON.stringify(newsArray)
                            

                            for (i = 0; i < 3; i++) {
                                newsTemp.push(newsArray[0].appnews.newsitems[i])
                                
                               
                            }
                            let gameNews = {
                                name : games[start].name,
                                news : newsTemp
                            }
                            newsPerGame.push(gameNews)
                           

                            console.log("START!!!" + newsPerGame + "END!!!!")
                            console.log(games.length)
                            return newsPerGame
                        }
                    }).then(function (content) {
                        console.log(start)
                        start = start + 1
                        if (start < games.length) { 

                            getNews()
                        } else {
                            rp('http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + process.env.APIkey + '&steamids=' + steam, async function (err, response, body) {
                                
                                temp3 = JSON.parse(body)
                                let userInfo = temp3.response.players[0]
                                const userSummary = await temp3
                                console.log(temp3.response.players[0].personaname + "USER DATA HERE")
                                return(userInfo)
                            }).then(function (userContent) {
                                let testerrr = JSON.stringify(newsPerGame[0].news[0])
                                console.log(testerrr+"MY STRING")
                                res.render('dashboard',
                                {
                                    userContent,
                                    newsPerGame,
                                    games,
                                    loggedIn: req.session.loggedIn
                                })
                            }
                            )
                        }
                    })
                }
                getNews()
            })
            // newsArray[0].appnews.newsitems[1]
            //.appnews.newsitems[0]
            // console.log(userRecentlyPlayed.response.games[0].appid+"requestwait")





            // res.render('dashboard', {
            //       user,
            //       loggedIn: req.session.loggedIn,
            //     });
        } catch (err) {
            console.log(err)
            res.status(500).json(err)
        }
    }
})



module.exports = router;