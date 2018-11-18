const Sequelize = require('sequelize')
const DT = Sequelize.DataTypes

module.exports={
    article:{
        slug:{
            type:DT.STRING(500),
            allowNull:false
        },
        title:{ 
            type:DT.STRING(100),
            allowNull:false,
        },
        description:{ 
            type:DT.STRING(200),
            allowNull:false,
        },
        body:{ 
            type:DT.STRING(1000),
            allowNull:false,
        },
        favoritesCount:{
            type:DT.INTEGER,
            default:0
        },
    },
    comment:{
        body:{
            type:DT.STRING(1000),
            allowNull:false
        }
    },
    user:{
        username:{
            type:DT.STRING(50),
            allowNull:false,
            unique:true
        },
        email:{
            type:DT.STRING(100),
            allowNull:false,
            unique:true
        },
        token: {
            type: DT.STRING,
            allowNull: false,
            unique: true,
            required: [true, "cannot be blank"]
        },
        bio:{
            type:DT.STRING(200),
        },
        image:{
            type:DT.STRING(500)
        },
        password:{
            type:DT.STRING(200),
            allowNull:false
        }
    },
    tag: {
        name: {
            type: DT.STRING
        }
    }
}