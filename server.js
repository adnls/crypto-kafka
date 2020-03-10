var app = require('express')();
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

offset.fetch([
        { topic: 'BTC', partition: 0, time: -1, maxNum: 1 }
    ], function (err, data) {

        console.log(data)
        lastOffset = data['BTC']['0'] -1
        console.log(lastOffset)

        consumer = new Consumer (
            client,
            [{topic: 'BTC', partition: 0, offset: lastOffset}],
            {
                autoCommit: true,
                fromOffset: true
            }
        );

        app.get('/', function(req, res){
          res.sendFile(__dirname + '/index.html');
        });

        io.on('connection', function(socket){

          console.log('a user connected');

          socket.emit('hello-message', 'You\'re connected!')
          socket.emit('init-value', lastValue)

          socket.on('disconnect', function(){
            console.log('user disconnected');
          });
        });

        consumer.on('message', function(msg){
                lastValue = msg.value
                console.log("Kafka msg : " + lastValue)
                io.emit('new-value', lastValue)
            }
        );

        http.listen(3000, function(){
          console.log('listening on *:3000');
        });
    });
