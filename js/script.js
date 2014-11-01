$(document).ready( function() {
			
	$('.demo').each( function() {
		//
		// Dear reader, it's actually very easy to initialize MiniColors. For example:
		//
		//  $(selector).minicolors();
		//
		// The way I've done it below is just for the demo, so don't get confused 
		// by it. Also, data- attributes aren't supported at this time. Again, 
		// they're only used for the purposes of this demo.
		//
		$(this).minicolors({
			control: $(this).attr('data-control') || 'hue',
			defaultValue: $(this).attr('data-defaultValue') || '',
			inline: $(this).attr('data-inline') === 'true',
			letterCase: $(this).attr('data-letterCase') || 'lowercase',
			opacity: $(this).attr('data-opacity'),
			position: $(this).attr('data-position') || 'bottom left',
			change: function(hex, opacity) {
				var log;
				var div_element = $(this).parents('.form-group');
				try {
					log = hex ? hex : 'transparent';
					if( opacity ) log += ', ' + opacity;
					div_element.css('background-color', log);
					window.texter.api.setText(inputText.value);
				} catch(e) {}
			},
			theme: 'default'
		});            
	});

	var rendering = false;

	$('#render').click(function() {
		if (rendering) {
			return;
		}

		rendering = true;

		var progressbar = $( "#progressbar" );
		
		progressbar.progressbar({
			value: false,
			change: function() {
				var progress = 0;
				if (progressbar.progressbar("value")) {
					progress = Math.ceil(progressbar.progressbar("value"));
				}

				$("#render").text(progress + "%" );
			}
		});

		var gif = new GIF({
			workers: 4,
			quality: 8,
			workerScript: './js/gif-lib/gif.worker.js',
			transparent: '#fff'
		});
			
		gif.on('finished', function(blob, data) {
			$("#gif").attr("src", URL.createObjectURL(blob));
			$("#render").text("Render GIF");
			progressbar.hide();
			rendering = true;
		});

		gif.on('progress', function(progress) {
			$("#progressbar").progressbar("value", progress * 100);
		})

		window.texter.api.capture(gif);
	});

	window.texter.api.toggleAnimation();
	start.innerHTML = "stop";
});

window.texter = new ThreeDTexter();
texter.api.setTextOption('material', new THREE.MeshLambertMaterial({
	color: '#eee' 
}));

function $id(nm){
	return document.getElementById(nm);
}

var inputText = document.getElementById('text');
var text = "hello world";

function update_text(){
	if (text != inputText.value) {
		text = inputText.value;
		window.texter.api.setText(text);
	}
}

inputText.onkeyup = update_text;

var start = document.getElementById('start');

start.onclick = function() {
	window.texter.api.toggleAnimation();

	if (window.texter.api.isAnimating()) {
		start.innerHTML = "stop";
	} else {
		start.innerHTML = "start";
	}
}

var font_selects = document.getElementsByClassName('font');
for (var i = 0; i < font_selects.length; i++){
	(function(text_font){
		text_font.addEventListener('click', function(evt){
			window.texter.api.setText(inputText.value);
			for (var i = 0; i < font_selects.length; i++){
				font_selects[i].className = font_selects[i].className.replace(' selected', '');
			}
			window.texter.api.setTextOption('font', text_font.attributes['data-font'].value);
			window.texter.api.setTextOption('weight', text_font.attributes['data-bold'] ? 'bold' : 'normal');
			window.texter.api.setText(inputText.value);
			this.className += ' selected';
			update_text();
		});
		if (text_font.className.indexOf('selected') !== -1){
			window.texter.api.setTextOption('font', text_font.attributes['data-font'].value);
			window.texter.api.setTextOption('weight', text_font.attributes['data-bold'] ? 'bold' : 'normal');
		}
	})(font_selects[i]);
}

var unselect = function() {
	var selected = $('button.selected').each(function() {
		this.classList.remove('selected');
	});
}

$id('axis_x').addEventListener('click', function(evt){
	evt.preventDefault();

	if (!this.classList.contains('selected')) {
		unselect();
		this.classList.add('selected');
		window.texter.api.setAxis("x");
		window.texter.api.setText(inputText.value);
	}
});

$id('axis_y').addEventListener('click', function(evt){
	evt.preventDefault();

	if (!this.classList.contains('selected')) {
		unselect();
		this.classList.add('selected');
		window.texter.api.setAxis("y");
		window.texter.api.setText(inputText.value);
	}
});

$id('wave').addEventListener('click', function(evt){
	evt.preventDefault();

	if (!this.classList.contains('selected')) {
		unselect();
		this.classList.add('selected');
		window.texter.api.setAxis("wave");
		window.texter.api.setText(inputText.value);
	}
}); 
		
