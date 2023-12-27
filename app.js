const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const port = 4500;
const auth = require('./auth');
const flash = require('connect-flash');

// **** session ****
const session = require('express-session');
const MongoStore = require('connect-mongo');

const oneDay = 1000 * 60 * 10;

const sessionMiddleware = session({
	secret: 'thisismysecrctekeyabc123',
	saveUninitialized: true,
	cookie: { maxAge: oneDay },
	store: MongoStore.create({ mongoUrl: 'mongodb://localhost/webcourse2023' }),
	resave: false,
});

//session middleware
app.use(sessionMiddleware);

// **** mongoose ****

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/webcourse2023', { useNewUrlParser: true });

const db = mongoose.connection;

db.once('open', () => {
	console.log('mongodb 已連線');
});

db.on('error', () => {
	console.log('mongodb 連線錯誤');
});

const accountSchema = mongoose.Schema({
	username: String,
	password: String,
});

// Compile model from schema
const AccountModel = mongoose.model('AccountModel', accountSchema);

const QuizModel = mongoose.model(
	'quiz',
	new mongoose.Schema({
		word: String,
		category: String,
		difficulty: Number,
	})
);

// **** express ****

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'));
app.use(express.urlencoded());
app.use(flash());

// **** router ****

app.get('/', auth.isLoggin, (req, res) => {
	console.log(`username: ${!req.session.username} .`);
	res.render('home', { expressFlash: req.flash('failed') });
});

app.post('/signup', (req, res) => {
	let { username, password } = req.body;
	if (username && password) {
		// Create an instance of model AccountModel
		let account_instance = new AccountModel({ username, password });

		// Save the new model instance, passing a callback
		account_instance.save();
		console.log('Account Saved!');
		req.flash('failed', '成功創建帳號');
	}
	res.redirect('/');
});

app.post('/signin', async (req, res) => {
	let { username, password } = req.body;
	let result;
	if (username && password) {
		// 執行查詢
		try {
			result = await db.collection('accountmodels').find({ username }).toArray();
			if (result.length === 0) {
				req.flash('failed', '帳號密碼錯誤');
				return res.redirect('/');
			} else if (result[0]['password'] !== password) {
				req.flash('failed', '帳號密碼錯誤');
				return res.redirect('/');
			} else {
				req.session.username = username;
				req.session.id = result[0]._id;
				return res.redirect('/play');
			}
		} catch {
			return res.status('200').redirect('/');
		}
	} else {
		req.flash('failed', '不明錯誤');
		return res.redirect('/');
	}
	res.redirect('/');
});

app.get('/play', auth.isLoggingPlay, (req, res) => {
	console.log(`in play page: ${req.session.username}`);
	res.render('play.ejs', { username: req.session.username });
});

app.get('/logout', (req, res) => {
	req.session.destroy();
	res.redirect('/');
});

app.get('/test', async (req, res) => {
	// 獲取文檔總數
	const count = await QuizModel.countDocuments();
	console.log(count)
	// 生成隨機索引
	const randomIndex = Math.floor(Math.random() * count);

	// 查詢並返回隨機文檔
	const randomDocument = await QuizModel.findOne().skip(randomIndex);

	res.send(randomDocument);
});

let users = {};

io.engine.use(sessionMiddleware);

