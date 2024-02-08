const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const pagesize = 3

const loginCheck = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "unauthenticated" })
    }
    next();
};

router.post("/create", loginCheck, async (req, res) => {
    const { text } = req.body;
    try {
        const newMessage = await prisma.message.create({
            data: {
                accountId: req.user.id,
                text
            }
        });
        return res.status(201).json({ message: "Created!", newMessage })
    } catch (e) {
        return res.status(403).json({ message: e })
    }
})

router.get("/read", loginCheck, async (req, res, next) => {
    try {
        const page = req.query.page ? req.query.page : 1;
        const skip = pagesize * (page - 1);
        const totalCount = await prisma.message.count();
        const messages = await prisma.message.findMany({
            skip,
            take: pagesize,
            orderBy: [
                { createdAt: "desc" }
            ],
            include: {
                account: true
            }
        });
        return res.status(200).json({ message: "OK", messages, totalCount })
    } catch (e) {
        return res.status(400).json({ message: e })
    }
})

router.get("/:uid/read", loginCheck, async (req, res, next) => {
    try {
        const uid = +req.params.uid;
        const page = req.query.page ? req.query.page : 1;
        const skip = pagesize * (page - 1);
        const totalCount = await prisma.message.count({
            where: { accountId: uid },
        });
        const messages = await prisma.message.findMany({
            where: { accountId: uid },
            skip,
            take: pagesize,
            orderBy: [
                { createdAt: "desc" }
            ],
            include: {
                account: true
            }
        });

        const user = await prisma.user.findUnique({
            where: { id: uid },
            select: {
                id: true,
                name: true
            }
        });
        return res.status(200).json({ message: "OK", messages, user, totalCount })
    } catch (e) {
        return res.status(400).json({ message: e })
    }
})

module.exports = router