module.exports=async ()=>new Promise((resolve,reject)=>{
    let length=0;
    const char1="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let uniqueId="";
    while(length<3){
        const randomIndex=Math.floor(Math.random()*char1.length);
        uniqueId+=char1[randomIndex];
        length++;
    }
    uniqueId = Date.now().toString().slice(-2)+uniqueId+Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    resolve(uniqueId);
})