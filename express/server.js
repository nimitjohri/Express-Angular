const express = require('express')
const {db} = require('./db/index')
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/articles' ,require('./routes/articles'))
app.use('/users',require('./routes/users'))
const cors = require('cors')

app.use(cors());
db.sync({alter: true})
.then(()=>{
    console.log("Databse synced")
    app.listen(3939,()=>{
        console.log("Server started")
    })
})
.catch(console.error)
