const express = require("express");
const router = express.Router();
const { StreamChat } = require("stream-chat");
const v4 = require("uuid");
const bcrypt = require("bcrypt");

const api_key = process.env.api_key;
const api_secret = process.env.api_secret;
const serverClient = new StreamChat.getInstance(api_key, api_secret);

router.post("/signup", async (req, res) => {
    console.log(req.body)
    try {
        const { firstName, lastName, username, password } = req.body;
        const userId = v4();
        const hashedPassword = await bcrypt.hash(password, 10);
        const token = serverClient.createToken(userId);
        res.json({ token, userId, firstName, lastName, username, hashedPassword });
    } catch (error) {
        res.json(error);
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const { users } = await serverClient.queryUsers({ name: username });
        console.log(users);
        if (users.length === 0)
            return res.json({ message: "User not found" });

        const token = serverClient.createToken(users[0].id);
        const passwordMatch = await bcrypt.compare(
            password,
            users[0].hashedPassword
        );

        if (passwordMatch) {
            res.json({
                token,
                firstName: users[0].firstName,
                lastName: users[0].lastName,
                username,
                userId: users[0].id,
            });
        }
    } catch (error) {
        res.json(error);
    }
});

module.exports = router;