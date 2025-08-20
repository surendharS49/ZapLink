module.exports = async () =>new Promise((resolve, reject) => {
    let length=0;
    const char1="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const char2="0123456789";
    let userId="";
    while(length<7){
        if(length<4){
            const randomIndex=Math.floor(Math.random()*char1.length);
            userId+=char1[randomIndex];
        }
        else{
            userId+=char2[Math.floor(Math.random()*char2.length)];
        }
        length++;
    }
    resolve(userId);
});
