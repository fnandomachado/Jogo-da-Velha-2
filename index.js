const express = require("express");
const app = express();

const path = require ("path");
const http = require("http");
const {Server} = require("socket.io");

const server=http.createServer(app);

const io = new Server(server);
app.use(express.static(path.resolve("")));

var bodyParser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();
var DBPATH = 'Players.db';
const db = new sqlite3.Database(DBPATH);

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

let lista =[]
let jogando =[]

io.on("connection", (socket)=>{


    socket.on("find", (e)=> {

        if(e.name!=null){

            lista.push(e.name)

            if(lista.length >= 2) {
                let j1obj ={
                    j1name:lista[0],
                    j1value:"WinRar",
                    j1move:""
                }
                let j2obj ={
                    j2name:lista[1],
                    j2value:"Zip do Windows",
                    j2move:""
                }

                let obj={
                    j1:j1obj,
                    j2:j2obj,
                    sum:1
                }
                jogando.push(obj)

                lista.splice(0,2)

                io.emit("find",{allPlayers:jogando})

            }
        }
    })
    socket.on("jogando", (e)=> {
        if(e.value=="WinRar"){
            let objToChange = jogando.find(obj => obj.j1.j1name === e.name)

            objToChange.j1.j1move = e.id
            objToChange.sum++
        }
        else if(e.value=="Zip do Windows"){
            let objToChange = jogando.find(obj => obj.j2.j2name === e.name)

            objToChange.j2.j2move = e.id
            objToChange.sum++
        }
        io.emit("jogando",{allPlayers:jogando})
    })
    socket.on("gameOver",(e)=>{
        jogando = jogando.filter(obj=>obj.j1.j1name!==e.name)
    })
})

app.get('/',(req,res) => {
    return res.sendFile("index.html")
});
app.get('/Players',(req,res) => {
    res.statusCode = 200;
    res.header("Access-Control-Allow-Origin", "*");
    sql = `SELECT * FROM jogadores`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.send("Erro na gravação: " + err);
        } else {
            console.log(rows);
        };
    });
});

app.post("/guardarUsuarios", function (req, res) {
    res.statusCode = 200;
    res.header("Access-Control-Allow-Origin", "*");
    var jogador = req.body.jogador;

    sql = `INSERT INTO jogadores (jogador) VALUES ("${jogador}")`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.send("Erro na gravação: " + err);
        } else {
            res.send(rows);
        };
    });
});

server.listen(3000, ()=> {
    console.log("porta conectada")
});