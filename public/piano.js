/*

Socket.io

*/


var socket = io();

// 聊天室訊息
var messages = document.getElementById('messages');

// 錯誤訊息
var errorform = document.getElementById('errorform');

// player form
var roomform = document.getElementById('roomform');
var roominput = document.getElementById('roominput');
var nameinput = document.getElementById('nameinput');

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
	if (roominput.value && nameinput.value) {
		console.log('heffef');
		socket.emit('login', nameinput.value, roominput.value);
		// socket.emit('send-nickname', nameinput.value);
		// socket.emit('room number', roominput.value);
	}
});

hostroomform.addEventListener('submit', function (e) {
	e.preventDefault();
	if (hostroominput.value && hostnameinput.value) {
		// socket.emit('send-nickname', 'host');
		// socket.emit('room number', hostroominput.value);
		socket.emit('hostLogin', hostnameinput.value, hostroominput.value);
		hostansform.style.maxHeight = 'fit-content';
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
	}
});

socket.on('chat message', function (msg, name) {
	var item = document.createElement('li');
	item.textContent = `${name}: ${msg}`;
	item.setAttribute('class', 'list-group-item');
	messages.appendChild(item);
	document.getElementById('scroller').scrollTo(0, document.getElementById('scroller').scrollHeight);
});

// socket.on('press audio', function (msg) {
// 	var item = document.createElement('li');
// 	item.textContent = msg;
// 	messages.appendChild(item);
// 	window.scrollTo(0, document.body.scrollHeight);
// });

socket.on('hostRestart', function () {
	hostansform.style.maxHeight = 'fit-content';
});
// socket.emit("connectionFail", {
// 	success: false,
// 	message: "使用者名稱重複",
//   });
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

	nameinput.value = '';
	roominput.value = '';
	mainform.style.maxHeight = '0';

	hostnameinput.value = '';
	hostroominput.value = '';
	mainform.style.maxHeight = '0';

	main.style.maxHeight = 'fit-content';

	var selfNameItem = document.createElement('h2');
	selfNameItem.setAttribute('id', 'selfName');
	selfNameItem.textContent = `Player：${msg.username}`;
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

	nameinput.value = '';
	roominput.value = '';
	mainform.style.maxHeight = '0';

	hostnameinput.value = '';
	hostroominput.value = '';
	mainform.style.maxHeight = '0';

	hostansform.style.maxHeight = 'fit-content';

	main.style.maxHeight = 'fit-content';

	// var selfNameItem = document.createElement('h2');
	// selfNameItem.setAttribute('id', 'selfHostName');
	// selfNameItem.textContent = `Host：${msg.username}`;
	// showinfo.appendChild(selfNameItem);

	var selfRoomItem = document.createElement('h3');
	selfRoomItem.setAttribute('id', 'selfRoom');
	selfRoomItem.textContent = `Room：${msg.roomNum}`;
	showinfo.appendChild(selfRoomItem);
});

socket.on('hostConnectionSuccessOthers', (msg) => {
	var selfHostNameItem = document.createElement('h2');
	selfHostNameItem.setAttribute('id', 'yourHostName');
	selfHostNameItem.textContent = `Host：${msg.username}`;
	showinfo.appendChild(selfHostNameItem);
});

socket.on('hostDisconnection', () => {
	var yourHostName = document.getElementById('yourHostName');
	yourHostName.remove();
});