io.on('connection', (socket) => {
	console.log('a user connected');
	let myname = '';
	let myroom = '';
	let mypoint = 0;
	var isHost = false;

	// 登入
	socket.on('login', (roomNum) => {
		if (!users[roomNum]) {
			users[roomNum] = { name: [], host: '', hostID: '', ans: '', start: false };
		}

		socket.nickname = socket.request.session.username;
		myname = socket.request.session.username;
		myroom = roomNum;
		socket.join(roomNum);
		console.log('-------------Someone Join US! --------------');
		console.log(`${socket.nickname}已加入${[...socket.rooms][1]}房間`);

		// 只發事件給這個使用者
		socket.emit('connectionSuccess', {
			success: true,
			message: '歡迎加入！連線成功',
			myname,
			roomNum,
		});

		io.to(myroom).emit('chat message', `已經加入房間`, socket.nickname);

		// 給除了這個使用者外的其他人
		socket.broadcast.emit('connectionSuccessOthers', {
			success: true,
			message: `歡迎使用者 ${myname} 連線成功`,
		});

		users[roomNum].name.push(myname);
		console.log('現在所有的users');
		console.log(users);
		console.log('--------------------------------------------');
		console.log('');
	});

	// host login
	socket.on('hostLogin', (roomNum) => {
		if (!users[roomNum]) {
			users[roomNum] = { name: [], host: '', hostID: '', ans: '', start: false };
		}
		const sameUser = users[roomNum].host.length;

		if (sameUser) {
			socket.emit('hostConnectionFail', {
				success: false,
				message: '已經有Host了',
			});
		} else {
			socket.nickname = socket.request.session.username;
			myname = socket.request.session.username;
			myroom = roomNum;

			isHost = true;
			console.log(`我是Host嗎${isHost}`);
			socket.join(roomNum);
			console.log('-------------Someone Join US! --------------');
			console.log(`Host: ${socket.nickname}已加入${[...socket.rooms][1]}房間`);

			// 只發事件給這個使用者
			socket.emit('hostConnectionSuccess', {
				success: true,
				message: '歡迎加入！連線成功',
				myname,
				roomNum,
			});

			// 給除了這個使用者外的其他人
			io.to(myroom).emit('hostConnectionSuccessOthers', {
				success: true,
				message: `您們的主持人${myname}`,
				myname,
			});
			io.to(myroom).emit('chat message', `Host已經加入房間`, socket.nickname);

			users[roomNum].host = myname;
			users[roomNum].hostID = socket.id;
			console.log('現在所有的users');
			console.log(users);
			console.log('--------------------------------------------');
			console.log('');
		}
	});

	socket.on('disconnect', () => {
		console.log('============Disconnect=============');
		let disconnectroom = users[myroom];
		if (disconnectroom) {
			if (isHost) {
				io.to(myroom).emit('chat message', `Host已離開房間`, disconnectroom.host);
				disconnectroom.host = '';
				io.to(myroom).emit('hostDisconnection');
			} else {
				let index = disconnectroom.name.indexOf(myname);
				let x = users[myroom].name.splice(index, 1);
				io.to(myroom).emit('chat message', `已離開房間`, x);
				console.log(`使用者離開: ${x}`);
			}

			if (!users[myroom].name.length > 0 && !users[myroom].host.length > 0) {
				delete users[myroom];
			}
		}
		console.log('---現在所有使用者---');
		console.log(users);
		console.log('===================================');
		console.log('');
	});

	socket.on('chat message', (msg) => {
		console.log(`[${socket.nickname}]在房間${[...socket.rooms][1]}傳送: ${msg}`);
		io.to([...socket.rooms][1]).emit('chat message', msg, socket.nickname);
		if (msg == users[myroom].ans) {
			mypoint++;
			io.to(myroom).emit('chat message', `猜對了答案！「${users[myroom].ans}」`, socket.nickname);
			io.to(myroom).emit('chat message', `現在得分：${mypoint}`, socket.nickname);
			socket.emit('point', mypoint);
			users[myroom].ans = '';
			console.log(users[myroom].hostID);
		}
	});

	socket.on('host answer', function (msg) {
		users[myroom].ans = msg;
		console.log(`Host出的答案${msg}`);
		io.to(myroom).emit('chat message', `Host出了題目，趕快來猜吧！`, socket.nickname);
	});

	socket.on('draw', (data) => {
		// Broadcast the drawing data to all connected clients

		// io.emit('draw', data);
		io.to(myroom).emit('draw', data);
	});
	socket.on('drawStop', () => {
		// io.emit('drawStop');
		io.to(myroom).emit('drawStop');
	});
	socket.on('clearCanvas', () => {
		// io.emit('clearCanvas');
		io.to(myroom).emit('clearCanvas');
	});
});

app.get('/white', (req, res) => {
	res.render('white');
});

server.listen(port, () => {
	console.log(`listening on ${port}`);
});
