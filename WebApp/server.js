var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

app.use(express.static(__dirname))
app.use(express.json())
app.use(express.urlencoded({extended: false}))

var dbUrl = 'mongodb+srv://beany:beany@cluster-bean.ty5mc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

var Message = mongoose.model('Message', {
    name: String,
    message: String
})

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages)
    })
})

app.post('/messages', (req, res) => {
    var message = new Message(req.body)    
    message.save().then(() => {
        Message.findOne({message: "fuck"}, (err, censored) => {
            if (censored)
                console.log("Found censored word.")
                Message.remove({_id: censored.id}, (err) => {
                    console.log("Removed censored word.")
                })
        })
        io.emit('message', req.body)
        res.sendStatus(200)
    }).catch((err) => {
        res.sendStatus(500)
    })
})

io.on('connection', (socket) => {
    console.log('User connected.')
})

mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
    console.log('MongoDB connection.', err)
})

var server = http.listen(3000, () => {
    console.log('Listening on port', server.address().port)
})