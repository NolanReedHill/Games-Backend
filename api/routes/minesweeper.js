const express = require("express");
const router = express.Router();
const db = require("./firebase");
const { getDocs, collection, addDoc } = require("firebase/firestore");

router.get("/get-leaderboard", async (req, res) => {
    const allLeaderboardData = []
    const entries = await getDocs(collection(db, "minesweeperLeaderboard"));
    entries.forEach((entry) => {
        let data = entry.data();
        allLeaderboardData.push({
            name: data.name,
            time: data.time,
            date: data.date,
        });
    });
    const sortedData = allLeaderboardData.sort((a, b) => {
        return a.time < b.time ? 1 : -1;
    })
    res.json({ sortedData });
})

router.post("/post-to-leaderboard", async (req, res) => {
    const date = new Date();
    await addDoc(collection(db, "minesweeperLeaderboard"), {
        name: req.body.name,
        time: req.body.time,
        date: date
    })
        .then(res.sendStatus(200))
        .catch(error => res.status(500).json({ error }))
})

module.exports = router;