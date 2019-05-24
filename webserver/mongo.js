/*------------------------------------------------------------
    DATABASE INITIALIZATION
------------------------------------------------------------*/
// Database is not a MySQL.
// It's mongo DB
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true)
mongoose.connect('mongodb://localhost:27017/logger', {useNewUrlParser: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, '[-] Connection Error Occured:'));
db.once('open', function() {
  console.log("[+] MongoDB Database connection has been initialized!")
});

const categoryText = {
    "일반": 3,
    "연결": 4,
    "데미지": 5,
    "명령어": 29,
    "캐릭터": 30,
    "아이템": 31,
    "경제": 32,
    "채팅": 33,
    "범죄": 34,
    "법": 35,
    "맵": 36,
    "WEB": 98,
    "관리자": 99,
}
const logModel = mongoose.model('Log', {
    information: [
        {
            ip: String,
            jobName: String,
            name: String,
            steamID: String,
            steamname: String,
        }
    ],
    category: Number,
    message: String,
    name: String,
    steamID: String,
    jobName: String,
    date: {
        type: Date,
        default: Date.now
    },
});
const newInfo = (steamID, adminID) => {
    return {
        ip: "WEB",
        steamname: adminID,
        jobName: "-",
        name: "WEB",
        steamID: steamID
    }
}
const saveLog = (information, category, message) => {
    const newLogRow = new logModel({
        information: information,
        category: category,
        message: message,
    });
    newLogRow.save().catch((error) => {
        console.log('[MGDB_LOG] aw what the fuck')
        console.log(error)
    });
}
module.exports.saveLog = saveLog
module.exports.loadLog = (index, filter) => {
    const page = index || 0
    const perPage = 50
    let query = undefined
    
    if (filter.search) {
        /*
            TYPE 00: 메세지
            TYPE 01: SteamID
            TYPE 02: Character Name
            TYPE 03: Category
            TYPE 04: Time
        */
        if (filter.type == 0) {
            query = {"message": new RegExp(filter.search, 'gi')}
        } else if (filter.type == 1) {
            query = {"information": {$elemMatch: {"steamID": new RegExp(filter.search, 'gi')}}}
        } else if (filter.type == 2) {
            query = {"information": {$elemMatch: {"name": new RegExp(filter.search, 'gi')}}}
        } else if (filter.type == 3) {
            query = {"category": categoryText[filter.search]}
        } else if (filter.type == 4) {
            query = {"date": new RegExp(filter.search, 'gi')}
        }
    }

    console.log(query)
    return logModel.find(query).sort({$natural:-1}).skip(page * perPage).limit(perPage);
}


const assholeModel = mongoose.model('Asshole', {
    steamID: {
        type: String,
        index: true,
        unique: true,
        required: true
    },// who got banned
    adminID: String, // who was the admin
    reason: String, // why banned
    lastName: String, // why banned
    date: { // when banned
        type: Date,
        default: Date.now
    },
    duration: String, // gmod friendly time.
    durationActual: String, // written time .
});
const getBan = (steamID64) => {
    return assholeModel.find({steamID: steamID64})
}
module.exports.saveBan = (steamID, adminID, time, actualTime, reason, lastName, fromServer) => {
    return new Promise((resolve, reject) => {
        getBan(steamID).deleteMany().exec() // crawling in my skin
        
        const newAsshole = new assholeModel({
            steamID: steamID,
            adminID: adminID,
            reason: reason,
            duration: time,
            lastName: lastName,
            durationActual: actualTime
        });
        newAsshole.save().then(mongoResponse => {
            if (!fromServer) {
                resolve(mongoResponse)
            } else {
                commandReply("banPlayer", JSON.stringify({
                    s: steamID,
                    a: adminID,
                    r: reason,
                    d: actualTime
                })).then(serverResponse => {
                    saveLog(newInfo(steamID, adminID), 99, `제한모드를 시작함. (${adminID} >> ${reason})`)
                    resolve(mongoResponse, serverResponse)
                }).catch(error => {
                    reject(error)
                })
            }
        }).catch((error) => {
            reject(error)
        });
    })
}
module.exports.removeBan = (steamID, adminID) => {
    return new Promise((resolve, reject) => {
        getBan(steamID).deleteMany().exec().then(mongoResponse => {
            commandReply("unbanPlayer", JSON.stringify({
                s: steamID,
                a: adminID
            })).then(serverResponse => {
                saveLog(newInfo(steamID, adminID), 99, `제한 모드 해제. (${adminID})`)
                resolve(mongoResponse, serverResponse)
            }).catch(error => {
                reject(error)
            })
        })
    })
}
module.exports.loadBan = () => {
    return assholeModel.find().sort({$natural:-1});
}
module.exports.getBan = getBan


const commandReply = require('./sockutil').sendCommandToServerReply
const warningDuration = 60 * 60 * 24
const warningModel = mongoose.model('Warning', {
    steamID: {
        type: String,
        required: true
    },// who got banned
    charName: String,
    adminID: String, // who was the admin
    reason: String, // why banned
    date: { // when banned
        type: Date,
        default: Date.now,
        expires: warningDuration
    },
});
module.exports.saveWarning = (steamID64, charName, adminID, reason) => {
    return new Promise((resolve, reject) => {
        const newWarning = new warningModel({
            steamID: steamID64,
            charName: charName,
            adminID: adminID,
            reason: reason,
        });
        newWarning.save().then((mongoResponse) => {
            commandReply("warn", JSON.stringify({
                t: warningDuration,
                s: steamID64,
                a: adminID,
                r: reason
            })).then(serverResponse => {
                saveLog(newInfo(steamID64, adminID), 99, `경고를 받음. (${adminID} >> ${reason})`)
                resolve(mongoResponse, serverResponse)
            }).catch(error => {
                reject(error)
            })
        }).catch((error) => {
            console.log('[MGDB_LOG] aw what the fuck')
            console.log(error)
            reject(error)
        });
    })
}
module.exports.removeWarning = (warningID, adminID) => {
    return new Promise((resolve, reject) => {
        const aWarn = warningModel.find({_id: warningID})
        aWarn.then(warnRecord => {
            warnRecord.forEach(warn => {
                aWarn.deleteOne().exec().then(mongoResponse => {
                    commandReply("unwarn", JSON.stringify({
                        s: warn.steamID,
                        a: adminID
                    })).then(serverResponse => {
                        saveLog(newInfo(warn.steamID, adminID), 99, `경고를 없앰. (${adminID})`)
                        resolve(mongoResponse, serverResponse)
                    }).catch(error => {
                        reject(error)
                    })
                })
            })
        })
    })
}
module.exports.loadWarnings = () => {
    return warningModel.find().sort({$natural:-1});
}
module.exports.getWarnings = (steamID64) => {
    return warningModel.find({steamID: steamID64})
}

module.exports.mongoose = mongoose
module.exports.db = db