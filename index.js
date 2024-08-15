const express=require("express");
const app=express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const connect=require("./config/db-config");
const Group = require("./models/group");
const Chat=require("./models/chat");

app.set('view engine','ejs');

app.use(express.json());
app.use(express.urlencoded({extended:true}))


app.get('/chat/:roomid/:user',async (req,res)=>{
  const { roomid, user } = req.params;
  const group = await Group.findById(roomid);
  
  if (!group) {
    return res.status(404).send('Group not found.');
  }

  if (group.isPersonal) {
    if (!group.users.includes(user)) {
      return res.status(403).send('You are not allowed to join this private group.');
    }
  }

  const chats = await Chat.find({ roomid });
  res.render('index', { roomid, user, groupname: group.name, previousmsgs: chats });
})

app.get("/group",async (req,res)=>{
    res.render("group")
})

app.post("/group", async (req, res) => {
  try {
    const { name, users } = req.body;

    // Convert comma-separated users string to an array
    const userArray = users ? users.split(',').map(user => user.trim()) : [];

    // Determine if the group is private
    const isPersonal = userArray.length === 2;

    // Create the group
    const group = await Group.create({
      name,
      isPersonal, // Set as private if exactly two users
      users: isPersonal ? userArray : [] // Set users list if private
    });

    res.redirect("/group");
  } catch (err) {
    console.error('Error creating group:', err);
    res.status(500).send('Internal Server Error');
  }
});




io.on('connection', (socket) => {
    console.log('a user connected',socket.id);
    socket.on('disconnect', () => {
        console.log('user disconnected',socket.id);
      });
   

      socket.on('join_room', async (data) => {
        try {
            const { roomid, user } = data;
            const group = await Group.findById(roomid);

            if (!group) {
                return socket.emit('error', 'Group not found.');
            }

            if (group.isPersonal && !group.users.includes(user)) {
                return socket.emit('error', 'You are not allowed to join this group.');
            }

            socket.join(roomid);
            console.log(`User ${user} joined room ${roomid}`);
        } catch (error) {
            console.error('Error joining room:', error);
            socket.emit('error', 'An error occurred while joining the room.');
        }
    });



    socket.on("new_msg",async (data)=>{
     
        const chat=await Chat.create({
          roomid:data.roomid,
          sender:data.sender,
          content:data.message
        })
        io.to(data.roomid).emit('msg_rcvd',data);

    })
    
  });
server.listen(3000, () => {
    console.log('listening on *:3000');
  });