/* 
   @author - Nagarjuna Yadav K
*/
const https = require('https');
const url = require('url');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const pg_format = require('pg-format');

// create application/json parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//=== Point static path to app 
app.use(express.static(__dirname + '/app'));

//=== Get port from environment and store in Express.
const port = process.env.PORT || 900;
app.listen(port, function() {
    console.log("Server Stated ======= in Port", port);
});

//======== Cors Orgin Request Set ========//
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next();
});

app.options('/*', (req, resp) => {
    resp.end();
})


//=== DB Connection Create ===========//
const { Pool } = require('pg');
var config = {
    user: 'postgres', //=== Postgres user name
    database: 'postgres', //=== Postgres db name
    password: 'postgres', //=== Postgres Password
    host: 'xxx.xxx.xxx.xxx', //=== Your Ip address
    port: 5432,
    max: 20, // max number of clients in the pool
    idleTimeoutMillis: 30000
};
const pool = new Pool(config);

pool.on('error', function(err, client) {
    console.error('Unexpected error on idle client', err.message, err.stack);
});

//====== Proper time zone set for node js(UTC).
//==== For timestamp without time zone ///
var types = require('pg').types;
var timestampOID = 1114;
types.setTypeParser(1114, function(stringValue) {
    return stringValue;
})
//======  This is for only date Field ========//
types.setTypeParser(1082, 'text', function(val) {
    return new Date(val);
});

//========== REST Api's  =============//

//========== get request  =============//
app.get('/get_students', function (req, res, next) {
       pool.query('SELECT * FROM student',function(error, results) {
          if (error) {
                    console.log(error);
                    const { name, routine, code, column, severity, detail } = error;
                    res.status(403).json({ status: false, message: { name, routine, code, column, severity, detail } });
                    return;
                }
           res.status(200).json({status: true, student_list: results.rows});
       });
});

//========== post request  =============//
app.post('/get_student_details', function (req, res, next) {
       const { student_id } = req.body;
       pool.query('SELECT * FROM student where id = $1',[student_id],function(error, results) {
          if (error) {
                    console.log(error);
                    const { name, routine, code, column, severity, detail } = error;
                    res.status(403).json({ status: false, message: { name, routine, code, column, severity, detail } });
                    return;
                }
           res.status(200).json({status: true, student_details: results.rows[0]});
       });
});