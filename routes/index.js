var express = require('express');
var router = express.Router();

var messages = [];
var increment = 1;



router.get('/', function(req, res) {
    try {
        if (users[req.cookies['user']]) {
            res.render('index-angular', { messages: JSON.stringify(getNotDeleteMessages()), isAdmin: req.cookies['user'] == 'admin', username: req.cookies['user'] });
        } else {
            res.render('auth', { });
        }
    }
    catch(exc){
        console.log(exc);
    }

});

router.get('/send', function(req, res) {
    try {

        messages.push({ id: increment, text: req.param('text'), user: req.cookies['user'], time: new Date().getTime() })
        increment++;
        res.json({ success: true });
    }
    catch(exc) {
        res.json({ success: false, message: exc.message, exc: exc});
    }
});

router.get('/del', function(req, res) {

    if (req.cookies['user'] != 'admin') {
        res.json({ success: false });
        return;
    }

    try {
        for(var i in messages){
            if (messages[i].id == req.param('id')){
                messages[i].del = true;
            }
        }

        res.json({ success: true });
    }
    catch(exc) {
        res.json({ success: false, message: exc.message, exc: exc});
    }
});

function getLastMessages(time){
    var newMes = [];
    for (var m in messages) {
        if (messages[m].time > time) {
            newMes.push(messages[m]);
        }
    }
    return newMes;
}

function getDeleteMessages(){
    var delMes = [];
    for (var m in messages) {
        if (messages[m].del == true) {
            delMes.push(messages[m].id);
        }
    }
    return delMes;
}

function getNotDeleteMessages(){
    var delMes = [];
    for (var m in messages) {
        if (!messages[m].del) {
            delMes.push(messages[m]);
        }
    }
    return delMes;
}

router.get('/get', function(req, res) {
    res.json({ success: true, messages: getLastMessages(req.param('time')), deletes: getDeleteMessages() });
});

router.get('/logout', function(req, res) {
    res.clearCookie('user');
    res.redirect('/');
});

// users

var users = { "igor": "1", "admin": "1" };

router.get('/auth_check', function(req, res) {
    try {
        var user = req.param('user');
        var pass = req.param('pass');
        if (user === undefined || pass === undefined)
            res.json({ success: false, message: 'not enough params' });

        if (users[user] == pass) {
            res.cookie('user', user, { expires: new Date(Date.now() + 900000), httpOnly: true });
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'user or pass problem' })
        }
    }
    catch(exc){
        res.json({ success: false, message: exc.message, exc: exc});
    }
});

module.exports = router;
