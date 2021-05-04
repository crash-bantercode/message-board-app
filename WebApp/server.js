var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

app.use(express.static(__dirname))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

mongoose.Promise = Promise

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

app.post('/messages', async (req, res) => {

    try {
        var message = new Message(req.body)
        var savedMessage = await message.save()

        console.log('saved.')
        var censored = await Message.findOne({ message: 'celery' })

        if (censored) {
            await Message.deleteOne({ _id: censored.id })
        } else {
            io.emit('message', req.body)
        }

        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(500)
        return console.error(error)
    } finally {
        console.log('Message posted.')
    }




})

io.on('connection', (socket) => {
    console.log('User connected.')
})

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    console.log('MongoDB connection.', err)
})

var server = http.listen(3000, () => {
    console.log('Listening on port', server.address().port)
})