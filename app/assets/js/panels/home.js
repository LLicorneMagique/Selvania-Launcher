const { MCLaunch } = require('emc-core-luuxis');
const launcher = new MCLaunch();
const msmc = require("msmc");
const dataDirectory = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME)
const { auth, config } = require('./assets/js/utils.js');
const win = nw.Window.get();
let newsForm = document.querySelector(".news")



config.news().then(config => {
    for (let i = 0; i < config.news.length; i++) {
        var newsTitle = config.news[i].title
        var newsBody = config.news[i].body
        var newsImage = config.news[i].img
        var newsAuthor = config.news[i].author
        var newsDate = config.news[i].date
        
        if (newsImage === "") {
            newsForm.innerHTML += 
            `<div class="newsTitle">${newsTitle}</div>
            <div class="newsBody">${newsBody}</div>
            <div class="newsAuthor">${newsAuthor}</div>
            <div class="newsDate">${newsDate}</div>`
        } else {
            newsForm.innerHTML += 
            `<div class="newsTitle">${newsTitle}</div>
            <div class="newsBody">${newsBody}</div>
            <img class="newsImage" src="${newsImage}">
            <div class="newsAuthor">${newsAuthor}</div>
            <div class="newsDate">${newsDate}</div>`
        }
    }
})

document.querySelector(".play-btn").addEventListener("click", () => {
    document.querySelector(".play-btn").disabled = true
    config.config().then(config => {
        const login = require(dataDirectory + "/" + config.dataDirectory + "/config.json")
        
        if(["win32"].includes(process.platform)){
            var java = "/bin/java.exe"
        } else if(["darwin"].includes(process.platform)){
            var java = "/Contents/Home/bin/java"
        } else if(["linux"].includes(process.platform)){
            var java = "/bin/java"
        }

        if ((config.forge_version) == ""){
            var version = config.game_version
        } else {
            var version = config.forge_version
        }

        if(login.Settings.Java.Directory === null){
            var Java = `${dataDirectory}/${config.dataDirectory}/runtime/java${java}`
        } else {
            var Java = login.Settings.Java.Directory
        }

        if(auth.user == undefined){
            if(login.Login.UserConnect == "Microsoft"){
                var authenticator = msmc.getMCLC().getAuth(login.Login.Account.Microsoft.User)
            } else if(login.Login.UserConnect == "Mojang"){
                var authenticator = login.Login.Account.Mojang.User
            } else if(login.Login.UserConnect == "Crack") {
                var authenticator = login.Login.Account.Crack.User 
            }
        } else {
            var authenticator = auth.user
        }
        
        let opts = {
            url: config.game_url,
            overrides: {
                detached: false
            },
            authorization: authenticator,
            root: `${dataDirectory}/${config.dataDirectory}`,
            javaPath: Java,
            version: config.game_version,
            forge: version,
            checkFiles: true,
            memory: {
                max: `${login.Settings.Java.RamMax}M`,
                min: `${login.Settings.Java.RamMin}M`
            }
        }

        launcher.launch(opts);
        
        launcher.on('debug', (e) => {
            console.log("[DEBUG]" + e)
        })

        launcher.on('data', (e) => {
            console.log("[DATA]" + e)
        })

        launcher.on('error', (e) => {
            console.log("[ERROR]" + e)
        })

        launcher.on('verification-status', (e) => {
            console.log("[V\u00e9rification][emc-core-luuxis]: " + e.name + " (" + e.current + "/" + e.total + ")")
        })

        launcher.on('download-status', (e) => {
            console.log("[DOWNLOAD][emc-core-luuxis]: [" + e.type + "] " + e.name + " (" + e.downloadedBytes + "/" + e.bytesToDownload + ")")
        })

        launcher.on('launch', (e) => {
            // win.hide();
        });
        
        launcher.on('close', (e) => {
            // win.show();
            // win.focus();
            // win.setShowInTaskbar(true);
            document.querySelector(".play-btn").disabled = false
        });
    })
})

document.querySelector(".settings-btn").addEventListener("click", () => {
    changePanel("home", "settings")
})