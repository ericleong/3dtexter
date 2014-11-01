

function $id(nm){
	return document.getElementById(nm);
}

function ThreeDTexter(){

	this.api = {version: 0.1};

	var opts = this.opts = {
		container: document.getElementById('text_container'),
		camera: null,
		group: null,
		scene:  null,
		renderer: null,
		text: {
			canvas: null,
			options: {
				size: 100,
				height: 60,
				hover: 10,
				curveSegments: 5,
				bevelThickness: 4,
				bevelSize: 2,
				bevelEnabled: false,
				font: "digital-7",
				weight: 'normal',
				textColor: 0xFF0000,
				sideColor: 0x0000FF
			}
		},
		wavePosition: 0,
		waveAngle: Math.PI / 6,
		rotationRate: Math.PI / 60,
		rotating: false,
		axis: "y"
	};

	var exports = {};

	this.setup = function(){
		opts.camera = new THREE.PerspectiveCamera( 60, 2, 50, 2000 );
		opts.camera.position.set( 0, 0, 500 );
		opts.scene = new THREE.Scene();
		// add subtle blue ambient lighting
		/*var ambientLight = new THREE.AmbientLight(0x000044);
		opts.scene.add(ambientLight);
		// directional lighting
		var directionalLight = new THREE.DirectionalLight(0xffffff);
		directionalLight.position.set(1.5, 1, 2).normalize();
		opts.scene.add(directionalLight);
		*/
	}

	this.drawTextInternal = function(text, text_options){

		if (text_options != null){
			for (var opt in text_options){
				opts.text.options[opt] = text_options[opt];
			}
		}

		/*
		var textShapes = new THREE.FontUtils.generateShapes( text, opts.text.options );

		var text3d = new THREE.ExtrudeGeometry( textShapes, opts.text.options );
		*/

		// material
		this.makeMaterial();

		var materials = [opts.text.options.sideMaterial, opts.text.options.textMaterial];
		var material = new THREE.MeshFaceMaterial(materials);

		// text
		if (opts.axis == "wave") {
			var width = 0;
			var text3d = new THREE.Object3D();

			for (var i = 0; i < text.length; i++) {

				if (text[i] == ' ') {
					width += 50;

					continue;
				}

				var letter3d = new THREE.TextGeometry(text[i], opts.text.options);
				letter3d.computeBoundingBox();

				var letterWidth = letter3d.boundingBox.max.x - letter3d.boundingBox.min.x;
				opts.verticalOffset = -0.5 * (letter3d.boundingBox.max.y - letter3d.boundingBox.min.y);

				var mesh = new THREE.Mesh(letter3d,  material);
				mesh.position.x = width;
				mesh.position.z = -opts.text.options.height / 2;

				width += letterWidth + 10;

				for (var face in mesh.geometry.faces) {
					if (mesh.geometry.faces[face].normal.z != 0) {
						mesh.geometry.faces[face].materialIndex = 1;
					}
				}

				text3d.add(mesh);
			}

			opts.width = Math.min(Math.max(0.5 * width, 500), 1000);

			text3d.translateX(-0.5 * width);

			this.setAxis(opts.axis);

			opts.mesh = text3d;
			opts.text.canvas = text3d;
		} else {
			var text3d = new THREE.TextGeometry(text, opts.text.options);
			text3d.computeBoundingBox();

			var centerOffset = -0.5 * (text3d.boundingBox.max.x - text3d.boundingBox.min.x);

			opts.width = Math.min(Math.max(0.5 * (text3d.boundingBox.max.x - text3d.boundingBox.min.x), 500), 1000);

			opts.mesh = new THREE.Mesh(text3d,  material);

			opts.mesh.position.x = centerOffset;

			for (var face in opts.mesh.geometry.faces) {
				if (opts.mesh.geometry.faces[face].normal.z != 0) {
					opts.mesh.geometry.faces[face].materialIndex = 1;
				}
			}

			this.setAxis(opts.axis);

			opts.text.canvas = opts.mesh;
		}
		
		return text;
	};

	this.makeMaterial = function(){
		opts.text.options.textColor = parseInt($id('primary-color').value.substr(1), 16);
		opts.text.options.sideColor = parseInt($id('secondary-color').value.substr(1), 16);

		opts.text.options.textMaterial = new THREE.MeshBasicMaterial({
			color: opts.text.options.textColor,
			shading: THREE.FlatShading,
			overdraw: 0.4
		});
		opts.text.options.sideMaterial = new THREE.MeshBasicMaterial({
			color: opts.text.options.sideColor,
			shading: THREE.FlatShading,
			overdraw: 0.4
		});
	};

	this.setAxis = function(axis) {
		if (axis == "x") {
			opts.camera.position.set(0, 0, opts.width);

			opts.mesh.position.y = -opts.text.options.size / 2;
			opts.mesh.position.z = -opts.text.options.height / 2;

			opts.mesh.rotation.x = 0;
			opts.mesh.rotation.y = 0;
		} else if (axis == "y") {
			opts.camera.position.set(0, opts.text.options.size / 2, opts.width);

			opts.mesh.position.y = 0;
			opts.mesh.position.z = -opts.text.options.height / 2;

			opts.mesh.rotation.x = 0;
			opts.mesh.rotation.y = 0;
		} else if (axis == "wave") {
			opts.camera.position.set(0, opts.text.options.size / 2, opts.width);

			// opts.mesh.position.y = 0;
			// opts.mesh.position.z = -opts.text.options.height / 2;

			opts.wavePosition = 0;

			for (var i = 0; i < opts.mesh.children.length; i++) {
				opts.mesh.children[i].position.y = opts.text.options.size * Math.sin(opts.wavePosition + opts.waveAngle * i);
			}
		}
	}

	var self = this;

	this.setupCanvas = function(){

		opts.group = new THREE.Object3D();
		opts.group.add( opts.text.canvas );

		opts.scene.add( opts.group );

		opts.renderer = new THREE.WebGLRenderer({
			preserveDrawingBuffer: true
		});
		opts.renderer.setSize( 800, 300 );

		opts.container.appendChild( opts.renderer.domElement );

	};

	this.bindEvents = function(){

		document.addEventListener( 'mousedown', onDocumentMouseDown, false );
		document.addEventListener( 'touchstart', onDocumentTouchStart, false );
		document.addEventListener( 'touchmove', onDocumentTouchMove, false );
		window.addEventListener( 'resize', onWindowResize, false );

	};
	
	var render = this.render = function(){
		// opts.group.rotation.y += ( opts.targetRotation - opts.group.rotation.y ) * 0.05;
		opts.renderer.render( opts.scene, opts.camera );
	};

	var animate = this.animate = function(){

		if (opts.rotating) {
			requestAnimationFrame(animate);
			if (opts.axis == "x") {
				opts.group.rotation.x += opts.rotationRate;
			} else if (opts.axis == "y") {
				opts.group.rotation.y += opts.rotationRate;
			} else if (opts.axis == "wave") {
				opts.wavePosition += opts.rotationRate;

				for (var i = 0; i < opts.mesh.children.length; i++) {
					opts.mesh.children[i].position.y = opts.text.options.size * Math.sin(opts.wavePosition + opts.waveAngle * i);
				}
			}
		}

		render();
	};


	this.api.capture = function(gif){
		var wasAnimating = opts.rotating;

		self.stop();

		var numFrames = 19;
		var delay = 100;
		var dAngle = 2 * Math.PI / (numFrames + 1);

		var canvas = document.getElementsByTagName('canvas')[0];

		function run_capture(){
			console.log('capturing frame: ' + (19 - numFrames));
			gif.addFrame(canvas, {copy: true, delay: delay});
		
			if (opts.axis == "x") {
				opts.group.rotation.x += dAngle;
			} else if (opts.axis == "y") {
				opts.group.rotation.y += dAngle;
			} else if (opts.axis == "wave") {
				opts.wavePosition += dAngle;

				for (var i = 0; i < opts.mesh.children.length; i++) {
					opts.mesh.children[i].position.y = opts.text.options.size * Math.sin(opts.wavePosition + opts.waveAngle * i);
				}
			}
			render();

			setTimeout(function(){
				if (numFrames-- > 0){
					run_capture();
				} else {
					if (wasAnimating) {
						opts.rotating = true;
						self.animate();
					}

					gif.render();
				}
			}, delay);
		}

		run_capture();
	}

	this.reset = function() {
		opts.group.rotation.x = 0;
		opts.group.rotation.y = 0;
	}

	this.stop = function() {
		self.reset();
		opts.rotating = false;

		render();
	}
   
	// actually init
	this.setup();
	this.drawTextInternal('hello world');
	this.setupCanvas();
	this.render();
	this.animate();

	this.api.setText = function(text, options){
		opts.group.remove(opts.text.canvas);
		if (text != null && text.length > 0) {
			self.drawTextInternal(text, options);
			opts.group.add(opts.text.canvas);
		}
		// self.render();
	}
	this.api.setTextOption = function(option, value){
		self.opts.text.options[option] = value;
	}
	this.api.getTextOption = function(option){
		return self.opts.text.options[option];
	}
	this.api.getTextOptions = function(){
		return self.opts.text.options;
	}
	this.api.toggleAnimation = function() {
		opts.rotating = !opts.rotating;

		if (!opts.rotating) {
			self.stop();
		} else {
			self.animate();
		}
	}
	this.api.isAnimating = function() {
		return opts.rotating;
	}
	this.api.setAxis = function(axis) {
		self.reset();

		opts.axis = axis;
	}

	return self;
}