/**
  Copyright 2012 Michael Morris-Pearce

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

// var socket2 = io();

(function () {
	let isStart = false;

	let start = document.getElementById('start');
	start.addEventListener('click', () => {
		if(!isStart){
			isStart = true;
			start.textContent='關閉Keyboard聲音';
		} else{
			start.textContent='開啟Keyboard聲音'
			isStart = false
		}
		// console.log(`isStart: ${isStart}`);
	});

	/* Piano keyboard pitches. Names match sound files by ID attribute. */

	var keys = [
		'A2',
		'Bb2',
		'B2',
		'C3',
		'Db3',
		'D3',
		'Eb3',
		'E3',
		'F3',
		'Gb3',
		'G3',
		'Ab3',
		'A3',
		'Bb3',
		'B3',
		'C4',
		'Db4',
		'D4',
		'Eb4',
		'E4',
		'F4',
		'Gb4',
		'G4',
		'Ab4',
		'A4',
		'Bb4',
		'B4',
		'C5',
	];

	/* Corresponding keyboard keycodes, in order w/ 'keys'. */
	/* QWERTY layout:
  /*   upper register: Q -> P, with 1-0 as black keys. */
	/*   lower register: Z -> M, , with A-L as black keys. */

	var codes = [
		90, 83, 88, 67, 70, 86, 71, 66, 78, 74, 77, 75, 81, 50, 87, 69, 52, 82, 53, 84, 89, 55, 85, 56, 73, 57, 79, 80,
	];

	var pedal = 32; /* Keycode for sustain pedal. */
	var tonic = 'A2'; /* Lowest pitch. */

	/* Piano state. */

	var intervals = {};
	var depressed = {};

	/* Selectors */

	function pianoClass(name) {
		return '.piano-' + name;
	}

	function soundId(id) {
		return 'sound-' + id;
	}

	function sound(id) {
		var it = document.getElementById(soundId(id));
		return it;
	}

	/* Virtual piano keyboard events. */

	function keyup(code) {
		if (isStart === true) {
			var offset = codes.indexOf(code);
			var k;
			if (offset >= 0) {
				k = keys.indexOf(tonic) + offset;
				// console.log(`k:${k}`);
				// socket.emit('press key', keys[k]);
				return keys[k];
			}
		}
	}

	function keydown(code) {
		if (isStart === true) {
			return keyup(code);
		}
	}

	function press(key) {
		var audio = sound(key);
		if (depressed[key]) {
			return;
		}
		clearInterval(intervals[key]);
		if (audio) {
			audio.pause();
			audio.volume = 1.0;
			if (audio.readyState >= 2) {
				audio.currentTime = 0;
				audio.play();
				depressed[key] = true;
			}
		}
		$(pianoClass(key)).animate(
			{
				backgroundColor: '#88FFAA',
			},
			0
		);
	}

	/* Manually diminish the volume when the key is not sustained. */
	/* These values are hand-selected for a pleasant fade-out quality. */

	function fade(key) {
		var audio = sound(key);
		var stepfade = function () {
			if (audio) {
				if (audio.volume < 0.03) {
					kill(key)();
				} else {
					if (audio.volume > 0.2) {
						audio.volume = audio.volume * 0.95;
					} else {
						audio.volume = audio.volume - 0.01;
					}
				}
			}
		};
		return function () {
			// socket.emit('press au', 'hi');
			clearInterval(intervals[key]);
			intervals[key] = setInterval(stepfade, 5);
		};
	}

	/* Bring a key to an immediate halt. */

	function kill(key) {
		var audio = sound(key);
		return function () {
			clearInterval(intervals[key]);
			if (audio) {
				audio.pause();
			}
			if (key.length > 2) {
				$(pianoClass(key)).animate(
					{
						backgroundColor: 'black',
					},
					300,
					'easeOutExpo'
				);
			} else {
				$(pianoClass(key)).animate(
					{
						backgroundColor: 'white',
					},
					300,
					'easeOutExpo'
				);
			}
		};
	}

	/* Simulate a gentle release, as opposed to hard stop. */

	var fadeout = true;

	/* Sustain pedal, toggled by user. */

	var sustaining = false;

	/* Register mouse event callbacks. */

	keys.forEach(function (key) {
		$(pianoClass(key)).mousedown(function () {
			socket.emit('mousedown', key);
			$(pianoClass(key)).animate(
				{
					backgroundColor: '#88FFAA',
				},
				0
			);
			press(key);
		});
		if (fadeout) {
			$(pianoClass(key)).mouseup(function () {
				socket.emit('mouseup', key);
				depressed[key] = false;
				if (!sustaining) {
					fade(key)();
				}
			});
		} else {
			$(pianoClass(key)).mouseup(function () {
				socket.emit('mouseup', key);
				depressed[key] = false;
				if (!sustaining) {
					kill(key)();
				}
			});
		}
	});

	socket.on('playMouseDown', (key) => {
		$(pianoClass(key)).animate(
			{
				backgroundColor: '#88FFAA',
			},
			0
		);
		press(key);
	});

	socket.on('playMouseUp', (key) => {
		if (fadeout) {
			depressed[key] = false;
			if (!sustaining) {
				fade(key)();
			}
		} else {
			depressed[key] = false;
			if (!sustaining) {
				kill(key)();
			}
		}
	});
	/* Register keyboard event callbacks. */

	$(document).keydown(function (event) {

		socket.emit('keydown', event.which);

		if (event.which === pedal) {
			sustaining = true;
			$(pianoClass('pedal')).addClass('piano-sustain');
		}
		press(keydown(event.which));
	});

	$(document).keyup(function (event) {

		socket.emit('keyup', event.which);
		if (event.which === pedal) {
			sustaining = false;
			$(pianoClass('pedal')).removeClass('piano-sustain');
			Object.keys(depressed).forEach(function (key) {
				if (!depressed[key]) {
					if (fadeout) {
						fade(key)();
					} else {
						kill(key)();
					}
				}
			});
		}
		if (keyup(event.which)) {
			depressed[keyup(event.which)] = false;
			if (!sustaining) {
				if (fadeout) {
					fade(keyup(event.which))();
				} else {
					kill(keyup(event.which))();
				}
			}
		}
	});

	socket.on('playKeyDown', (msg) => {
		console.log('====inmy====');
		console.log(msg);
		console.log('================');
		if (msg === pedal) {
			sustaining = true;
			$(pianoClass('pedal')).addClass('piano-sustain');
		}
		press(keydown(msg));
	});

	socket.on('playKeyUp', (msg) => {
		console.log('====inmykeyup====');
		console.log(msg);
		console.log('================');
		if (msg === pedal) {
			sustaining = false;
			$(pianoClass('pedal')).removeClass('piano-sustain');
			Object.keys(depressed).forEach(function (key) {
				if (!depressed[key]) {
					if (fadeout) {
						fade(key)();
					} else {
						kill(key)();
					}
				}
			});
		}
		if (keyup(msg)) {
			depressed[keyup(msg)] = false;
			if (!sustaining) {
				if (fadeout) {
					fade(keyup(msg))();
				} else {
					kill(keyup(msg))();
				}
			}
		}
	});
})();
