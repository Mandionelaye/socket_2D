const io = require("socket.io")(8900, {
    cors:{
        origin:"http://localhost:3000",
        origin:"http://localhost:8100"
    }
});

let users = [];
 
let mgsuser = [];
const addUser = (userId, socketId)=>{
    !users.some((user)=> user.userId === userId) &&
    users.push({userId,socketId});
}
const addUsermsg = (userId, socketId)=>{
    !mgsuser.some((user)=> user.userId === userId) &&
    mgsuser.push({userId,socketId});
}

const removeUser = (socketId) =>{
    users = users.filter((user) => user.socketId !== socketId);
}
const removeUsermsg= (socketId) =>{
    mgsuser = mgsuser.filter((user) => user.socketId !== socketId);
}

const getUser = (userId) =>{
    return users.find((user) => user.userId === userId)
}

const getUsermsg = (userId) =>{
    return mgsuser.find((user) => user.userId === userId)
}

 //user connecte
io.on("connection", (socket) => {
    console.log("a user connected");
    //take userId and socketId from user
    socket.on("addUser", userId=>{
     addUser(userId, socket.id);
     io.emit("getUsers", users)
    })

    socket.on("addUsernav", userId=>{
        addUsermsg(userId, socket.id);
       })

    //send and get message
    socket.on("sendMessage", ({photo, photop, senderId, receiverId, text})=>{
        const user = getUser(receiverId);
        const userms = getUsermsg(receiverId);
        if(user){
            io.to(user.socketId).emit("getMessage", {
                photop:photop,
                senderId:[{_id:senderId, photo:photo}],
                text,
            })
        }
        if(userms){
            io.to(userms.socketId).emit("getNoctification", {
                senderId:[{_id:senderId, photo:photo}],
                text,
            })
        }else{console.log("nnnn")}
    })



//user disconnect
socket.on("disconnect", () => {
    console.log("a user disconnected");
    removeUser(socket.id);
    removeUsermsg(socket.id);
    io.emit("getUsers", users);
})

})