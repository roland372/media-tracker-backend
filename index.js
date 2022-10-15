const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
require('dotenv').config();
const { authPage } = require('./middlewares');

// process.env.NAME

app.use(cors());
// app.use(cors({ origin: '*' }));
// Add headers before the routes are defined
// Add headers
// app.use(function (req, res, next) {
// 	// Website you wish to allow to connect
// 	res.setHeader('Access-Control-Allow-Origin', '*');

// 	// Request methods you wish to allow
// 	res.setHeader(
// 		'Access-Control-Allow-Methods',
// 		'GET, POST, OPTIONS, PUT, PATCH, DELETE'
// 	);

// 	// Request headers you wish to allow
// 	res.setHeader(
// 		'Access-Control-Allow-Headers',
// 		'X-Requested-With,content-type'
// 	);

// 	// Set to true if you need the website to include cookies in the requests sent
// 	// to the API (e.g. in case you use sessions)
// 	res.setHeader('Access-Control-Allow-Credentials', true);

// 	// Pass to next layer of middleware
// 	next();
// });

// app.use(cors());
// const { createProxyMiddleware } = require('http-proxy-middleware');
// app.use(
// 	'/api',
// 	createProxyMiddleware({
// 		target: 'https://media-tracker.netlify.app/', //original url
// 		changeOrigin: true,
// 		//secure: false,
// 		onProxyRes: function (proxyRes, req, res) {
// 			proxyRes.headers['Access-Control-Allow-Origin'] = '*';
// 		},
// 	})
// );
app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept'
	);
	next();
});

app.use(express.json());

// const db = mysql.createConnection({
const db = mysql.createPool({
	// user: 'root',
	// port: 3306,
	// host: 'localhost',
	// password: 'password',
	// database: 'media-tracker',

	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_SECRET,
	database: process.env.MYSQL_DB,
});

// db.getConnection(function (err, connection) {
// 	// Use the connection
// 	connection.query('SELECT * FROM notes', function (error, results, fields) {
// 		// And done with the connection.
// 		connection.release();

// 		// Handle error after the release.
// 		if (error) throw error;

// 		// Don't use the connection here, it has been returned to the pool.
// 	});
// });

app.get('/', (req, res) => {
	res.status(200).json({
		status: 'success',
		data: {
			name: 'media-tracker',
		},
	});
});

// app.post("/media/games", async (req, res) => {
// 	const response = await fetch("https://api.igdb.com/v4/games");
// 	res.json(await response.json());
// })

app.post('/notes', authPage([process.env.API_ADMINID]), (req, res) => {
	db.query('SELECT * FROM notes', (err, result) => {
		if (err) {
			res.send(err);
			console.log(err);
		} else {
			res.send(result);
		}
	});
});

// app.get('/notes', (req, res) => {
// 	db.query('SELECT * FROM notes', (err, result) => {
// 		if (err) {
// 			res.send(err);
// 			console.log(err);
// 		} else {
// 			res.send(result);
// 		}
// 	});
// });

app.post('/notes/add-note', authPage([process.env.API_ADMINID]), (req, res) => {
	console.log(req.body.note);
	const title = req.body.note.title;
	const note = req.body.note.note;
	const color = req.body.note.color;
	const lastModified = req.body.note.lastModified;
	const noteID = req.body.note.noteID;

	db.query(
		'INSERT INTO notes (title, note, color, lastModified, noteID) VALUES (?,?,?,?,?)',
		[title, note, color, lastModified, noteID],
		(err, result) => {
			if (err) {
				console.log(err);
			} else {
				res.send('note added to database');
			}
		}
	);
});

app.put('/notes/edit-note', authPage([process.env.API_ADMINID]), (req, res) => {
	console.log(req.body);
	const title = req.body.title;
	const note = req.body.note;
	const color = req.body.color;
	const lastModified = req.body.lastModified;
	const noteID = req.body.noteID;
	db.query(
		'UPDATE notes SET title = ?, note = ?, color = ?, lastModified = ? WHERE noteID = ?',
		[title, note, color, lastModified, noteID],
		(err, result) => {
			if (err) {
				console.log(err);
			} else {
				res.send(result);
			}
		}
	);
});

app.delete('/notes/delete/:id', (req, res) => {
	const id = req.params.id;
	// console.log(id);
	db.query('DELETE FROM notes WHERE noteID = ?', id, (err, result) => {
		if (err) {
			console.log(err);
		} else {
			res.send(result);
		}
	});
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
	console.log('server running');
});
