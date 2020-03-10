var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var kafka = require('kafka-node');
var Consumer = kafka.Consumer;

var lastOffset = 0;
var lastValue = 0;

client = new kafka.KafkaClient({
    kafkaHost:'localhost:9092'
});

var offset = new kafka.Offset(client);

//find the last offset then launch the server
offset.fetch([
        { topic: 'BTC', partition: 0, time: -1, maxNum: 1 }
    ], function (err, data) {

        //get last offset
        console.log(data)
        lastOffset = data['BTC']['0'] -1
        console.log(lastOffset)

        //create consumer which
        //auto commits
        //start from last offset -1
        consumer = new Consumer (
            client,
            [{topic: 'BTC', partition: 0, offset: lastOffset}],
            {
                autoCommit: true,
                fromOffset: true
            }
        );

        app.use('/static', express.static(__dirname + '/public'));

        //https endpoint
        app.get('/', function(req, res){
          res.sendFile(__dirname + '/public/index.html');
        });

        app.get('/blabla', function(req, res) {
            res.send("hello!")
        })

        //ws endpoint
        io.on('connection', function(socket){

          console.log('a user connected');

          socket.emit('hello-message', 'You\'re connected!')
          socket.emit('init-value', lastValue)

          socket.on('disconnect', function(){
            console.log('user disconnected');
          });
        });

        //consumer event
        //stores last value
        consumer.on('message', function(msg){
                lastValue = msg.value
                console.log("Kafka msg : " + lastValue)
                io.emit('new-value', lastValue)
            }
        );

        //listen on localhost:3000
        http.listen(3000, function(){
          console.log('listening on *:3000');
        });
    });
