var Bot = require('bot');
var PF = require('pathfinding');
var bot = new Bot('rxov3z58', 'training', 'http://vindinium.org'); //Put your bot's code here and change training to Arena when you want to fight others.
//var bot = new Bot('p60t9kx5', 'arena', 'http://52.8.116.125:9000'); //Put your bot's code here and change training to Arena when you want to fight others.
var goDir;
var Promise = require('bluebird');
Bot.prototype.botBrain = function() {
    return new Promise(function(resolve, reject) {
        _this = bot;        

////*                    This Code is global data!                               *////     
        
        // Set myDir to what you want and it will set bot.goDir to that direction at the end.  Unless it is "none"
        var myDir;
        var myPos = [bot.yourBot.pos.x, bot.yourBot.pos.y];
        
        //creates an array of all the enemy bots
        var enemyBots = [];
        if(bot.yourBot.id != 1) enemyBots.push(bot.bot1);
        if(bot.yourBot.id != 2) enemyBots.push(bot.bot2);
        if(bot.yourBot.id != 3) enemyBots.push(bot.bot3);
        if(bot.yourBot.id != 4) enemyBots.push(bot.bot4);
        
        //creates doubleDrink and sets the boolean as false
        if(bot.data.game.turn < 5) {
            bot.doubleDrink = false;
        }
       
        //This looks at the array of all the free mines and then identifies the closest free mine
        var closestFreeMine = bot.freeMines[0];
        for(i = 0; i < bot.freeMines.length; i++) {
            if(bot.findDistance(myPos, closestFreeMine) > bot.findDistance(myPos, bot.freeMines[i])) {
                closestFreeMine = bot.freeMines[i];
            }
        };
      
        //This creates an array of all the enemy mines and then identifies the closest enemy mine
        var enemyMines = [];
        for(i = 1; i <= 4; i++) {
            if(bot.yourBot.id !== i) {
                enemyMines = enemyMines.concat(bot['bot' + i + 'mines'])
            }
        };
        var closestEnemyMine = enemyMines[0];
        for(i = 0; i < enemyMines.length; i++) {
            if(bot.findDistance(myPos, closestEnemyMine) > bot.findDistance(myPos, enemyMines[i])) {
                closestEnemyMine = enemyMines[i];
            }
        };
    
        //This creates an array of all mines and then identifies the closest mine
        var allMines = [];
        allMines = bot.freeMines.concat(enemyMines);
        var closestMine = allMines[0];
        for(i = 0; i < allMines.length; i++) {
            if(bot.findDistance(myPos, closestMine) > bot.findDistance(myPos, allMines[i])) {
                closestMine = allMines[i];
            }
        }
       
        //This looks at the array of all the taverns and then identifies the closest tavern
        var closestTavern = bot.taverns[0];
        for(i = 0; i < bot.taverns.length; i++) {
            if(bot.findDistance(myPos, closestTavern) > bot.findDistance(myPos, bot.taverns[i])) {
                closestTavern = bot.taverns[i];
            }
        };
       
        //This sets the closestEnemy as the enemy bot with the closest position
        var closestEnemy = enemyBots[0]
        for(i = 0; i < enemyBots.length; i++) {
            if(bot.findDistance(myPos, closestEnemy) > bot.findDistance(myPos, enemyBots[i])) {
                closestEnemy = enemyBots[i];
            }
        };
        
        
        
        //This is my checkAttack function which will determine if I want to attack a specific target
        function checkAttack (closestEnemy) {
            if (findDistance(myPos, closestEnemy) < 5 && bot.yourBot.life > (closestEnemy.life - 20)) {
                return true
            } else {
                return false
            }
        }
        
        var task;
       
        
////*               This Code Decides WHAT to do             *////

        if (checkAttack(closestEnemy)) {
            task = "attack"
        } else {
            if(bot.yourBot.life < 41) {
                bot.doubleDrink = true;
                task = "findTavern"; 
            } else if(bot.doubleDrink) {
                bot.doubleDrink = false;
                task = "findTavern"
            } else {
                task = "claimMines"
            }
        }
         
        
////*            This Code Determines HOW to do it           *////
        // This Code find the nearest freemine and sets myDir toward that direction // 
        if(task === "findTavern") {
            console.log("Going to a Tavern")
            myDir = bot.findPath(myPos, closestTavern);
        } else if(task === "claimMines") {
            console.log("claiming mines");
            myDir = bot.findPath(myPos, closestMine);
        } else if (task === "attack") {
            myDir = findPath(myPos, closestEnemy)
        } else {
            console.log("no task set")
        }
       
/* This Code Sets your direction based on myDir.  If you are trying to go to a place that you can't reach, you move randomly. 
 * Otherwise you move in the direction set by your code.  Feel free to change this code if you want.*/
        
        if(myDir === "none") {
            console.log("Going Random!");
            var rand = Math.floor(Math.random() * 4);
            var dirs = ["north", "south", "east", "west"];
            bot.goDir = dirs[rand];
        } else {
            bot.goDir = myDir;
        }
        
        
///////////* DON'T REMOVE ANTYTHING BELOW THIS LINE *//////////////
        resolve();
    })
}
bot.runGame();