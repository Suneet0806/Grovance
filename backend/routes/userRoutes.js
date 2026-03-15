const express = require("express");
const router = express.Router();
const pool = require("../db");

// check college email
function isCollegeEmail(email){
    return email.endsWith(".edu") || email.endsWith(".ac.in");
}


// REGISTER
router.post("/register", async (req,res)=>{

    const { name,email,phone,college } = req.body;

    try{

        if(!isCollegeEmail(email)){
            return res.status(400).json({message:"Please use a valid college email"});
        }

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if(existingUser.rows.length>0){
            return res.status(400).json({message:"User already exists"});
        }

        const newUser = await pool.query(
            "INSERT INTO users(name,email,phone,college) VALUES($1,$2,$3,$4) RETURNING *",
            [name,email,phone,college]
        );

        res.json(newUser.rows[0]);

    }catch(err){
        res.status(500).send(err.message);
    }

});


// LOGIN
router.post("/login", async (req,res)=>{

    const { email,phone } = req.body;

    try{

        const result = await pool.query(
            "SELECT * FROM users WHERE email=$1 AND phone=$2",
            [email,phone]
        );

        if(result.rows.length===0){
            return res.status(401).json({message:"Invalid email or phone"});
        }

        res.json(result.rows[0]);

    }catch(err){
        res.status(500).send(err.message);
    }

});

module.exports = router;
