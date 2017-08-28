var width, tHeight;
var occs = ["programmer", "designer", "prototyper", "creator", "data scientist", "student",
			"software developer", "thinker", "gamer", "writer", "consultant", "communicator"];

$(window).on("resize", function() {
	render();
});

var svg = d3.select(".top-content").append("svg").attr("width", "100%").attr("height", "100%"),
	tGroup = svg.selectAll(".content");

render();
window.setInterval(function(){
	$("#occ").text(occs[getRandomInt(0, occs.length)]);
}, 1500);

function render() {
	width = $(".container-fluid").width();
	$(".top-content").height(Math.max($(window).height() * 0.5, 500));
	$(".bottom-content").height($(window).height() * 0.5);
	tHeight = $(".top-content").height();

	buildTopContent();
}

function buildTopContent() {
	// DATA JOIN
	tGroup = tGroup.data([{i:"images/glasses.png",text:"I am a <tspan id='occ'>programmer</tspan>."}]);

	// ENTER
	ntc = tGroup.enter().append("g")
		.attr("class", "top-content-group");

	ntc.append("image")
		.attr("x:href", function(d){return d.i;});

	ntc.append("text")
		.html(function(d){return d.text;})
		.attr("class", "top-text");

	tGroup = tGroup.merge(ntc);

	tGroup
		.attr("transform", "translate(" + (width * 0.1) + "," + (tHeight * 0.1) + ")");

	tGroup.select("image")
		.attr("width", width * 0.8)
		.attr("height", tHeight * 0.6);
	
	tGroup.select("text")
		.attr("x", (width * 0.8) / 2)
		.attr("y", tHeight * 0.6)
		.attr("font-size", Math.min(40, width * 0.1));
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
  }
