const authPage = permissions => {
	return (req, res, next) => {
		const userRole = req.body.role;
		if (permissions.includes(userRole)) {
			next();
		} else {
			return res.status(401).json('unauthorized');
			// return res.json('unauthorized');
		}
	};
};

module.exports = { authPage };
