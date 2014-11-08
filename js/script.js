'use strict';

var texter = new ThreeDTexter($('#text_container')[0]);

$(document).ready( function() {

	var updateColor = function() {
		try {
			texter.api.setColor(
				parseInt($('#primary-color').val().substr(1), 16),
				parseInt($('#secondary-color').val().substr(1), 16),
				parseInt($('#background-color').val().substr(1), 16),
				$('#opaque').prop('checked'));
		} catch(e) {
			console.log(e);
		}
	};
			
	$('#colors input[type="text"]').minicolors({
		change: function(hex, opacity) {
			updateColor();
		}
	});

	$('#opaque').change(updateColor);

	var rendering = false;

	$('#render').click(function() {
		if (rendering) {
			return;
		}

		$('#progress').show();
		$('#render_text').text('Rendering');
		rendering = true;

		var gifOptions = {
			workers: 4,
			quality: 8,
			workerScript: './js/gif-lib/gif.worker.js'
		};

		if (!$('#opaque').prop('checked')) {
			gifOptions.transparent = 0xffffff;
		}

		var gif = new GIF(gifOptions);
			
		gif.on('finished', function(blob, data) {
			var url = URL.createObjectURL(blob);

			$('#gif').attr('src', url);
			$('#download').attr('href', url);
			$('#download').attr('download', $('#text').val());
			$('#download').css('display', 'block');

			$('#render_text').text('Create GIF');
			$('#progress').hide();

			rendering = false;
		});

		gif.on('progress', function(progress) {
			var p = progress * 50 + 50;
			$('#progress').css('width', p + '%');
			$('#render_text').text(Math.ceil(p) + '%');
		})

		texter.api.capture(gif, function(progress) {
			var p = progress * 50;
			$('#progress').css('width', p + '%');
			$('#render_text').text(Math.ceil(p) + '%');	
		});
	});

	texter.api.toggleAnimation();
	start.innerHTML = 'stop';
});

$('#text').on('keyup', function() {
	texter.api.setText($('#text').val());
});

$('.font').on('click', function(evt){
	$('.font').removeClass('selected');

	texter.api.setTextOption('font', this.attributes['data-font'].value);
	texter.api.setTextOption('weight', this.attributes['data-bold'] ? 'bold' : 'normal');
	texter.api.setText($('#text').val());
	this.classList.add('selected');
});

$('.font').each(function() {
	if (this.classList.contains('selected')){
		texter.api.setTextOption('font', this.attributes['data-font'].value);
		texter.api.setTextOption('weight', this.attributes['data-bold'] ? 'bold' : 'normal');
	}
});

var unselect = function() {
	var selected = $('button.selected').each(function() {
		this.classList.remove('selected');
	});
}

$('#start').on('click', function(evt) {
	texter.api.toggleAnimation();

	if (texter.api.isAnimating()) {
		start.innerHTML = 'stop';
	} else {
		start.innerHTML = 'start';
	}
});

$('#axis_x').on('click', function(evt){
	evt.preventDefault();

	if (!this.classList.contains('selected')) {
		unselect();
		this.classList.add('selected');
		texter.api.setAxis('x');
		texter.api.setText($('#text').val());
	}
});

$('#axis_y').on('click', function(evt){
	evt.preventDefault();

	if (!this.classList.contains('selected')) {
		unselect();
		this.classList.add('selected');
		texter.api.setAxis('y');
		texter.api.setText($('#text').val());
	}
});

$('#spin').on('click', function(evt){
	evt.preventDefault();

	if (!this.classList.contains('selected')) {
		unselect();
		this.classList.add('selected');
		texter.api.setAxis('spin');
		texter.api.setText($('#text').val());
	}
});

$('#wave').on('click', function(evt){
	evt.preventDefault();

	if (!this.classList.contains('selected')) {
		unselect();
		this.classList.add('selected');
		texter.api.setAxis('wave');
		texter.api.setText($('#text').val());
	}
});