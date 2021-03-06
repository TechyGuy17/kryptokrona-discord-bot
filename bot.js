var TurtleCoinWalletd = require('turtlecoin-walletd-rpc-js').default

const http = require('http');

const fetch = require('node-fetch');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

let api = "https://spookyplanet.nl:3001/coin/XKR/LTC";

let settings = { method: "Get" };

const config = require('./config');

var walletd = new TurtleCoinWalletd(
  'http://localhost',
  8080,
  config.rpcPassword,
  true
)

var fs = require('fs');

// LOAD DATABASE OF OUTGOING WALLETS

let db = {'wallets':[]};

try {
	db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
} catch(err) {}

// LOAD DATABASE OF TIP FUND WALLETS (SERVER RECIEVE)

let bank = {'wallets':[]};

try {
        bank = JSON.parse(fs.readFileSync('bank.json', 'utf8'));
} catch(err) {}



let registerWallet = (user, address) => {

	for ( i in db.wallets ) {
		console.log(db.wallets[i]);

		if (db.wallets[i].user == user) {
			db.wallets.splice(i, 1);
		}

	}

	db.wallets.push({"user":user,"address":address});
	console.log(db.wallets);

	let json = JSON.stringify(db);
	fs.writeFile('db.json',json,'utf8');

}

let getUserWallet = (user) => {

	for ( i in db.wallets ) {
                console.log(db.wallets[i]);

                if (db.wallets[i].user == user) {
                        return db.wallets[i].address;
                }

        }

	return false;

}

let getUserBank = (user) => {

        for ( i in bank.wallets ) {
                console.log(bank.wallets[i]);

                if (bank.wallets[i].user == user) {
                        return bank.wallets[i].wallet;
                }

        }

        return false;


}

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', member => {
  console.log('guildMemberAdd');
  // Send the message to a designated channel on a server:
  const channel = member.guild.channels.cache.find(ch => ch.name === 'general');
  // Do nothing if the channel wasn't found on this server
  if (!channel) return;
  // Send the message, mentioning the member
  channel.send(`Welcome to the server, ${member}`);



  user_bank = getUserBank(member.id);

  if (!user_bank) {
    walletd
            .createAddress()
            .then(resp => {
              console.log(resp.status)
              console.log(resp.headers)
              console.log(resp.body)

              wallet_addr = resp.body.result.address;

              bank.wallets.push({"user":member.id, "wallet":wallet_addr});

              registerWallet(member.id, wallet_addr);


                            member.send('Congratulations! You just got a kryptokrona wallet 😎');
                            member.send('Your address is: ' + wallet_addr);
                            member.send('You can use this address to deposit XKR, and if you want to withdraw simply use the !send command.')
                            member.send('Type !help for more information and more commands!');
                            member.send('If you want to help us out, you can use your wallet address to start mining. Read more here: https://kryptokrona.se/mining-pool/');


              let json = JSON.stringify(bank);
              fs.writeFile('bank.json',json,'utf8');


              	walletd
                        .sendTransaction(0,[{"address":wallet_addr,"amount":100000}],10,[config.donateAddress])
                        .then(resp => {
                          console.log(resp.status)
                          console.log(resp.headers)
                          console.log(resp.body)

                          member.send('Oh, and we also deposited 1000 XKR to your wallet as a thanks for joining us! Don\'t spend it all in one place 🤪');


                        })
                        .catch(err => {
                          console.log(err)

                        })


            })
            .catch(err => {
              console.log(err)
            })
    }

});

