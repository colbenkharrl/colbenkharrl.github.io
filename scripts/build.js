var occs = [
	{title: "student",img: "images/graphics/student.png"},
	{title: "programmer",img:"images/graphics/keyboard.png"},
	{title: "thinker",img:"images/graphics/thinking.png"},
	{title: "designer", img:"images/graphics/design.png"},
	{title: "data scientist",img:"images/graphics/harddrive.png"},
	{title: "gamer", img: "images/graphics/controller.png"},
	{title: "creator", img:"images/graphics/brain.png"},
	{title: "prototyper",img:"images/graphics/tools.png"},
	{title: "communicator", img:"images/graphics/phone.png"},
	{title:"consultant",img:"images/graphics/meeting.png"},
	{title:"writer",img:"images/graphics/typewriter.png"}
]

var width, mid, tHeight;

$(window).on("resize", function() {
	render();
});

var svg = d3.select(".top-content").append("svg").attr("width", "100%").attr("height", "100%"),
	tGroup = svg.selectAll(".content");

render();

var inc = 1;
window.setInterval(function(){
	var occ = occs[inc];
	$("#occ").text(occ.title);
	tGroup.selectAll(".graphic")
		.attr("xlink:href", occ.img);
	inc = (inc === occs.length - 1) ? 0 : (inc + 1);
}, 1500);

function render() {
	width = $(".container-fluid").width();
	mid = width / 2;
	$(".top-content").height(Math.max($(window).height() * 0.5, 500));
	$(".bottom-content").height($(window).height() * 0.5);
	tHeight = $(".top-content").height();

	buildTopContent();
}

function buildTopContent() {

	var picHeight = tHeight * 0.6;
	var groupWidth = picHeight * 2.21;
	// DATA JOIN
	tGroup = tGroup.data([{i:"images/glasses.png",text:"I am a <tspan id='occ'>student</tspan>."}]);

	// ENTER
	ntc = tGroup.enter().append("g")
		.attr("class", "top-content-group");

	ntc.append("image")
		.attr("xlink:href", function(d){return d.i;})
		.attr("class", "glasses-pic");

	ntc.append("image")
		.attr("xlink:href", "images/graphics/student.png")
		.attr("class", "lens-graphic-right graphic");

	ntc.append("image")
		.attr("xlink:href", "images/graphics/student.png")
		.attr("class", "lens-graphic-left graphic");

	ntc.append("text")
		.html(function(d){return d.text;})
		.attr("class", "top-text");

	tGroup = tGroup.merge(ntc);

	tGroup
		.attr("transform", "translate(" + (mid - groupWidth / 2) + "," + (tHeight * 0.1) + ")");

	tGroup.select(".glasses-pic")
		.attr("x", 0)
		.attr("width", groupWidth)
		.attr("height", picHeight);

	var overWidth = groupWidth > 660;
	var dimensions = overWidth ? 170 : groupWidth * 0.26;

	tGroup.selectAll(".lens-graphic-right")
		.attr("width", dimensions)
		.attr("height", dimensions)
		.attr("x", groupWidth / 2 + 80)
		.attr("y", 75);

	tGroup.selectAll(".lens-graphic-left")
		.attr("width", dimensions)
		.attr("height", dimensions)
		.attr("x", groupWidth / 2 - 80 - dimensions)
		.attr("y", 75);
	
	tGroup.select("text")
		.attr("x", groupWidth / 2)
		.attr("y", tHeight * 0.6)
		.attr("font-size", Math.min(40, width * 0.1));
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
  }
