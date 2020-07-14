'use strict'

// Application Dependencies
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
app.use( express.json() );
app.use(express.urlencoded({extended:true}));
// Specify a directory for static resources
app.use(express.static('./public'));
// app.use(methodOverride('_method'));

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);

// Set the view engine for server-side templating
app.set('view engine', 'ejs');


// API Routes
app.get('/', getTasks);
app.get('/tasks/:task_id',getOneTask);
app.get('/showTaskForm',showForm);
app.post('/addTask',addTasktoDB);
app.post('/updateTask/:task_id',updateTask);
app.delete('/deleteTask/:task_id',deleteTask);

//localhost:3000/location?city=amman
//localhost:3000/location/amman
//localhost:3000/tasks/1


// HELPER FUNCTIONS
function getTasks(request, response) {
  let SQL = 'SELECT * FROM tasks;';
  client.query(SQL)
  .then (results=>{
    response.render('index',{results:results.rows});
  })
  .catch(error=>errorHandler(error));
}

function getOneTask(req,res){
  let SQL = `SELECT * FROM tasks WHERE id=$1;`;
  let values =[req.params.task_id];
  // console.log(req.params);
  client.query(SQL,values)
  .then(results=>{
    console.log(results.rows);
    res.render('task-details',{task:results.rows[0]});
  })

}

function showForm (req,res) {
  res.render('task-form');
}

function addTasktoDB (req,res) {
  console.log(req.body);
  let {title,description, contact, status, category} = req.body;
  let SQL = `INSERT INTO tasks (title,description, contact, status, category) VALUES ($1,$2,$3,$4,$5);`;
  let values = [title,description,contact,status,category];
  // let values = [req.body.title,req.body.description,req.body.contact,req.body.status,req.body.category];
  client.query(SQL,values)
  .then(()=>{
    res.redirect('/');
    // res.render('index');
  })
}

function updateTask (req,res) {
  let {title,description, contact, status, category} = req.body;
  let SQL = `UPDATE tasks SET title=$1,description=$2,contact=$3, status=$4, category=$5 WHERE id=$6;`;
  let id = req.params.task_id;
  let values=[title,description, contact, status, category,id];
  client.query(SQL,values)
  .then(()=>{
    res.redirect(`/tasks/${id}`)
  })
}

function deleteTask (req,res) {
  let SQL = `DELETE FROM tasks WHERE id=$1;`;
  let values = [req.params.task_id];
  client.query(SQL,values)
  .then (()=>{
    res.redirect('/');
  })
}

app.get('*', (req, res) => {
  res.status(404).send('This route does not exist')
});

function errorHandler(error, request, response) {
  response.status(500).send(error);
}

client.connect()
.then(() => {
  app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
})



