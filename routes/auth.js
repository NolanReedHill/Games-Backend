const express = require("express");
const router = express.Router();
const { StreamChat } = require("stream-chat");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const api_key = process.env.api_key;
const api_secret = process.env.api_secret;
const serverClient = new StreamChat.getInstance(api_key, api_secret);

router.post("/signup", async (req, res) => {
    try {
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const username = req.body.username;
        const password = req.body.password;
        const userId = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);
        const token = serverClient.createToken(userId);
        res.json({ token: token, userId: userId, firstName: firstName, lastName: lastName, username: username, hashedPassword: hashedPassword });
    } catch (error) {
        res.json(error);
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(username + ", " + password)
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