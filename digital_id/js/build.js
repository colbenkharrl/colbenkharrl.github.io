var scenarios = [
	{gFile: "data/graphgoodnew.json", title: "Good New User", active: true},
	{gFile: "data/graphreturning.json", title: "Returning User"},
	{gFile: "data/graphsynthetic.json", title: "Synthetic User"},
	{gFile: "data/graphhighrisk.json", title: "High-risk Persona"},
	{gFile: "data/graphmalicious.json", title: "Malicious Behavior"}
];

$("body").attr("padding-top", "65px");

loadJSONFile(scenarios.length - 1, drawOnLoad);

function loadJSONFile(index, callback) {
	if (index >= 0) {
		var d = scenarios[index].gFile;
		d3v4.json(d, function(err, json) {
			if (err) throw err;
			scenarios[index].gData = json;
			if (index !== 0) { loadJSONFile(index - 1, callback); }
			else { callback(); }
		});
	}
}

function drawOnLoad() {
	//	TODO: data is finished loading, build visualization with active scenario
	var d = d3v4.select(".didPanel")._groups[0][0];
	initDigitalId(d, scenarios[0].gData);
	drawDigitalId(d, $(".didPanel").width(), 600);

	var buttonGroup = d3v4.select("#scenario-btns");
	var button = buttonGroup.selectAll(".scenario-btn")
		.data(scenarios)
		.enter().append("a")
			.attr("class", function(d,i) { return "navbar-brand scenario-btn" + (d.active ? " active" : ""); })
			.attr("id", function(d,i) { return "scn-" + i;})
			.text(function(d) { return d.title; })
			.on("click", function(d,i) {
				if (!d3v4.select(this).classed("active")) {
				switchScenario(i);
				d3v4.selectAll(".navbar-brand").classed("active", false);
				d3v4.select(this).classed("active", true);
				}
			});

	scenarios.forEach(function(s, i) {
		//	append button to navbar
		d3v4.select("#scenario-btns")
	});
}

function switchScenario(index) {
	scenarios.forEach(function(s, i) {
		if (index === i) {
			s.active = true;
			var v = vizLib[0];
			v.fetchBegin(s.gData);
			v.rebuildGraph();
			if (v.graph) {
				v.render($(".didPanel").width(), 600);
			}
		} else {
			s.active = false;
		}
	});
}