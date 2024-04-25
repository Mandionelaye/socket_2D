const io = require("socket.io")(8900, {
    cors:{
        origin:"http://localhost:3000",
        origin:"http://localhost:8100"
    }
});

let users = [];

let mgsuser = [];
  
//pour ajouter les users qui sont connecter
const addUser = (userId, socketId) => {
    !users.some(user => user.userId === userId) &&
    users.push({userId,socketId});

}

//pour ajoute d'un user 
const addUserMessage = (userId, socketId) => {
    !mgsuser.some(user => user.userId === userId) &&
    mgsuser.push({userId,socketId});
}
 
//pour supprimer un user deconnecter du table users
const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
}

//pour supprimer un user du table mgsuser
const removeUsermsg = (socketId) => {
    mgsuser = mgsuser.filter(user => user.socketId !== socketId);
}

// afficher un user en linge
const getUser = (userId) =>{
    return users.find(user => user.userId === userId);
}

// afficher un user en linge
const getUsermsg = (userId) =>{
    return mgsuser.find(user => user.userId === userId);
}

// utilisation de socket.io pour la connection, deconnection, envoie de message en live
io.on("connection", (socket) => {
    console.log("un user c'est connecter");
    console.log(users);
//pour Connection User

    //je creer un evenement pour recevoir un user connecter et l'ajoute au table users
    socket.on("addUser", userId =>{
        addUser(userId, socket.id);
        console.table(users);
        //revois le tableau users
        io.emit("getUsers", users)
    })
    //ajouter le user au tableau mgsusrs c'est pour les notifications
    socket.on("addUsernav", userId=>{
        addUserMessage(userId, socket.id);
       })
       
//Pour les messages
    //envoie et reception de message
    //creer un evenement pour recupere le mssg envoyer
    socket.on("sendMessage", ({_id,photo, senderId, receveurId, text,conid})=>{
        //recupere id du receveur
        console.log("envoie");
        const user = getUser(receveurId);
        const userms = getUsermsg(receveurId);
        console.log(user);
        if(user){
            //on envoie le message au recepteur avec un condition
            io.to(user.socketId).emit("getMessage", {
                _id, photo, senderId:[{_id:senderId}], text ,conid
            })

            console.log("uk");
        }
        // pour le web
        console.log(userms);
        if(userms){
            io.to(userms.socketId).emit("getNoctification", {
                senderId:[{_id:senderId, photo:photo}],
                text,
            })
        }else{console.log("nnnn")}
       
    })

    //Pour Notification
    socket.on("sendNmbMssg", ({number, userId})=>{
        const usermsg = getUsermsg(userId);
        console.log('c fait :>> ', usermsg);
         //la meme chose pour les notifications 
         if(usermsg){
            io.to(usermsg.socketId).emit("getNumberNotif", {
                number,userId
            })
            console.log('c fait :>> ');
        }
    })

    //pour la deconnection des users
    socket.on("disconnect", ()=>{
        console.log("user deconnecter");
        removeUser(socket.id);
        removeUsermsg(socket.id);
        //renvoie le table users apres une deconnnection
        io.emit("getUsers", users);
    })
}) 