client.on('message', msg => {

  if ( msg.content.startsWith('!register') ) {

  let command = msg.content.split(' ');

	if ( command[2] ) {
		msg.reply('Too many arguments!');
		return;
	}


    user_bank = getUserBank(msg.author.id);

    if (!user_bank) {
      walletd
              .createAddress()
              .then(resp => {
                console.log(resp.status)
                console.log(resp.headers)
                console.log(resp.body)

                wallet_addr = resp.body.result.address;

                bank.wallets.push({"user":msg.author.id, "wallet":wallet_addr});

                registerWallet(msg.author.id, wallet_addr);


                              msg.author.send('Congratulations! You just got a kryptokrona wallet 😎');
                              msg.author.send('Your address is: ' + wallet_addr);
                              msg.author.send('You can use this address to deposit XKR, and if you want to withdraw simply use the !send command.')
                              msg.author.send('Type !help for more information and more commands!');
                              msg.author.send('If you want to help us out, you can use your wallet address to start mining. Read more here: https://kryptokrona.se/mining-pool/');


                let json = JSON.stringify(bank);
                fs.writeFile('bank.json',json,'utf8');


                	walletd
                          .sendTransaction(0,[{"address":wallet_addr,"amount":100000}],10,[config.donateAddress])
                          .then(resp => {
                            console.log(resp.status)
                            console.log(resp.headers)
                            console.log(resp.body)

                            member.send('Oh, and we also deposited 1000 XKR to your wallet as a thanks for joining us! Don\'t spend it all in one place 🤪');


                          })
                          .catch(err => {
                            console.log(err)

                          })


              })
              .catch(err => {
                console.log(err)
              })
      }


}

  if (msg.content.startsWith('!help')) {

    const embed = {
      "title": "AVAILABLE COMMANDS",
      "description": "Simply type out these commands, either in a channel where kryptokronabot is present or in a private message to the bot",
      "color": 12525523,
      "footer": {
        "icon_url": "https://old.kryptokrona.se/wp-content/uploads/2019/04/logo-white-shadow.png"
      },
      "thumbnail": {
        "url": "https://old.kryptokrona.se/wp-content/uploads/2019/04/logo-white-shadow.png"
      },
      "fields": [
        {
          "name": "!help",
          "value": "Displays this message."
        },
        {
          "name": "!status",
          "value": "Displays current status of the kryptokrona network."
        },
        {
          "name": "!tip <@user> <amount>",
          "value": 'Sends <amount> XKR to <@user> (tags shouldn\'t be used)'
        },
        {
          "name": "!tipall <amount>",
          "value": 'Sends <amount> XKR to every user in your Discord Server (tags shouldn\'t be used)'
        },
        {
          "name": "!send <amount> <address>",
          "value": 'Sends <amount> XKR to <address> (tags shouldn\'t be used)'
        }
      ]
    };



    	msg.reply({embed});


  }

  if (msg.content.startsWith('!tip') && !msg.content.startsWith('!tipall')) {

	command = msg.content.split(' ');
	receiver = command[1];
	receiver_id = receiver.replace(/[^0-9]/g,'');

	amount = command[2];

    if ( command[3] ) {
          msg.reply('Too many arguments!');
    }

	receiver_wallet = getUserWallet(receiver_id);

	if (!receiver_wallet) {
		client.users.get(receiver_id).send("Hello! You've just been sent a tip, but you don't have a registered wallet. Please use the !register <address> to receive tips.");
	}

	sender_wallet = getUserBank(msg.author.id);


	if(!sender_wallet) {

		msg.author.send("Please use the !register command to obtain a wallet which you can transfer tipping funds to. The command takes one argument, an already existing SEKR address that will be your wallet for receiving tips.");
		return;
	}

	walletd
          .sendTransaction(0,[{"address":receiver_wallet,"amount":parseInt(amount*100000)}],10,[sender_wallet])
          .then(resp => {
            console.log(resp.status)
            console.log(resp.headers)
            console.log(resp.body)

            sender_wallet = resp.body.result.address;

	    msg.react("💸");


          })
          .catch(err => {
            console.log(err)
		msg.author.send("Sorry you don't have enough XKR in your wallet. Use !balance for more information.");
          })


    }

      if (msg.content.startsWith('!tipall')) {

          console.log('TipAll command activated');
          let allBanks = bank.wallets;
          command = msg.content.split(' ');
          amount = command[1]/(allBanks.length-1);
          sender_wallet = getUserBank(msg.author.id);
          walletd
              .getBalance(sender_wallet)
              .then(resp => {
                  console.log(resp.status)
                  console.log(resp.headers)
                  console.log(resp.body)

                  balance = resp.body.result.availableBalance / 100000;

                  locked = resp.body.result.lockedAmount / 100000;

                  if (balance < amount*(allBanks.length-1)) {
                      msg.reply('Sorry you don\'t have enough XKR in your wallet. Use !balance for more information.')
                      return;
                  }

              })
              .catch(err => {
                  console.log(err)
              })

          if ( command[2] ) {
              msg.reply('Too many arguments!');
              return;
          }


          for (i in allBanks) {
              receiver_wallet = allBanks[i].wallet;
              if (receiver_wallet == sender_wallet) {
                  continue;
              }

              walletd
                  .sendTransaction(0, [{
                      "address": receiver_wallet,
                      "amount": parseInt(amount * 100000)
                  }], 10, [sender_wallet])
                  .then(resp => {
                      console.log(resp.status)
                      console.log(resp.headers)
                      console.log(resp.body)
			client.users.get(allBanks[i].user).send("You were just sent " + parseInt(amount) + " XKR!");

                      // sender_wallet = resp.body.result.address;

                      msg.react("💸");



                  })
                  .catch(err => {
                      console.log(err)
                      msg.author.send("Sorry you don't have enough XKR in your wallet. Use !balance for more information.");
                      return;
                  })

          }
          msg.reply(amount + ' XKR sent to ' + (allBanks.length-1) + ' people.');




      }

  if (msg.content.startsWith('!send')) {

    console.log('Send command activated');

    sender_wallet = getUserBank(msg.author.id);
    command = msg.content.split(' ');
  	receiver_address = command[1];
    amount = command[2];

    if ( command[3] ) {
      msg.reply('Too many arguments!');
      return;
    }

    if ( receiver_address.length != 99 || !receiver_address.startsWith('SEKR') ) {
      msg.reply('Sorry, address is invalid.')
      return;
    }

    walletd
            .sendTransaction(0,[{"address":receiver_address,"amount":parseInt(amount)*100000}],10,[sender_wallet])
            .then(resp => {
              console.log(resp.status)
              console.log(resp.headers)
              console.log(resp.body)

              sender_wallet = resp.body.result.address;

  	    msg.react("💸");


            })
            .catch(err => {
              console.log(err)
  		msg.author.send("Sorry you don't have enough XKR in your wallet. Use !balance for more information.");
            })


  }

  if (msg.content.startsWith('!status') ) {

	http.get('http://localhost:11898/getinfo', (resp) => {
  let data = '';

  let totalSupp = 0;

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
	  console.log(data);
	  json_node = JSON.parse(data);

  fetch(api, settings)
    .then(res => res.json())
    .then((jsonapi) => {
        // do something with JSON
        console.log(json_node.height);

        fetch('http://localhost:11898/json_rpc', {
            method: 'POST',
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: "test",
              method: "getblockheaderbyheight",
              params: {
                height: json_node.height - 1
              }
            }),
            headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json())
          .then(

            json => {

                fetch('http://localhost:11898/json_rpc', {
                    method: 'POST',
                    body: JSON.stringify({
                      jsonrpc: "2.0",
                      id: "test",
                      method: "f_block_json",
                      params: {
                        hash: json.result.block_header.hash
                      }
                    }),
                    headers: { 'Content-Type': 'application/json' }
                }).then(res => res.json())
                  .then(
                    jsonn => {

                      fetch('https://api.coingecko.com/api/v3/simple/price?ids=kryptokrona&vs_currencies=usd', {
                          method: 'GET'
                      }).then(res => res.json())
                        .then(
                          jsongecko => {

                            let  xkrprice = 0;
				xkrprice = jsongecko.kryptokrona.usd;



                        let marketCap = parseFloat(xkrprice * parseInt(jsonn.result.block.alreadyGeneratedCoins) / 100000).toFixed(2);

                            const embed = {
                              "title": "KRYPTOKRONA STATUS",
                              "description": "This is live information about the kryptokrona network",
                              "color": 12525523,
                              "footer": {
                                "icon_url": "https://old.kryptokrona.se/wp-content/uploads/2019/04/logo-white-shadow.png",
                                "text": "Type !help for more commands."
                              },
                              "thumbnail": {
                                "url": "https://old.kryptokrona.se/wp-content/uploads/2019/04/logo-white-shadow.png"
                              },
                              "fields": [
                                {
                                  "name": "⛏️",
                                  "value": "Hashrate: " + json_node.hashrate + ' h/s',
                                  "inline": true
                                },
                                {
                                  "name": "📦",
                                  "value": "Blockheight: " + json_node.height,
                                  "inline": true
                                },
                                {
                                  "name": "📈",
                                  "value": "Current price: $" + xkrprice
                                },
                                {
                                  "name": "Market cap:",
                                  "value": "$" + marketCap
                                }
                              ]
                            };


                            msg.reply({ embed });

                            });

                          });


            }





        );


    });



  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    console.log(JSON.parse(data).explanation);
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});

  }
  if (msg.content.startsWith('!balance') ||  msg.content.startsWith('!bal')) {
	user_bank = getUserBank(msg.author.id);
	console.log(user_bank);
	if(!user_bank){
		msg.reply("You don't have a wallet yet! Use !register to get one.");
		return;
	}

	 walletd
          .getBalance(user_bank)
          .then(resp => {
            console.log(resp.status)
            console.log(resp.headers)
            console.log(resp.body)

            balance = resp.body.result.availableBalance / 100000;

	    locked = resp.body.result.lockedAmount / 100000;

	    msg.author.send("Your current balance is: " + balance + " XKR (" + locked + " pending). To top it up, send more to " + user_bank);

          })
          .catch(err => {
            console.log(err)
          })



}
  
client.on('messageReactionAdd', async (reaction, user) => {
    
  let applyRole = async () => {
      let emojiName = reaction.emoji.name;
      let role = reaction.message.guild.roles.find(role => role.name.toLowerCase() === emojiName.toLowerCase());
      let member = reaction.message.guild.members.find(member => member.id === user.id);
      try {
          if(role && member) {
              console.log("Role and member found.");
              await member.roles.add(role);
              console.log("Done.");
          }
      }
      catch(err) {
          console.log(err);
      }
  }
  if(reaction.message.partial)
  {
      try {
          let msg = await reaction.message.fetch(); 
          console.log(msg.id);
          if(msg.id === '780140846976073779')
          {
              console.log("Cached")
              applyRole('679336450973761568');
          }
      }
      catch(err) {
          console.log(err);
      }
  }
  else 
  {
      console.log("Not a partial.");
      if(reaction.message.id === '780140846976073779') {
          console.log(true);
          applyRole('679336450973761568');
      }
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  let removeRole = async () => {
      let emojiName = reaction.emoji.name;
      let role = reaction.message.guild.roles.find(role => role.name.toLowerCase() === emojiName.toLowerCase());
      let member = reaction.message.guild.members.find(member => member.id === user.id);
      try {
          if(role && member) {
              console.log("Role and member found.");
              await member.roles.remove(role);
              console.log("Done.");
          }
      }
      catch(err) {
          console.log(err);
      }
  }
  if(reaction.message.partial)
  {
      try {
          let msg = await reaction.message.fetch(); 
          console.log(msg.id);
          if(msg.id === '780140846976073779')
          {
              console.log("Cached")
              removeRole('679336450973761568');
          }
      }
      catch(err) {
          console.log(err);
      }
  }
  else 
  {
      console.log("Not a partial.");
      if(reaction.message.id === '780140846976073779') {
          console.log(true);
          removeRole('679336450973761568');
      }
  }
})


});

client.login(config.discordToken);

walletd
  .getStatus()
  .then(resp => {
    console.log(resp.status)
    console.log(resp.headers)
    console.log(resp.body)
  })
  .catch(err => {
    console.log(err)
  })
