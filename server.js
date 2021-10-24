var jwt = require('jsonwebtoken');

// Appel de la dépendance
var express = require("express");


// Initialisation de l'application
var app = express();

// configuration de la bd
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'Mydb'
});

// connection a la bd
connection.connect(function(err) {
    if (!err) {
        console.log('DB CONNECTER AVEC SUCCES')
    }
    else {
        console.log('DB FAILED ERROR : ' + JSON.stringify(err,undefined, 2))

    }
});


var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//api authentification via token 
app.post('/api/token', (req, res) => {
    var email = req.body.email;
    jwt.sign({email: email}, 'supersecret', (err, token) => {
        connection.query("INSERT INTO user (email) VALUES (?)", email, (err, rows, fields) => {

            if (email == null) {
                return res.status(400).json({'error': 'paramettre manquant'});
            }

            if (!err) {
                console.log('ENVOYER AVEC SUCCES'),
                    res.json({
                        token,
                        email
                    });
            }

            else {
                console.log(err);
                res.status(500).json({'error': 'erreur'})
            }
        })


    });


    console.log(req.body);
});

app.post('/api/posts', verifyToken, (req, res) => {

    jwt.verify(req.token, 'supersecret', (err, authData) => {
        if(err) {
            res.sendStatus(403);
        } else {
            res.json({
                message: 'Post created...',
                authData
            });
        }
    });
});


// format du token

// authorisation: Bearer <access_token>

// verification token
function verifyToken(req, res, next) {
    // Obtenir la valeur de l'en-tête auth
    const bearerHeader = req.headers['authorization'];
    // Vérifier si le porteur est indéfini
    if(typeof bearerHeader !== 'undefined') {
        // split à l'espace , Quand on envois le token bearer #token
        const bearer = bearerHeader.split(' ');
        // Obtenir le jeton d'un tableau
        const bearerToken = bearer[1];
        // Définir le jeton
        req.token = bearerToken;
        next();
    } else {
        // retourner le status en cas derreur
        res.sendStatus(403);
    }

}

// On utilise bodyparser text pour pouvoir utilisé Content text/plain
app.use(bodyParser.text());

// api de justification de text
app.post('/api/justify',  (req, res) => {
   var justify = req.body;

    console.log(req.body);

    console.log('strLength ',justify.length);
    compteur = 0;
    arrIndex = [];

    while (compteur < justify.length){
        compteur += 80;
        if(compteur < justify.length){
            arrIndex.push(compteur);
        }
    }

    textjustify = [];

    console.log(arrIndex);
    arrIndex.forEach(function(element){
        textjustify.push(justify.slice(element-80, element));
    });
    textjustify.push(justify.slice(arrIndex[arrIndex.length-1], justify.length));

    var text_justify = textjustify.join("\n");
        res.send(text_justify);
    connection.query("INSERT INTO text (id_user,date,value_text) VALUES (1, NOW(), ?)", justify.length, (err, rows, fields) => {
        if (!err)
            console.log('envoyer avec succées dans la bdd (nombre de lettre)');
        else
            console.log(err);
    });


});


app.listen(3000, function() {
    console.log("serveur démarrer");
});



