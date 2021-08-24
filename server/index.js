const keys = require('./keys')

// express setup
const express = require('express');
const cors = require('cors')

const app = express()
app.use(cors());
app.use(express.json());

// Postgres setup
const {Pool} = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    port: keys.pgPort,
    database: keys.pgDatabase,
    password: keys.pgPassword
})

pgClient.on("connect", (client) => {
    client
      .query("CREATE TABLE IF NOT EXISTS values (number INT)")
      .catch((err) => console.error(err));
});

// Redis setup
const redis = require('redis')

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
})

const redisPublisher = redisClient.duplicate();

// Express Route Handlers
app.get('/', (req, res) => {
    res.send('Hi There!');
})

app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * FROM values');
    
    if(values){
        res.status(200).json({
            values: values.rows
        })
    }
})

app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.status(200).json({
            values
        })
    })
})

app.post('/values', async (req, res) => {
    const index = req.body.index;

    if(parseInt(index) > 40){
        return res.status(422).json({
            stauts: 'error',
            message: 'Index must be a number lower than 40'
        })
    }

    redisClient.hset('values', index, 'nothing yet!');
    redisPublisher.publish('insert', index);
    pgClient.query('INSERT INTO values(number) VALUES ($1)', [index]);

    res.send({working: true});

})


app.listen(5000, () => {
    console.log('listening on port 5000');
})