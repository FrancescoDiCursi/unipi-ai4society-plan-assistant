


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.msg === "storage updated") {
        //check
        chrome.storage.local.get("targetted_groups").then(val=>{
            if(val["targetted_groups"]===undefined){
                chrome.storage.local.set({"all_courses":message.data,"personal_courses":[], "targetted_groups":[] }) 
            }else{
                chrome.storage.local.set({"all_courses":message.data,"personal_courses":[], "targetted_groups":[] }) 
            }
        })
    }else if(message.msg === "personal list updated"){
        chrome.storage.local.set({"personal_courses":message.data})
    }
    
    else {
        // alert(message.data);
    }
});