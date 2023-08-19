module.exports.isLoggedIn = (req, res, next) => {
	console.log("REQ/USER...", req.user);
	if (!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl; //store url being requested
		req.flash("error", "you must be signed in");
		return res.redirect("/login");
	}
	next();
};

module.exports.storeReturnTo = (req, res, next) => {
	if (req.session.returnTo) {
		res.locals.returnTo = req.session.returnTo;
	}
	next();
};
