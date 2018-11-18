const { Router } = require('express')
const { Articles } = require('../db/index') 
const { Comments } = require('../db/index') 
const { Users } = require('../db/index') 
const { Tags} = require('../db/index')
const slugify = require('slugify')

const route = Router()

route.get('/', async(req, res) => {
    try {
        const articles = await Articles.findAll({
            include: [Users, Comments, Tags]
        })
        res.status(200).json({ articles: articles })
    } catch (e) {
        res.status(500).json({ message: 'Error in processing request' })
    }
})

route.post('/', async (req, res) => {
try{    
    const jwtToken = req.header('Authorization')
    console.log(jwtToken)

    const payload = {
        tags: req.body.tags.split(',')
    }


    const user = await Users.findOne({
        where: {
            username: req.body.username
        }
    })

    if (!user) {
        return res.status(400).json({ message: "User not found" })
    }



    if (user.token !== jwtToken) {
        return res.status(401).json({ message: "Authentication failed" })
    }



    const slug = slugify(req.body.title, {
        replacement: '-', // replace spaces with replacement
        remove: null, // regex to remove characters
        lower: true // result in lower case
    })
    console.log(slug)


    const newArticle = await Articles.create({
        slug: slug,
        title: req.body.title,
        description:req.body.description,
        body : req.body.body,
        userId: user.id 
    })

    payload.tags.forEach(async tag => {
        const newTag = await Tags.create({
            name: tag,
            articleId: newArticle.id
        })

    });


res.status(201).json({
    message : 'Article added',
    id: newArticle.id
})
} catch(e) {
    res.status(500).json({message:'Error Accessing the database'})
}

})

route.get('/:slug', async(req, res) => {
    try {
        const articles = await Articles.findAll({
            where: {
                slug: req.params.slug
            }
        })
        res.status(200).json({ articles: articles })
    } catch (e) {
        res.status(500).json({ message: 'Error in processing request' })
    }
})

route.delete('/:slug', async(req, res) => {
    console.log('hii')
    try {
        const article = await Articles.findOne({
            where: {
                slug: req.params.slug
            }
        })

        if (!article) {
            return res.status(404).json({ message: "Article not found" })
        }

        const user = await Users.findOne({
            where: {
                id: article.userId
            }
        })
        const jwtToken = req.header("Authorization")
        if (user.token !== jwtToken) {
            return res.status(401).json({ message: "Authentication failed" })
        }

        const deleted = await Articles.destroy({
            where: {
                slug: req.params.slug
            }
        })
        res.status(200).json({ message: "Article deleted" })
    } catch (e) {
        res.status(500).json(e.errors[0].message)
    }
})

route.put("/:slug", async(req, res) => {
    const jwtToken = req.header("Authorization")
    const article = await Articles.findOne({
        where: {
            slug: req.params.slug
        }
    })
    if (!article) {
        return res.status(400).json({ message: "Article not found" })
    }
    const payload = {}
    payload.username = req.body.username
    if (req.body.title) {
        payload.title = req.body.title
    }
    if (req.body.description) {
        payload.description = req.body.description
    }
    if (req.body.body) {
        payload.body = req.body.body
    }
    if (!req.body.username) {
        return res.status(400).json({ message: "Username must be present" })
    }

    if (payload.title) {
        const slug = slugify(payload.title, {
            replacement: '-', // replace spaces with replacement
            remove: null, // regex to remove characters
            lower: true // result in lower case
        })
        payload.slug = slug
    }

    const user = await Users.findOne({
        where: {
            username: payload.username
        }
    })

    if (!user) {
        return res.status(400).json({ message: "User not found" })
    }

    if (user.token !== jwtToken) {
        return res.status(401).json({ message: "Authentication failed" })
    }
    const updated = await Articles.update(payload, {
        where: {
            slug: req.params.slug
        }
    })

    const updatedArticle = await Articles.findOne({
        where: {
            slug: payload.slug
        }
    })

    if (req.body.tags) {
        payload.tags = req.body.tags.split(',')
    }

    payload.tags.forEach(async tag => {
        const newTag = await Tags.create({
            name: tag,
            articleId: updatedArticle.id
        })

    });

    res.status(201).json({ article: updatedArticle })
})

route.post('/:slug/comments', async(req, res) => {
    const jwtToken = req.header("Authorization")
    const user = await Users.findOne({
        where: {
            token: jwtToken
        }
    })

    if (!user) {
        res.status(404).json({ message: "User not found" })
    }

    const article = await Articles.findOne({
        where: {
            slug: req.params.slug
        }
    })
    if (!article) {
        return res.status(400).json({ message: "Article not found" })
    }

    const newComment = await Comments.create({
        body: req.body.body,
        articleId: article.id,
        userId: user.id
    })

    res.status(200).json({ comment: newComment })

})

route.get('/:slug/comments', async(req, res) => {
    const article = await Articles.findOne({
        where: {
            slug: req.params.slug
        }
    })

    if (!article) {
        return res.status(404).json({ message: "Article not found" })
    }
    const comments = await Comments.findAll({
        include: [Articles, Users],
        where: {
            articleId: article.id
        }
    })
    res.status(200).json({ comments: comments })
})

route.delete('/:slug/comments/:id', async(req, res) => {
    const jwtToken = req.header("Authorization")
    const article = await Articles.findOne({
        where: {
            slug: req.params.slug
        }
    })

    if (!article) {
        return res.status(404).json({ message: "Article not found" })
    }

    const comment = await Comments.findOne({
        where: {
            id: req.params.id,
            articleId: article.id
        }
    })
    if (!comment) {
        return res.status(404).json({ message: "Comment not found" })
    }
    const user = await Users.findOne({
        where: {
            id: comment.userId
        }
    })

    if (user.token !== jwtToken) {
        return res.status(401).json({ message: "Authentication failed" })
    }

    const deleteComment = await Comments.destroy({
        where: {
            id: req.params.id
        }
    })

    res.status(200).json({ message: "Comment deleted" })
})

module.exports = route 