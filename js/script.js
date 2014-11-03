var texter = new ThreeDTexter($('#text_container')[0]);

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

					texter.api.setColor(
						parseInt($('#primary-color').val().substr(1), 16), 
						parseInt($('#secondary-color').val().substr(1), 16));
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

		$('#progress').show();
		$('#render_text').text('Rendering');
		rendering = true;

		var gif = new GIF({
			workers: 4,
			quality: 8,
			workerScript: './js/gif-lib/gif.worker.js',
			transparent: '#fff'
		});
			
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

var text = 'hello world';

var update_text = function(){
	if (text != $('#text').val()) {
		text = $('#text').val();
		texter.api.setText(text);
	}
}

$('#text').on('keyup', update_text);

$('.font').on('click', function(evt){
	$('.font').removeClass('selected');

	texter.api.setTextOption('font', $(this).attributes['data-font'].value);
	texter.api.setTextOption('weight', $(this).attributes['data-bold'] ? 'bold' : 'normal');
	texter.api.setText($('#text').val());
	$(this).classList.add('selected');
	update_text();
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