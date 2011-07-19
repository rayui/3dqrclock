var qrCodeURL;
var spiritTexture = "/assets/1pxwhite.gif";
var gl;
var imgArray = [];
var urlParams = {};

    function init()
    {
        // Initialize
        gl = initWebGL(
            // The id of the Canvas Element
            "example",
            // The ids of the vertex and fragment shaders
            "vshader", "fshader",
            // The vertex attribute names used by the shaders.
            // The order they appear here corresponds to their index
            // used later.
            [ "vNormal", "vColor", "vPosition"],
            // The clear color and depth values
            [ 0, 0, 0, 1 ], 10000);
        if (!gl) {
          return;
        }
        // Set some uniform variables for the shaders
        gl.uniform3f(gl.getUniformLocation(gl.program, "lightDir"), 0, 0, 1);
        gl.uniform1i(gl.getUniformLocation(gl.program, "sampler2d"), 0);
 
        // Enable texturing
        gl.enable(gl.TEXTURE_2D);
 
        // Create a box. On return 'gl' contains a 'box' property with
        // the BufferObjects containing the arrays for vertices,
        // normals, texture coords, and indices.
        gl.box = makeBox(gl);
 
        // Load an image to use. Returns a WebGLTexture object
        spiritTexture = loadImageTexture(gl, "/assets/1pxwhite.gif");
 
        // Create some matrices to use later and save their locations in the shaders
        gl.mvMatrix = new J3DIMatrix4();
        gl.u_normalMatrixLoc = gl.getUniformLocation(gl.program, "u_normalMatrix");
        gl.normalMatrix = new J3DIMatrix4();
        gl.u_modelViewProjMatrixLoc =
                gl.getUniformLocation(gl.program, "u_modelViewProjMatrix");
        gl.mvpMatrix = new J3DIMatrix4();
 
        // Enable all of the vertex attribute arrays.
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
 
        // Set up all the vertex attributes for vertices, normals and texCoords
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.box.vertexObject);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);
 
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.box.normalObject);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
 
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.box.texCoordObject);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
 
        // Bind the index array
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.box.indexObject);
 
        return gl;
    }
 
    width = -1;
    height = -1;
 
    function reshape(gl)
    {
        var canvas = document.getElementById('example');
        if (canvas.width == width && canvas.height == height)
            return;
 
        width = canvas.width;
        height = canvas.height;
 
        // Set the viewport and projection matrix for the scene
        gl.viewport(0, 0, width, height);
        gl.perspectiveMatrix = new J3DIMatrix4();
        gl.perspectiveMatrix.perspective(30, width/height, 1, 10000);
        gl.perspectiveMatrix.lookat(0, 0, 7, 0, 0, 0, 0, 1, 0);
    }
 
    function drawPicture(gl)
    {
        // Make sure the canvas is sized correctly.
        reshape(gl);
 
        // Clear the canvas
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
        // Make a model/view matrix.
        gl.mvMatrix.makeIdentity();
        gl.mvMatrix.rotate(20, 1,0,0);
        gl.mvMatrix.rotate(currentAngle, 0,1,0);
 
        // Construct the normal matrix from the model-view matrix and pass it in
        gl.normalMatrix.load(gl.mvMatrix);
        gl.normalMatrix.invert();
        gl.normalMatrix.transpose();
        gl.normalMatrix.setUniform(gl, gl.u_normalMatrixLoc, false);
 
        // Construct the model-view * projection matrix and pass it in
        gl.mvpMatrix.load(gl.perspectiveMatrix);
        gl.mvpMatrix.multiply(gl.mvMatrix);
        gl.mvpMatrix.setUniform(gl, gl.u_modelViewProjMatrixLoc, false);
 
        // Bind the texture to use
        gl.bindTexture(gl.TEXTURE_2D, spiritTexture);
 
        // Draw the cube
        gl.drawElements(gl.TRIANGLES, gl.box.numIndices, gl.UNSIGNED_BYTE, 0);
 
        // Show the framerate
        framerate.snapshot();
 
        currentAngle += incAngle;
        if (currentAngle > 360)
            currentAngle -= 360;
    }
 
    function start()
    {
        var c = document.getElementById("example");
        var w = Math.floor(window.innerWidth * 0.9);
        var h = Math.floor(window.innerHeight * 0.9);
 
        c.width = w;
        c.height = h;
 
        var gl = init();
        if (!gl) {
           return;
        }
 
        currentAngle = 0;
        incAngle = 0.5;
        framerate = new Framerate("framerate");
        var f = function() {
            window.requestAnimFrame(f, c);
            drawPicture(gl);
        };
        f();
 
    }

function timer() {
	var time = new Date().getTime() + 2000;
	var data = "DATE: " + new Date(time).toDateString() + String.fromCharCode(13) + "TIME: " + new Date(time).toTimeString() + String.fromCharCode(13) + '<a href="http://3dqrclock.com/?time=' + new Date(time).getTime() + '">Visit this time!</a>';
	qrCodeURL = 'http://www.bath.ac.uk/barcodes/qr_img.php?DATA=' + escape(data);
	imgArray.push(loadImageTexture(gl, qrCodeURL));
	if (imgArray.length > 2) {
		spiritTexture = imgArray.shift();
	}
}

(function () {
    var e,
        a = /\+/g,  // Regex for replacing addition symbol with a space
        r = /([^&=]+)=?([^&]*)/g,
        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
        q = window.location.search.substring(1);

    while (e = r.exec(q))
       urlParams[d(e[1])] = d(e[2]);
})();

$(document).ready(function(){
	setInterval(timer, 1000);
	start();
});
