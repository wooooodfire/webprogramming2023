const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const port = 4500;

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'));

app.get('/', (req, res) => {
	res.render('index.html');
});

let users = {};

io.on('connection', (socket) => {
	console.log('a user connected');
	let myname = '';
	let myroom = '';
	let mypoint = 0;
	var isHost = false;

	// 登入
	socket.on('login', (username, roomNum) => {
		if (!users[roomNum]) {
			users[roomNum] = { name: [], host: '', hostID: '', ans: '', start: false };
		}
		const sameUser = users[roomNum].name.find((user) => {
			return user === username;
		});

		if (sameUser || users[roomNum].host === username) {
			socket.emit('connectionFail', {
				success: false,
				message: '使用者名稱重複',
			});
		}
			else {
			socket.nickname = username;
			myname = username;
			myroom = roomNum;
			socket.join(roomNum);
			console.log('-------------Someone Join US! --------------');
			console.log(`${socket.nickname}已加入${[...socket.rooms][1]}房間`);

			// 只發事件給這個使用者
			socket.emit('connectionSuccess', {
				success: true,
				message: '歡迎加入！連線成功',
				username,
				roomNum,
			});

			io.to(myroom).emit('chat message', `已經加入房間`, socket.nickname);

			// 給除了這個使用者外的其他人
			socket.broadcast.emit('connectionSuccessOthers', {
				success: true,
				message: `歡迎使用者 ${username} 連線成功`,
			});

			// 發事件給所有人，包括這個使用者
			// io.emit('connectionSuccess', {
			// 	success: true,
			// 	message: '即刻起免費使用聊天室直到～永遠',
			// });

			users[roomNum].name.push(username);
			console.log('現在所有的users');
			console.log(users);
			console.log('--------------------------------------------');
			console.log('');
		}
	});

	// host login
	socket.on('hostLogin', (username, roomNum) => {
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
			socket.nickname = username;
			myname = username;
			myroom = roomNum;

			isHost = true;
			console.log(`我是Host嗎${isHost}`)
			socket.join(roomNum);
			console.log('-------------Someone Join US! --------------');
			console.log(`Host: ${socket.nickname}已加入${[...socket.rooms][1]}房間`);

			// 只發事件給這個使用者
			socket.emit('hostConnectionSuccess', {
				success: true,
				message: '歡迎加入！連線成功',
				username,
				roomNum,
			});

			// 給除了這個使用者外的其他人
			io.to(myroom).emit('hostConnectionSuccessOthers', {
				success: true,
				message: `您們的主持人${username}`,
				username,
			});
			io.to(myroom).emit('chat message', `Host已經加入房間`, socket.nickname);

			// 發事件給所有人，包括這個使用者
			// io.emit('connectionSuccess', {
			// 	success: true,
			// 	message: '即刻起免費使用聊天室直到～永遠',
			// });

			users[roomNum].host = username;
			users[roomNum].hostID = socket.id;
			console.log('現在所有的users');
			console.log(users);
			console.log('--------------------------------------------');
			console.log('');
		}
	});

	socket.on('room number', (msg) => {
		socket.join(msg);
		console.log(`${socket.nickname}已加入${[...socket.rooms][1]}房間`);
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

	socket.on('send-nickname', function (nickname) {
		socket.nickname = nickname;
		console.log(socket.nickname);
	});

	socket.on('keydown', (msg) => {
		if(isHost){
			io.to(myroom).emit('playKeyDown', msg);
		}
	});

	socket.on('keyup', (msg) => {
		if(isHost){
			io.to(myroom).emit('playKeyUp', msg);
		}
	});

	socket.on('mousedown', (msg) => {
		if(isHost){
			io.to(myroom).emit('playMouseDown', msg);
		}
	});

	socket.on('mouseup', (msg) => {
		if(isHost){
			io.to(myroom).emit('playMouseUp', msg);
		}
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

	// socket.on('press au', (msg) => {
	// 	console.log(msg);
	// });

	// socket.on('press key', (msg) => {
	// 	console.log(msg);
	// });
});

server.listen(port, () => {
	console.log(`listening on ${port}`);
});
