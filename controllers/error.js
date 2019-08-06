

exports.get404 = (req, res, next) =>{
    const renderData = {
        "pageTitle": "Error 404",
        "content": "Opps! Page Not Found 404",
        "path": '/404',
        "userData" : {
            isLoggedIn : req.session.isLoggedIn,
            isAdmin : req.session.isAdmin   
        }
    }
    res.status(404).render('errors/404',renderData)
}

exports.get500 = (req, res, next) =>{
    const renderData = {
        "pageTitle": "Error 500",
        "content": "Opps! Somthing is broke",
        "path": '/500',
        "userData" : {
            isLoggedIn : req.session.isLoggedIn,
            isAdmin : req.session.isAdmin   
        }
    }
    res.status(500).render('errors/500',renderData)
}