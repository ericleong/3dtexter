

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
				height: 30,
				hover: 10,
				curveSegments: 5,
				bevelThickness: 4,
				bevelSize: 2,
				bevelEnabled: true,
				font: "digital-7",
				weight: 'normal',
				textColor: 0xFF0000,
				sideColor: 0x0000FF
			}
		},
		targetRotation: 0,
		rotationRate: Math.PI / 60,
		rotating: false,
		axis: "y"
	};

	var exports = {};

	this.setup = function(){
		opts.camera = new THREE.PerspectiveCamera( 60, $('.preview').width() / $('.preview').height(), 50, 1000 );
		opts.camera.position.set( 0, 150, 500 );
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

		var text3d = new THREE.TextGeometry(text, opts.text.options);

		text3d.computeBoundingBox();
		//console.log(text3d.boundingBox);

		var centerOffset = -0.5 * ( text3d.boundingBox.max.x - text3d.boundingBox.min.x );
		opts.verticalOffset = -0.5 * ( text3d.boundingBox.max.y - text3d.boundingBox.min.y );

		this.makeMaterial();

		var materials = [opts.text.options.sideMaterial, opts.text.options.textMaterial];

		var material = new THREE.MeshFaceMaterial(materials);

		opts.mesh = text = new THREE.Mesh( text3d,  material);

		opts.mesh.position.x = centerOffset;

		for (var face in text.geometry.faces) {
			if (text.geometry.faces[face].normal.z != 0) {
				text.geometry.faces[face].materialIndex = 1;
			}
		}

		opts.text.canvas = text;

		this.setAxis(opts.axis);
		
		return text;
	};

	this.makeMaterial = function(){
		opts.text.options.textColor = parseInt($id('primary-color').value.substr(1), 16);
		opts.text.options.sideColor = parseInt($id('secondary-color').value.substr(1), 16);

		opts.text.options.textMaterial = new THREE.MeshBasicMaterial( {color: opts.text.options.textColor, shading: THREE.FlatShading} );
		opts.text.options.sideMaterial = new THREE.MeshBasicMaterial( {color: opts.text.options.sideColor, shading: THREE.FlatShading} );
	};

	this.setAxis = function(axis) {
		if (axis == "x") {
			opts.camera.position.set( 40, 0, 500 );

			opts.mesh.position.y = 0;

			opts.mesh.position.z = -opts.text.options.size / 2;

			opts.mesh.rotation.x = 20;
			opts.mesh.rotation.y = Math.PI * 2;

			opts.axis = "x";
		} else {
			opts.camera.position.set( 100, 150, 500 );

			opts.mesh.position.y = 40;
			opts.mesh.position.z = -opts.text.options.height / 2;

			opts.mesh.rotation.x = Math.PI * 2;
			opts.mesh.rotation.y = 0;

			opts.axis = "y";
		}
	}

   	var self = this;

	this.setupCanvas = function(){

		opts.group = new THREE.Object3D();
		opts.group.add( opts.text.canvas );

		opts.scene.add( opts.group );

		opts.renderer = new THREE.CanvasRenderer();
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
			requestAnimationFrame( animate );
			if (opts.axis == "x") {
				opts.group.rotation.x += opts.rotationRate;
			} else {
				opts.group.rotation.y += opts.rotationRate;
			}
		}
		render();
	};


	this.api.capture = function(gif){
		self.stop();

		var numFrames = 19;
		var dAngle = 2 * Math.PI / (numFrames + 1);

		var canvas = document.getElementsByTagName('canvas')[0]

		function run_capture(){
			console.log('captureing');
			gif.addFrame(canvas, {copy: true,delay: 100});
		
			if (opts.axis == "x") {
				opts.group.rotation.x += dAngle;
			} else {
				opts.group.rotation.y += dAngle;
			}
			render();

			setTimeout(function(){
				if (numFrames-- > 0){
					run_capture();
				} else {
					gif.render();
				}
			}, 100);

		}

		run_capture();
		
		

	}

	this.stop = function() {
		opts.group.rotation.x = 0;
		opts.group.rotation.y = opts.targetRotation;
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
   		self.render();
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
   		if (opts.rotating) {
   			self.stop();
   			self.setAxis(axis);
   			self.api.toggleAnimation();
   		} else {
   			self.setAxis(axis);
   		}
   	}


   	return self;
}


function GifRenderer(){

	// "class" inspired by github.com/h5bp/mothereffinganimatedgif

	this.utils = {
		rawDataURL: function(data) {
        	return Base64.encode(data);
        },
        dataURL: function(rawData){
        	return 'data:image/gif;base64,' + rawData;
        },
        binaryURL: function(data) {
        	window.URL = window.URL || window.webkitURL;
        	var blob = new Blob([data], {type: 'image/gif'});
        	return window.URL.createObjectURL(blob);
        }
    };

	this.frames = [];
	this.delay = 200;
	var self = this;

	this.update_progress = function(progress){
		console.log('Progress: ' + progress);
	};

	this.set_delay = function(new_delay){
		this.delay = new_delay;
	}

	this.add_frame = function(canvas){
		console.log(canvas);
		var context = canvas.getContext('2d');
		this.frames.push(context.getImageData(0, 0, canvas.height, canvas.width));
	}

	this.done = function(data_callback, error_callback){

		var gifWorker = new Worker("js/gif-libs/omggif-worker.js");
		this.gifWorker = gifWorker;

		gifWorker.addEventListener('message', function (e) {
            if (e.data.type === "progress") {
                // Percent done, 0.0-0.1
                self.update_progress(e.data.data);
            } else if (e.data.type === "gif") {
                var info = e.data;
                info.binaryURL = self.utils.binaryURL( e.data.data );
                info.rawDataURL = self.utils.rawDataURL( e.data.data );
                info.dataURL = self.utils.dataURL( info.rawDataURL );
                data_callback(info);
            }
        }, false);

        gifWorker.addEventListener('error', function (e) {
            error_callback(e);
            gifWorker.terminate();
        }, false);

        gifWorker.postMessage({
            frames: this.frames,
            delay: this.delay,
            matte: [255, 255, 255],
            transparent: [0, 255, 0]
        });
	}

	

}
