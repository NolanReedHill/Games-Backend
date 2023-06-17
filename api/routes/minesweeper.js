const express = require("express");
const router = express.Router();
const db = require("./firebase");
const { getDocs, collection, addDoc } = require("firebase/firestore");
const serviceAccount = require("../permissions.json");

router.get("/get-leaderboard/:collection", async (req, res) => {
    const allLeaderboardData = []
    const entries = await getDocs(collection(db, req.params.collection))
    entries.forEach((entry) => {
        let data = entry.data();
        allLeaderboardData.push({
            name: data.name,
            time: data.time,
            date: data.date,
        });
    });
    const sortedData = allLeaderboardData.sort((a, b) => {
        return a.time > b.time ? 1 : -1;
    })
    sortedData.forEach((data, index) => {
        data.place = index + 1;
    })
    if (sortedData.length === 0)
        res.sendStatus(400);
    res.json({ sortedData });
})

router.post("/post-to-leaderboard", async (req, res) => {
    let temp = "" + serviceAccount.private_key_id;
    if (req.body.auth !== temp) {
        console.log(req.body.auth)
        res.sendStatus(401)
        return;
    }
    const date = new Date();
    await addDoc(collection(db, req.body.collection), {
        name: req.body.name,
        time: req.body.time,
        date: date
    })
        .then(res.sendStatus(200))
        .catch(error => res.status(500).json({ error }))
})

module.exports = router;