module.exports = (func) => {
	//we pass a callback to function, if any errors are thrown we catch them and pass them to next. replaces having to use try and catch on every async function for our routes. So expresses error handling middle ware works on an async function. Otherwise the only way we access the error is by catching it in our 'catch' and passing it to next() form there
	return (req, res, next) => {
		func(req, res, next).catch(next);
	};
};
