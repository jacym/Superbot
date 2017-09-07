const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const ytdl = require('ytdl-core');
const fs = require('fs')

var queue = {};

client.login(config.token);


client.on('ready', () => {
  console.log('I am ready!');
});
//on message to the server
client.on('message', (message) => {
  function songadd(song){
    String(song);
    ytdl.getInfo(song, (err, info)=> {
      if (err){//Link not correct/broken
        return message.channel.send("This link doesn't seem to work, check your URL and try again");
      }
      if(!queue.hasOwnProperty(message.guild.id)) queue[message.guild.id]={}, queue[message.guild.id].playing=false, queue[message.guild.id].songs=[];
      queue[message.guild.id].songs.push({song: song, name: info.title, dj: message.author.username});
      message.channel.send(`**${message.author.username}** added **${info.title}** to number **${Object.keys(queue[message.guild.id].songs).length}** in the playlist`);
    });
  }

  function songplay(){
    message.channel.sendMessage('```Playing **${song.name}** requested by **${song.dj}```');
    //join channel first

    player=message.guild.voiceConnection.playFile(yt(song.song,{audioonly:true}),{passes: 1});
    let collector = message.channel.createCollector(m => m);
    collector.on('message', m => {
      if (m.content.startsWith(tokens.prefix + 'pause')) {
        message.channel.sendMessage('paused').then(() => {player.pause();});
      } else if (m.content.startsWith(tokens.prefix + 'resume')){
        message.channel.sendMessage('resumed').then(() => {player.resume();});
      } else if (m.content.startsWith(tokens.prefix + 'skip')){
        message.channel.sendMessage('skipped').then(() => {player.end();});
      } else if (m.content.startsWith('volume+')){
        if (Math.round(player.volume*50) >= 100) return message.channel.sendMessage(`Volume: ${Math.round(player.volume*50)}%`);
        player.setVolume(Math.min((player.volume*50 + (2*(m.content.split('+').length-1)))/50,2));
        message.channel.sendMessage(`Volume: ${Math.round(player.volume*50)}%`);
      } else if (m.content.startsWith('volume-')){
        if (Math.round(player.volume*50) <= 0) return message.channel.sendMessage(`Volume: ${Math.round(player.volume*50)}%`);
        player.setVolume(Math.max((player.volume*50 - (2*(m.content.split('-').length-1)))/50,0));
        message.channel.sendMessage(`Volume: ${Math.round(player.volume*50)}%`);
      } else if (m.content.startsWith(tokens.prefix + 'time')){
        message.channel.sendMessage(`time: ${Math.floor(player.time / 60000)}:${Math.floor((player.time % 60000)/1000) <10 ? '0'+Math.floor((player.time % 60000)/1000) : Math.floor((player.time % 60000)/1000)}`);
      }
    });
    player.on('end', () => {
      collector.stop();
      play(queue[message.guild.id].songs.shift());
    });
    player.on('error', (err) => {
      return message.channel.sendMessage('error: ' + err).then(() => {
        collector.stop();
        play(queue[message.guild.id].songs.shift());
      });
    });
  (queue[message.guild.id].songs.shift());
  }

  let prefix = config.prefix;

  if (!message.content.startsWith(prefix) || message.author.bot) return;

  //CHECK IF BOT CONNECTED
  if (message.content.startsWith(prefix + 'ping')) {
    message.channel.send('connected!');
  }else

  // RETURNS A RANDOM NUMBER FROM A MIN TO A MAX
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
  }else

  // RESPONDS BOOSTED
  if (message.content.startsWith(prefix + 'kek')) {
    message.channel.send("BOOSTED");
  }else

  // RESPONDS WOW
  if(message.content.startsWith(prefix + 'wow')){
    message.channel.send("WOW!");
  }else

  // INVITE ALL PEOPLE ONLINE IN SERVER TO PLAY
  if (message.content.startsWith(prefix + 'game')){
    let args = message.content.split(' ').slice(1);
    var game="";
    for (i=0; i<args.length; i++){
      game = game.concat(args[i]+" ");
    }
    message.channel.send(`@here ${game}lets go lets go`);
  }else

  //help
  if (message.content.startsWith(prefix+'help')){
    message.channel.send("Check your Direct Messages!")
    message.author.send('``` [COMMMANDS] \n help: Get the command list sent to you again \n kek: messages back with BOOSTED \n wow: Messages back with wow! \n random x y: returns a whole number between the 2 numbers inserted \n game [game name]: asks everyone on the server to play the game input \n ping: lets you know if the bot is connected by responding connected! \n Thanks For Reading!```');
  }else

  // MUSIC BOT
  if(message.content.startsWith(prefix+'play')){
    var link=message.content.split(" ")[1]; //only get the link to the youtube song
    if (link=='' || link== undefined){//if no link after play command play first song in queue
      if (queue[message.guild.id]==undefined){
        return message.channel.send("There are no songs in your list, add a link after your play command or use the add command to add it to queue");
      }
      songplay()
    }
    songadd(link);
    songplay();
  }else
  //add command
  if(message.content.startsWith(prefix+'add')){
    var link=message.content.split(" ")[1]; //only get the link to the youtube song
    songadd(link);
  }else
  if (message.content.startsWith(prefix+'join')){
    const voiceChannel=message.member.voiceChannel;
    if (voiceChannel==undefined){
      return message.channel.send("Join a voice channel before playing music");
    }
    voiceChannel.join()
    .then(connection => console.log('Voice Connected!'))
    .catch(console.error);
  }
  //list songs command
  if(message.content.startsWith(prefix+'list')){
    if (queue[message.guild.id]==undefined){
      return message.channel.send("Add some songs to your list first with the play command");
    }
    let printlist=[];
    queue[message.guild.id].songs.forEach((song, i)=> {printlist.push(`${i+1}. ${song.name} - requested by ${song.dj}`);});
    message.channel.send(`__**${message.guild.name}'s Music List:**__ Currently **${printlist.length}** songs in playlist \n \`\`\`${printlist.join('\n')}\`\`\``);
  }
});
