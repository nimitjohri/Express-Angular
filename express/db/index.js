const Sequelize = require('sequelize')
const{
    article , 
    comment,
    user,
    tag
}=require('./models')
const db = new Sequelize({
    dialect:'sqlite',
    storage: __dirname +'/store1.db'
})

const Articles = db.define('articles',article)
const Comments = db.define('comments',comment)
const Users = db.define('users',user)
const Tags =db.define('tags', tag)

Articles.belongsTo(Users)
Users.hasMany(Articles)

Comments.belongsTo(Articles)
Articles.hasMany(Comments)

Comments.belongsTo(Users)
Users.hasMany(Comments)

Tags.belongsTo(Articles)
Articles.hasMany(Tags)

db.sync()
.then(()=>console.log("Database synced"))
.catch(console.error)

module.exports={
    db,
    Articles,
    Comments,
    Users,
    Tags
}