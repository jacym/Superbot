const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
//const ytdl = require('ytdl-core');
const fs = require('fs')

client.login(config.token);

client.on('ready', () => {
  console.log('I am ready!');
});
//on message to the server
client.on('message', (message) => {
  let prefix = config.prefix;

  if (!message.content.startsWith(prefix) || message.author.bot) return;
  //CHECK IF BOT CONNECTED
  if (message.content.startsWith(prefix + 'ping')) {
    message.channel.send('connected!');
  }else // RETURNS A RANDOM NUMBER FROM A MIN TO A MAX
  if (message.content.startsWith(prefix + 'random')){
    let args = message.content.split(' ').slice(1);
    if (args.length>2){
      message.channel.send("ERROR: Put a minimum number and a largest number after command (whole numbers only)");
      return;
    }
    let smallInt = parseInt(args[0]);
    let bigInt = parseInt(args[1]);
    let randInt = Math.floor(Math.random() * (bigInt-smallInt+1))+smallInt;
    if (isNaN(randInt)){
      message.channel.send("ERROR: Put a minimum number and a largest number after command (whole numbers only)");
    }
    else {
      message.channel.send(randInt);
    }
  }else // RESPONDS BOOSTED
  if (message.content.startsWith(prefix + 'kek')) {
    message.channel.send("BOOSTED");
  }else // RESPONDS WOW
  if(message.content.startsWith(prefix + 'wow')){
    message.channel.send("WOW!");
  }else // INVITE ALL PEOPLE ONLINE IN SERVER TO PLAY
  if (message.content.startsWith(prefix + 'game')){
    let args = message.content.split(' ').slice(1);
    var game="";
    for (i=0; i<args.length; i++){
      game = game.concat(args[i]+" ");
    }
    message.channel.send(`@here ${game}lets go lets go`);
  }else //help
  if (message.content.startsWith(prefix+'help')){
    message.channel.send("Check your Direct Messages!")
    message.author.send("[COMMMANDS] \n help: Get the command list sent to you again \n kek: messages back with BOOSTED \n wow: Messages back with wow! \n random x y: returns a whole number between the 2 numbers inserted \n game [game name]: asks everyone on the server to play the game input \n ping: lets you know if the bot is connected by responding connected! \n Thanks For Reading!");
  }
});
