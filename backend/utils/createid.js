module.exports = async () =>new Promise((resolve, reject) => {
    let length=0;
    const char1="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let userId="";
    while(length<3){
        const randomIndex=Math.floor(Math.random()*char1.length);
        userId+=char1[randomIndex];
        length++;
    }
    userId = Date.now().toString().slice(-3)+userId+Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    resolve(userId);
});
