const LocalStrategy = require("passport-local");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const config = passport => {
    const prisma = new PrismaClient();
    // 認証処理の実装
    passport.use(new LocalStrategy(
        { usernameField: "name", passwordField: "pass", },
        async (username, password, cb) => {
            try {
                const user = await prisma.user.findUnique({
                    where: { name: username }
                });
                if (!user) {
                    return cb(null, false, { message: "ユーザ名かパスワードが違います" });
                }
                const isPasswordVaild = await bcrypt.compare(password, user.password)
                if (!isPasswordVaild) {
                    return cb(null, false, { message: "ユーザ名かパスワードが違います" });
                }
                // ユーザもパスワードも正しい場合
                return cb(null, user);
            } catch (e) {
                return cb(e);
            }
        }
    ));

    // // ユーザ情報をセッションに保存するルールの定義
    passport.serializeUser((user, done) => {
        process.nextTick(() => {
            done(null, { id: user.id, name: user.name });
        });
    });

    // // セッションからユーザ情報を復元するルールの定義
    passport.deserializeUser((user, done) => {
        process.nextTick(() => {
            return done(null, user);
        });
    });

    return (req, res, next) => {
        next();
    }
}

module.exports = config;
