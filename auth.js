module.exports.isAuthorized  = function(req, res, next) {
    if(!req.session.username){
        let err = new Error('Not authorized! Go back!');
        err.status = 400;
        next(err);
    }else{
        next();
    }
}

module.exports.isLoggin = function (req, res, next) {
    if(req.session.username){
        console.log(req.session.username)
        return res.redirect('/play');
    }else{
        next();
    }
}

module.exports.isLoggingPlay = function (req, res, next) {
    if(!req.session.username){
        return res.redirect('/');
    }else{
        next();
    }
}