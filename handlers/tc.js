var TextToCanvas = new function()
{
	var self = this;
	
	var canvasContainer;
  	var context;

  	var DEF_FONT_FAMILY;
  	var DEF_FONT_SIZE = 18;
	var fontSize = localStorage.getItem('DEF_FONT_SIZE') ? parseInt(localStorage.getItem('DEF_FONT_SIZE')) : DEF_FONT_SIZE;

  	var x = 0;
  	var y = 0;
  	var canvasHeight;

  	self.init = function(parent, content, options)
  	{
  		var css = document.createElement("style");
		css.id = "canvas_css";
		css.innerHTML = self.css;
		document.head.appendChild(css);

		//canvas tools
		var canvasTools = document.createElement("div");
		canvasTools.className = "canvas-tools";

		var span = document.createElement("span");
		span.textContent = "Font Size: ";
		canvasTools.appendChild(span);

		var btnGroup = document.createElement('div');
		btnGroup.classList.add('btn-group');

		var decreaseBtn = document.createElement("button");
		decreaseBtn.className = 'btn btn-secondary';
		decreaseBtn.textContent = "-";
		decreaseBtn.addEventListener("click", self.decreaseSize);
		btnGroup.appendChild(decreaseBtn);

		var resetBtn = document.createElement("button");
		resetBtn.className = 'btn btn-secondary';
		resetBtn.textContent = "Reset";
		resetBtn.addEventListener("click", self.resetSize);
		btnGroup.appendChild(resetBtn);

		var increaseBtn = document.createElement("button");
		increaseBtn.className = 'btn btn-secondary';
		increaseBtn.textContent = "+";
		increaseBtn.addEventListener("click", self.increaseSize);
		btnGroup.appendChild(increaseBtn);

		// var button4 = document.createElement("button");
		// button4.textContent = "Print / Download as PDF";
		// button4.addEventListener("click", function() { window.print(); });
		// button4.style.marginLeft = "20px";
		// canvasTools.appendChild(button4);
		canvasTools.appendChild(btnGroup);

		parent.appendChild(canvasTools);


		//canvas container
  		canvasContainer = document.createElement("canvas");
  		canvasContainer.className = "canvas-container";
  		canvasContainer.width = parent.offsetWidth;
  		canvasContainer.height = 100;
  		parent.appendChild(canvasContainer);

  		context = canvasContainer.getContext("2d");
  		DEF_FONT_FAMILY = parent.style.fontFamily || "sans-serif";
  		canvasHeight = canvasContainer.height;

  		if(options) {
			x = options.x || 0;
			y = options.y || 0;

			if(options.styles) {
		  		for(var key in options.styles) {
					canvasContainer.style[key] = options.styles[key];
				}
	  		}
	  	}

  		self.content = content;

  		self.display();
  	};

  	self.display = function() {
		self.draw(x, y); //to get the height of the canvas based on content height
		canvasContainer.height = canvasHeight;
		self.draw(x, y); //to display the song with known height
  	};

  	self.draw = function(x, y) {

		context.clearRect(0, 0, canvasContainer.width, canvasContainer.height); //to clear canvas
		context.font = fontSize + "px " + DEF_FONT_FAMILY;
		context.textBaseline = "top";

        var words = self.content.split('\n');
        var line = '';

        for(var n = 0; n < words.length; n++) {
          	line = words[n];
          	var textWidth = context.measureText(line).width;

          	if(textWidth > canvasContainer.width) { //checking if the line wraps
          		self.wrapText(line, x, y);
          		y += (fontSize + fontSize / 2);
          	} else {
          		context.fillText(line, x, y);
          	}
          	y += (fontSize + fontSize / 2);
        }
        canvasHeight = y; //setting canvas height
  	};

  	self.wrapText = function(longLine, x, y)
  	{
  		var words = longLine.split(' ');
  		var line = '';
		for(var n = 0; n < words.length; n++) {
          	var text = line + words[n] + ' ';
          	var textWidth = context.measureText(text).width;

          	if(textWidth > canvasContainer.width && n > 0) {
	        	context.fillText(line, x, y);
	        	line = words[n] + ' ';
	        	y += (fontSize + fontSize / 4);
	        } else {
	        	line = text;
	        }
        }
		context.fillText(line, x, y);
  	};

	self.decreaseSize = function()
	{
		fontSize -= 2;
		localStorage.setItem('DEF_FONT_SIZE', fontSize);
		self.display();
	};

	self.increaseSize = function()
	{
		fontSize += 2;
		localStorage.setItem('DEF_FONT_SIZE', fontSize);
		self.display();
	};

	self.resetSize = function()
	{
		fontSize = DEF_FONT_SIZE;
		localStorage.setItem('DEF_FONT_SIZE', fontSize);
		self.display();
	};

};

