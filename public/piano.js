/*

Socket.io

*/


const socket = io();

// 聊天室訊息
var messages = document.getElementById('messages');

// 錯誤訊息
var errorform = document.getElementById('errorform');

// player form
var roomform = document.getElementById('roomform');
var roominput = document.getElementById('roominput');

// chat form
var chatform = document.getElementById('chatform');
var chatinput = document.getElementById('chatinput');

// host form
var hostroomform = document.getElementById('hostroomform');
var hostroominput = document.getElementById('hostroominput');
var hostnameinput = document.getElementById('hostnameinput');

// 所有的form
var mainform = document.getElementById('mainform');

// host 答案 form
var hostansform = document.getElementById('hostansform');

// 顯示資訊
var showinfo = document.getElementById('showinfo');

var main = document.getElementById('main');

roomform.addEventListener('submit', function (e) {
	e.preventDefault();
	if (roominput.value) {
		console.log('heffef');
		socket.emit('login', roominput.value);

	}
});

hostroomform.addEventListener('submit', function (e) {
	e.preventDefault();
	if (hostroominput.value) {
		socket.emit('hostLogin', hostroominput.value);

		hostansform.style.maxHeight = 'fit-content';
		hostansform.style.opacity = '100%';
	}
});

chatform.addEventListener('submit', function (e) {
	e.preventDefault();
	if (chatinput.value) {
		socket.emit('chat message', chatinput.value);
		chatinput.value = '';
	}
});

hostansform.addEventListener('submit', function (e) {
	e.preventDefault();
	if (hostansinput.value) {
		socket.emit('host answer', hostansinput.value);
		hostansinput.value = '';
		hostansform.style.maxHeight = '0';
		hostansform.style.opacity = '0';
	}
});

socket.on('chat message', function (msg, name) {
	var item = document.createElement('li');
	item.textContent = `${name}: ${msg}`;
	item.setAttribute('class', 'list-group-item');
	messages.appendChild(item);
	document.getElementById('scroller').scrollTo(0, document.getElementById('scroller').scrollHeight);
});



socket.on('hostRestart', function () {
	hostansform.style.maxHeight = 'fit-content';
	hostansform.style.opacity = '100%';
});

socket.on('connectionFail', (msg) => {
	console.log('-------connectionfail');
	console.log(msg.success);
	var errorMsg = document.getElementById('errorMsg');
	if (!errorMsg) {
		var erroritem = document.createElement('p');
		erroritem.setAttribute('id', 'errorMsg');
		erroritem.textContent = `狀態：${msg.success}，訊息：${msg.message}`;
		errorform.appendChild(erroritem);
	} else {
		erroritem.textContent = `狀態：${msg.success}，訊息：${msg.message}`;
	}
});

socket.on('connectionSuccess', (msg) => {
	console.log('-------connectionsuccess');
	console.log(msg);

	roominput.value = '';
	mainform.style.maxHeight = '0';

	hostroominput.value = '';
	mainform.style.maxHeight = '0';

	main.style.maxHeight = 'fit-content';

	var selfNameItem = document.createElement('h2');
	selfNameItem.setAttribute('id', 'selfName');
	selfNameItem.textContent = `Player：${msg.myname}`;
	showinfo.appendChild(selfNameItem);

	var selfRoomItem = document.createElement('h3');
	selfRoomItem.setAttribute('id', 'selfRoom');
	selfRoomItem.textContent = `Room：${msg.roomNum}`;
	showinfo.appendChild(selfRoomItem);
});

socket.on('hostConnectionFail', (msg) => {
	console.log('-------connectionfail');
	console.log(msg.success);
	var errorMsg = document.getElementById('errorMsg');
	if (!errorMsg) {
		var erroritem = document.createElement('p');
		erroritem.setAttribute('id', 'errorMsg');
		erroritem.textContent = `狀態：${msg.success}，訊息：${msg.message}`;
		errorform.appendChild(erroritem);
	} else {
		erroritem.textContent = `狀態：${msg.success}，訊息：${msg.message}`;
	}
});

socket.on('point', (msg) => {
	console.log('-------connectionfail');
	console.log(msg.success);
	var pointMsg = document.getElementById('pointMsg');
		pointMsg.textContent = `得分：${msg}`;
	
});

socket.on('hostConnectionSuccess', (msg) => {
	console.log('-------connectionsuccess');
	console.log(msg);

	// nameinput.value = '';
	roominput.value = '';
	mainform.style.maxHeight = '0';

	// hostnameinput.value = '';
	hostroominput.value = '';
	mainform.style.maxHeight = '0';

	hostansform.style.maxHeight = 'fit-content';
	hostansform.style.opacity = '100%';

	main.style.maxHeight = 'fit-content';
	console.log('heeyyyyy');

	var selfRoomItem = document.createElement('h3');
	selfRoomItem.setAttribute('id', 'selfRoom');
	selfRoomItem.textContent = `Room：${msg.roomNum}`;
	showinfo.appendChild(selfRoomItem);
});

socket.on('hostConnectionSuccessOthers', (msg) => {
	var selfHostNameItem = document.createElement('h2');
	selfHostNameItem.setAttribute('id', 'yourHostName');
	selfHostNameItem.textContent = `Host：${msg.myname}`;
	showinfo.appendChild(selfHostNameItem);
});

socket.on('hostDisconnection', () => {
	var yourHostName = document.getElementById('yourHostName');
	yourHostName.remove();
});


// **** CANVAS ****


const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const colorInput = document.getElementById('color');
const brushSizeInput = document.getElementById('brushSize');

let isDrawing = false;

canvas.addEventListener('mousedown', () => {
	isDrawing = true;
});

canvas.addEventListener('mouseup', () => {
	isDrawing = false;
	context.beginPath();
	socket.emit('drawStop');
});

canvas.addEventListener('mousemove', (event) => {
	if (!isDrawing) return;

	const data = {
        x: event.clientX - canvas.getBoundingClientRect().left,
        y: event.clientY - canvas.getBoundingClientRect().top,
		color: colorInput.value,
		brushSize: brushSizeInput.value,
		isDrawing,
	};

	draw(data);

	socket.emit('draw', data);
});

socket.on('draw', (data) => {
	draw(data);
});

socket.on('drawStop', () => {
	context.beginPath();
});

socket.on('clearCanvas', () => {
	context.clearRect(0, 0, canvas.width, canvas.height);
});

function draw(data) {
	context.strokeStyle = data.color;
	context.lineWidth = data.brushSize;
	context.lineCap = 'round';

	context.lineTo(data.x, data.y);
	context.stroke();
	context.beginPath();
	context.moveTo(data.x, data.y);
}
function clearCanvas() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	socket.emit('clearCanvas')
}