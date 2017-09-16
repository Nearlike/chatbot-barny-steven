var restify = require('restify');
var botbuilder = require('botbuilder');

// restify server setup
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3987, function(){
    console.log(`${server.name} bot started at ${server.url}`);
});

// create chat connector
var connector = new botbuilder.ChatConnector({
    appId: process.env.APP_ID,
    appPassword: process.env.APP_SECRET
});

// listening for user inputs
server.post('/api/messages', connector.listen());

// reply by echoing
var bot = new botbuilder.UniversalBot(connector, [
    function(session) {
        session.beginDialog('test');
        bot.on('typing', function(response) {
            session.send(response); // Rajouter cette ligne corrige le Bug de messages dupliqués
            session.send("ah tu es encore en train de taper..");
        });
        bot.on('conversationUpdate', function(message) {
            if(message.membersAdded && message.membersAdded.length > 0) {
                var membersAdded = message.membersAdded.map(function (x) {
                    var isSelf = x.id === message.address.bot.id;
                    return (isSelf ? message.address.bot.name : x.name) || ' ' + 'Id = ' + x.id + ')'
                }).join(', ');
                bot.send(new botbuilder.Message()
                    .address(message.address)
                    .text('Bienvenue' + membersAdded)
                );
            }
        });
    },
    function(session, results) {
        session.endConversation("A une prochaine !");
    }
]);

bot.dialog('test', [
    function(session) {
        botbuilder.Prompts.text(session, 'Perroquet :');
    },
    (session, results) => {
        session.endDialog(`"${results.response} !"`);
    }
]);

