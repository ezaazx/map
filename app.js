const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const server = http.createServer(app);
const io = socketio(server);


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.render('index'); 
});


io.on('connection', (socket) => {
  socket.on('send-location', (data) => {
    io.emit('receive-location', { id: socket.id, ...data });
  });

  socket.on('disconnect', () => {
    io.emit('user-disconnected', socket.id);
  });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
