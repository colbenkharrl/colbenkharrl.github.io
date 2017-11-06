//  array of visualizations
var vizLib = [];

/**
 * drawDigitalId(elt,w,h) re-sizes and re-scales
 * provided visualization with the provided width and height
 */
function drawDigitalId(elt, w, h) {
    if (vizLib.length !== 0 && w > 0 && h > 0) {
        vizLib.forEach(function (v) {
            if (v.div === elt) {
                v.render(w, h);
            }
        });
    }
}

/**
 * initDigitalId(elt, json) initializes and renders a new
 * visualization in an SVG element based on the JSON data
 * passed in, and then nests that SVG within the passed div element
 */
function initDigitalId(elt, json, events) {
    var nViz = new viz(elt);
    vizLib.push(nViz);
	nViz.fetchBegin(json, events);
	nViz.eventData = events;
}

/**
 * viz(elt) constructs a new visualization object and nests
 * the corresponding SVG element within the passed in div element
 */
function viz(elt) {
    // reference to self for use within anonymous functions
    var v = this;

    // parent div element wrapping the visualization SVG
    this.div = elt;

    // initialization of the SVG element
	this.svg = d3v4.select(this.div).append("svg")
		.attr("class", "digital-id")
		.attr("height", "600")
		.attr("width", "100%");

    
    /**
     * the visualization is divided into 5 modular panels,
     * this object specifies scales for sizing and positioning
     * of panels relative to the container's width and height
     */
    this.layoutScales = {
        legendPanel: {
            widthScale: 0.1,
            heightScale: 0.6,
            xScale: 0,
            yScale: 0.4
        },
        graphPanel: {
            widthScale: 0.9,
            heightScale: 0.83,
            xScale: 0.1,
            yScale: 0.17
        },
        entityPanel: {
            widthScale: 0.3,
            heightScale: 0.22,
            xScale: 0,
            yScale: 0.18
        },
        didPanel: {
            widthScale: 1,
            heightScale: 0.11,
            xScale: 0,
            yScale: 0.06
        },
        tabPanel: {
            widthScale: 1,
            heightScale: 0.06,
            xScale: 0,
            yScale: 0
        }
    };

    /**
     * mapping of entity types from API JSON data to type names
     * and type codes that the visualization code understands
     */
    this.typeMapping = {
        "digital_id": {
            typeCode: "did",
            type: "Digital ID",
            image: "public/images/did"
        },
        "device_id": {
            typeCode: "exactID",
            type: "Exact ID",
            image: "public/images/device"
        },
        "fuzzy_device_id": {
            typeCode: "smartID",
            type: "Smart ID",
            image: "public/images/device"
        },
        "account_email": {
            typeCode: "email",
            type: "Email",
            image: "public/images/mail"
        },
        "account_number": {
            typeCode: "accnum",
            type: "Account Number",
            image: "public/images/account"
        },
        "account_login": {
            typeCode: "acclog",
            type: "Account Login",
            image: "public/images/account"
        },
        "account_name": {
            typeCode: "accname",
            type: "Account Name",
            image: "public/images/account"
        },
        "account_telephone": {
            typeCode: "acctel",
            type: "Account Name",
            image: "public/images/account"
        },
        "ssn_hash": {
            typeCode: "ssn",
            type: "SSN Hash",
            image: "public/images/account"
        },
        "shipping_address": {
            typeCode: "shipaddr",
            type: "Shipping Address",
            image: "public/images/address"
        },
        "account_address": {
            typeCode: "accaddr",
            type: "Account Address",
            image: "public/images/address"
        },
        "cc_number_hash": {
            typeCode: "cch",
            type: "Credit Card Hash",
            image: "public/images/card"
        },
        "ach_number": {
            typeCode: "achnum",
            type: "ACH Number",
            image: "public/images/account"
        }
    }

    /**
     * definition and data source for the
     * node icons drawn in the legend
     */
    this.nodeLegend = [
        {
            type: "Smart ID",
            typeCode: "smartID",
            id: "0",
            image: "public/images/device"
        },
        {
            type: "Exact ID",
            typeCode: "exactID",
            id: "1",
            image: "public/images/device"
        },
        {
            type: "Account Email",
            typeCode: "email",
            id: "2",
            image: "public/images/mail"
        },
        {
            type: "Account Name",
            typeCode: "accname",
            id: "3",
            image: "public/images/account"
        },
        {
            type: "Account Login",
            typeCode: "acclog",
            id: "4",
            image: "public/images/account"
        },
        {
            type: "Account Number",
            typeCode: "accnum",
            id: "5",
            image: "public/images/account"
        },
        {
            type: "Account Telephone",
            typeCode: "acctel",
            id: "6",
            image: "public/images/telephone"
        },
        {
            type: "Account Address",
            typeCode: "accaddr",
            id: "7",
            image: "public/images/address"
        },
        {
            type: "Shipping Address",
            typeCode: "shipaddr",
            id: "8",
            image: "public/images/address"
        },
        {
            type: "SSN Hash",
            typeCode: "ssn",
            id: "9",
            image: "public/images/account"
        },
        {
            type: "ACH Number",
            typeCode: "achnum",
            id: "10",
            image: "public/images/money"
        },
        {
            type: "Credit Card Hash",
            typeCode: "cch",
            id: "11",
            image: "public/images/card"
        },
        {
            type: "Local Entities",
            typeCode: "local",
            id: "12",
            scope: true
        },
        {
            type: "Global Entities",
            typeCode: "global",
            id: "13",
            scope: true
        }
    ];

    /**
     * definition and data source for the
     * tab interface at the top of the visualization
     */
    this.buttons = [
        {
            label: "Digital ID",
            button: "did",
            img: "public/images/did-tab-icon.svg",
            textOffset: 40,
            active: true
        },
        {
            label: "Relationships",
            button: "entity-rel",
            img: "public/images/share-tab-icon.svg",
            textOffset: 25
        }

    ];

    /**
     * definition and data source for the digital ID attributes
     * displayed in the colored content boxes above the graph
     */
    this.didAttributes = [
        {
            type: "confidence",
            title: "Confidence Score",
            data: "loading...",
            img: "public/images/confidence-icon.png"
        },
        {
            type: "entities",
            title: "Entities",
            data: "loading...",
            img: "public/images/node-icon.svg"
        },
        {
            type: "first-seen",
            title: "First Seen",
            data: "loading...",
            img: "public/images/cal-icon.svg"
        },
        {
            type: "last-seen",
            title: "Last Seen",
            data: "loading...",
            img: "public/images/clock-icon.svg"
        }
    ];

    /**
     * definition and data source for the
     * entity details panel drawn above the legend
     */
    this.entityDetails = [
        {
            label: "Entity Type",
            data: "loading...",
            type: "type"
        },
        {
            label: "First Seen",
            data: "loading...",
            type: "first-seen"
        },
        {
            label: "Last Seen",
            data: "loading...",
            type: "last-seen"
        },
        {
            label: "Scope",
            data: "loading...",
            type: "scope"
        }
    ];
    /**
     * definition and data source for the toggle controls viewable
     * below the legend
     */
    this.toggleData = [
        {title:"Hide Labels", click: function(){v.hideLabels(this);}, code:"label"}, 
        {title:"Show Risk Profile", click: function(){v.showRiskProfile(this);}, code:"risk"}
    ]

    /**
     * definition and data source for the date slider
     * including scaling for endpoints and current state
     */
    this.sliderData = {
        endpoints: [
            {x: 0.1, y: 0.5},
            {x: 0.9, y: 0.5}
        ],
        state: 1.0
    }

    // toggle between graph states (did, entity relationship)
    this.did = true;

    // toggle between graph and dashboard
    this.graph = true;

    // datetime formatter
    this.formatDay = d3v4.timeFormat("%B %d, %Y"); 

    // color scale for risk profile
    this.color = d3v4.scaleSequential(d3v4.interpolateRdYlGn);

    // for handling of initial lode behaviors
    this.firstDraw = true;

    // toggle between showing and hiding labels and risk profile
    this.labeled = false;
    this.riskProfile = false;

    // filter list for node types
    this.typeFilters = [];

    // filter list for node scopes
    this.scopeFilters = [];

    // D3 force simulation for graph
    this.simulation = d3v4.forceSimulation()
        .force("link", d3v4.forceLink()
            .id(function (d) {
                return d.id;
            })
            .strength(0.75))
        .force("charge", d3v4.forceManyBody()
            .strength(function (d) {
                return -1000;
            }))
        .alphaTarget(1);

    // SVG groups for the 5 content panels
    this.graphGroup = this.svg.append("g").attr("class", "graph-group"),
    this.tabGroup = this.svg.append("g").attr("class", "button-group")
    this.legendGroup = this.svg.append("g").attr("class", "legend-group"),
    this.entityGroup = this.svg.append("g").attr("class", "entity-group"),
    this.didGroup = this.svg.append("g").attr("class", "did-group");

    // data-driven elements drawn or updated on rendering
    this.tabs = this.tabGroup.selectAll(".button-tab"),
    this.stateNav = this.tabGroup.selectAll(".tab-bar"),
    this.details = this.didGroup.selectAll(".did-detail"),
    this.enDetails = this.entityGroup.selectAll(".entity-detail"),
    this.lNode = this.legendGroup.append("g").selectAll(".legendNode"),
    this.lLink = this.legendGroup.append("g").selectAll(".legendLink"),
    this.labelToggle = this.legendGroup.append("g").selectAll(".labelToggle"),
    this.link = this.graphGroup.append("g").selectAll(".link"),
    this.node = this.graphGroup.append("g").selectAll(".node"),
    this.iconGroup = this.graphGroup.append("g").selectAll(".iconGroup"),
    this.labelGroup = this.graphGroup.append("g").selectAll(".labelGroup");

    /**
     * fetchBegin(json) parses and formats the passed JSON string
     * and translates it into a format d3v4.js can comprehend
     */
    this.fetchBegin = function (/*json*/apiData, events) {
        // parse the JSON string into an object
		// var apiData = JSON.parse(json);
		
		if (events) {this.eventData = events;}

        /**
         * The visualization code requires data in a particular format,
         * the following graph object is constructed from the API JSON
         * and is the translation between the API format and the viz format
         */
        var graph = {};
        graph.nodes = [];
        graph.didLinks = [];
        graph.entityLinks = [];

        // save largest event count from nodes and links
        this.maxNodeCount = 0;
        this.maxDIDCount = 0;
        this.maxEntityCount = 0;

        // store needed properties from nodes for drawing links
        var nodeDict = {};

        // store node ids with type errors
        var errID = [];

        // add entity nodes from entity array
        apiData.entities.forEach(function (e) {
            if (!v.typeMapping[e.attributeName]) {
                console.log("type error: unsupported entity '" + e.attributeName + "' detected");
                errID.push(e.id);
            } else {
                var c = {
                    type: v.typeMapping[e.attributeName].type,
                    typeCode: v.typeMapping[e.attributeName].typeCode,
                    scope: v.typeMapping[e.attributeName].typeCode === "did" ? "id" : e.scope
                };
                graph.nodes.push({
                    "attributeName": e.attributeName,
                    "type": c.type,
                    "typeCode": c.typeCode,
                    "data": e.name,
                    "detail": e.os,
                    "lastSeen": (e.lastSeen === '0' || e.lastSeen === 0 || !e.lastSeen ) ? false : v.formatDay(new Date(e.lastSeen * 1000)),
                    "firstSeen": (e.firstSeen === '0' || e.firstSeen === 0 || !e.firstSeen ) ? false : v.formatDay(new Date(e.firstSeen * 1000)),
                    "scope": c.scope,
                    "image": v.nodeImage(v.typeMapping[e.attributeName].image, c.scope),
                    "membership": e.membership || "did",
                    "id": e.id,
                    "risk": e.risk,
                    "riskScale": (Number(e.risk) + 100) / 200,
                    "confidence": e.confidence
                });
                nodeDict[e.id] = {scope: c.scope, type: c.typeCode, membership: e.membership};
                v.maxNodeCount = Math.max(v.maxCount, e.count);
            }
        });

        // incrementer for link ids
        var idInc = 0;

        // add digital ID links
        apiData.relationships_digital_id.forEach(function (r) {
            if (errID.includes(r.id1) || errID.includes(r.id2)) {
                console.log("type error: removing link " + r.id1 + "-" + r.id2);
            } else {
                graph.didLinks.push({
                    "source": r.id1,
                    "target": r.id2,
                    "id": idInc,
                    "count": r.count,
                    "nodeTypes": [nodeDict[r.id1].type, nodeDict[r.id2].type],
                    "nodeScopes": [nodeDict[r.id1].scope, nodeDict[r.id2].scope]                });
                v.maxDIDCount = Math.max(v.maxDIDCount, r.count);
                idInc++;
            }
        });

        // reset incrementer
        idInc = 0;

        // add related entity links
        apiData.relationships_related_entities.forEach(function (r) {
            if (errID.includes(r.id1) || errID.includes(r.id2)) {
                console.log("type error: removing link " + r.id1 + "-" + r.id2);
            } else {
                graph.entityLinks.push({
                    "source": r.id1,
                    "target": r.id2,
                    "id": idInc,
                    "count": r.count,
                    "nodeTypes": [nodeDict[r.id1].type, nodeDict[r.id2].type],
                    "nodeScopes": [nodeDict[r.id1].scope, nodeDict[r.id2].scope]
                });
                v.maxEntityCount = Math.max(v.maxEntityCount, r.count);
                idInc++;
            }
        });

        // shift digital ID node to the front of the node array
        graph.nodes.sort(function(x,y){ return x.typeCode === "did" ? -1 : (y.typeCode === "did" ? 1 : 0); });

        // set images for legend nodes
        this.nodeLegend.forEach(function(n){ n.imageColored = v.nodeImage(n.image, n.typeCode); });

        /**
         * graph data is saved twice, once for use as the working data set
         * for the graph visualization, and once again for reference when
         * re-adding elements to the graph data after being deleted
         */
        this.graphData = JSON.parse(JSON.stringify(graph));
        this.graphStore = JSON.parse(JSON.stringify(graph));

        // store node counts by type and scope
        this.scopeCounts = this.scopeCount();
        this.typeCounts = this.typeCount();

        // apply default filters
        this.filter();

        // populate the data fields for the digital ID attribute panels
        this.didAttributes[0].data = this.graphStore.nodes[0].confidence + " Percent";
        this.didAttributes[1].data = this.scopeCounts.local + " local, " + this.scopeCounts.global + " global";
        setOrHideDateAttribute(this.graphStore.nodes[0].lastSeen, 3);
        setOrHideDateAttribute(this.graphStore.nodes[0].firstSeen, 2);

        this.firstDraw = true;

        function setOrHideDateAttribute(d, i) {
            if (d) { v.didAttributes[i].data = d; }
            else { v.didAttributes.splice(i, 1); }
        }
    }

    /**
     * render(w,h) is the starting point for redrawing the visualization
     * with the provided width and height. it resets properties that are dynamic
     * to container size and rebuilds the panels
     */
    this.render = function (w, h) {
        // set visualization dimensions
        this.width = w;
        this.height = h;

        //  set SVG height
        this.svg.attr("height", this.height);

        // set scale for legend spacing
        this.lScale = ((this.height * this.layoutScales.legendPanel.heightScale) - 90) / this.nodeLegend.length;

        // set base radius
        this.radius = this.lScale * 0.75;

        // set graph panel dimensions
        this.gWidth = (this.width * this.layoutScales.graphPanel.widthScale);
        this.gHeight = (this.height * this.layoutScales.graphPanel.heightScale);

        // update force simulation properties dependant on graph dimensions
        this.simulation.force("center", d3v4.forceCenter(this.gWidth / 2, this.gHeight / 2));
        this.simulation.force("link").distance(function (d) {
            var min = Math.min(v.gHeight, v.gWidth)
            return v.did ? (1 - d.count / v.maxDIDCount) * min * 0.2 + min * 0.2 : min * 0.225;
        });

        // begin the drawing/updating of the visualization panels
        this.update();

        if (this.firstDraw) {
            this.firstDraw = false;

            this.selectDefault();
            setTimeout(function() {
                v.update();
            }, 500);
        }
    }

    /**
     * selectDefault() handles the default selection of states and nodes,
     * namely it selects the digital ID graph state, and then selects the
     * digital ID node
    */
    this.selectDefault = function() {
        // on first render, the digital ID node should be selected
        this.selectNode(this.graphStore, this.graphStore.nodes[0].id);
    }

    /**
     * update() chronologically builds the visualization panels
     * in an order that decides the stacking hierarchy of elements,
     * using the data and layout scale passed in
     */
    this.update = function (noGraph) {
        if (!noGraph) {
            this.buildTabs(this.buttons, this.layoutScales.tabPanel);
        }
        this.buildDIDAttributes(this.didAttributes, this.layoutScales.didPanel);
        this.buildGraph(this.graphData, this.layoutScales.graphPanel);
        this.buildEntityDetail(this.entityDetails, this.layoutScales.entityPanel);
        this.buildLegend(this.nodeLegend, this.layoutScales.legendPanel);
        /* this.buildSlider(this.sliderData, this.layoutScales.sliderPanel); */
    }

    /**
     * buildTabs(data, scale) draws/updates and repositions all elements within
     * the tabGroup with the provided data and scale
     */
    this.buildTabs = function (data, scale) {
        /**
         * update pattern for the gray rectangle that serves as the
         * background for the tab bar
         */

        // DATA JOIN
        this.stateNav = this.stateNav.data([0]);

        // EXIT
        this.stateNav.exit().remove();

        // ENTER
        this.stateNav = this.stateNav.enter().append("rect")
            .attr("class", "tab-bar")
            .attr("x", 0)
            .attr("y", 0)
            .attr("fill", "#e9e9e9")
            .merge(this.stateNav);

        // UPDATE
        this.stateNav
        .attr("width", this.width)
        .attr("height", this.height * scale.heightScale);

        /**
         * update pattern for the tab groups in the tab bar, including the
         * rectangle and label text
         */

        // DATA JOIN
        this.tabs = this.tabs.data(data);

        // EXIT
        this.tabs.exit().remove();

        // ENTER

        // SVG group for each tab
        var newTabs = this.tabs.enter().append("g")
            .attr("class", "button-tab")
            .attr("transform", function (d, i) {
                return "translate(" + (i * 160) + "," + (v.height * scale.yScale) + ")";
            })
            .on("click", function (d) {
                if (!d.active) {
                    v.selectState(d3v4.select(this), d);
                }
            });

        // tab button shape
        newTabs.append("rect")
            .attr("width", 160)
            .attr("height", this.height * scale.heightScale)
            .attr("x", 0)
            .attr("y", 0);

        // tab icon
        newTabs.append("image")
            .attr("xlink:href", function(d){return d.img;})
            .attr("x", function(d){return d.textOffset;})
            .attr("y", Math.round(this.height * scale.heightScale * 0.22))
            .attr("width", Math.round(this.height * scale.heightScale * 0.5))
            .attr("height", Math.round(this.height * scale.heightScale * 0.5))
            .attr("fill", "#4D4D4D");

        // tab button label text
        newTabs.append("text")
            .attr("class", "tabText")
            .attr("x", function(d){return d.textOffset + (v.height * scale.heightScale * 0.5) + 10 })
            .attr("y", scale.heightScale * this.height / 2)
            .attr("dominant-baseline", "middle")
            .attr("fill", "black")
            .attr("font-size", this.height * scale.heightScale * 0.4)
            .text(function (d) {
                return d.label;
            });

        // MERGE UPDATE + ENTER
        this.tabs = this.tabs.merge(newTabs);

        // UPDATE
        this.tabs
            .attr("cursor", function(d) { return d.active ? "default" : "pointer"; })

        this.tabs.selectAll("rect")
            .attr("fill", function(d) {return d.active ? "#F4F4F4" : "#e9e9e9"; });

        // translate tab group to the appropriate position
        this.tabGroup.attr("transform", function (d) {
            return "translate(" + (v.width * scale.xScale) + "," + (v.height * scale.yScale) + ")";
        });
    }

    /**
     * buildDIDAttributes(data, scale) draws/updates and repositions all
     * did attribute panels with the provided data and scale
     */
    this.buildDIDAttributes = function (data, scale) {
        // calculate side length for attribute icons
        var side = this.height * scale.heightScale;

        /**
         * update pattern for drawing/updating/repositioning the digital ID
         * attribute panel groups
         */

        // DATA JOIN
        this.details = this.details.data(data);

        // EXIT
        this.details.exit().remove();

        // ENTER

        // SVG group for each attribute panel
        var newDetails = this.details.enter().append("g")
            .attr("class", function (d) {
                return d.type + " did-detail"
            });

        // colored square background for attribute icon
        newDetails.append("rect")
            .attr("x", side * 0.2)
            .attr("y", side * 0.2)
            .attr("rx", 2)
            .attr("ry", 2)
            .attr("height", side * 0.6)
            .attr("width", side * 0.6)
            .attr("stroke", "white");

        // attribute type label text
        newDetails.append("text")
            .attr("class", "didLabelText")
            .attr("x", side)
            .attr("y", side / 3)
            .attr("dominant-baseline", "middle")
            .attr("fill", "black")
            .attr("font-size", side * 0.2)
            .text(function (d) {
                return d.title;
            });

        // attribute data label text
        newDetails.append("text")
            .attr("class", function (d) {
                return d.type + " didDataText";
            })
            .attr("x", side)
            .attr("y", side / 3 * 2)
            .attr("dominant-baseline", "middle")
            .attr("fill", "black")
            .attr("font-size", side * 0.35)
            .attr("font-family", "'Oswald', sans-serif")
            .text(function (d) {
                return d.data;
            });

        // attribute icon image
        newDetails.append("image")
            .attr("xlink:href", function (d) {
                return d.img;
            })
            .attr("x", side * 0.3)
            .attr("y", side * 0.3)
            .attr("height", side * 0.4)
            .attr("width", side * 0.4);

        // MERGE UPDATE + ENTER
        this.details = this.details.merge(newDetails);

        // set text width for each data label
        this.details.selectAll(".didDataText").each(function(d) {
            d.width = this.getBBox().width;
        });

        // transform attributes to the correct location
        var spacer = 0;
        this.details.each(function (d) {
            d3v4.select(this).attr("transform", "translate(" + spacer + ",0)");
            spacer += side + d.width + v.width * 0.03;
        });

        // translate attribute group to appropriate position
        this.didGroup.attr("transform", function (d) {
            return "translate(" + (v.width * scale.xScale) + "," + (v.height * scale.yScale) + ")";
        });
    }

    /**
     * buildEntityDetail(data, scale) draws/updates and repositions all
     * entity detail text panels with the provided data and scale
     */
    this.buildEntityDetail = function (data, scale) {
        var titleOffset = 40;

        // calculate panel height for quicker reference
        var h = this.height * scale.heightScale;

        /**
         * update pattern for drawing/updating/repositioning entity
         * panel label
         */

        // DATA JOIN
        var label = this.entityGroup.selectAll(".panelTitle").data(["Entity Details"]);

        // EXIT
        label.exit().remove();

        // ENTER
        label = label.enter().append("text")
                .attr("class", "panelTitle")
                .attr("x", 10)
                .attr("y", 5)
                .text(function(d){return d;})
                // MERGE UPDATE + ENTER
                .merge(label);

        /**
         * update pattern for drawing/updating/repositioning entity
         * detail text rows including label and data
         */

        // DATA JOIN
        this.enDetails = this.enDetails.data(data);

        // EXIT
        this.enDetails.exit().remove();

        // ENTER

        // group for each text row including label and data
        newED = this.enDetails.enter().append("g")
            .attr("class", "entity-detail")
            .attr("transform", function (d, i) {
                return "translate(0,0)";
            });

        // detail label text
        newED.append("text")
            .attr("class", function (d) {
                return d.type + " entity-detail-label";
            })
            .attr("x", 10)
            .attr("y", function (d, i) {
                return titleOffset + i * ((h - titleOffset) / 4)
            })
            .attr("font-size", 14)
            .text(function (d) {
                return d.label;
            });

        // detail data text
        newED.append("text")
            .attr("class", function (d) {
                return d.type + " entity-detail-data";
            })
            .attr("x", 140)
            .attr("y", function (d, i) {
                return titleOffset + i * ((h - titleOffset) / 4)
            })
            .attr("font-size", 14)
            .text(function (d) {
                return d.data;
            });

        // MERGE UPDATE + ENTER
        this.enDetails = this.enDetails.merge(newED);

        // translate entity detail group to appropriate position
        this.entityGroup.attr("transform", function (d) {
            return "translate(" + (v.width * scale.xScale) + "," + (v.height * scale.yScale) + ")";
        });
    }

    /**
     * buildLegend(data, scale) draws/updates and repositions all
     * entity detail text panels with the provided data and scale
     */
    this.buildLegend = function (data, scale) {
        var titleOffset = 35;

        /**
         * update pattern for drawing/updating/repositioning entity
         * panel label
         */

        // DATA JOIN
        var label = this.legendGroup.selectAll(".panelTitle").data(["Legend"]);

        // EXIT
        label.exit().remove();

        // ENTER
        label = label.enter().append("text")
                .attr("class", "panelTitle")
                .attr("x", 10)
                .attr("y", 10)
                .text(function(d){return d;})
                // MERGE UPDATE + ENTER
                .merge(label);

        /**
         * update pattern for drawing/updating/repositioning node
         * legend groups including icon and text label
         */

        // DATA JOIN
        this.lNode = this.lNode.data(data, function (d) {
            return d.id;
        });

        // EXIT
        this.lNode.exit().remove();

        // ENTER

        // SVG groups for node legend
        var newLN = this.lNode.enter().append("g")
            .attr("class", function(d){return "legendNode interactive-element" + (d.filtered ? " filtered" : ""); })
            .attr("id", function (d) {
                return d.typeCode + "-legend";
            })
            .on("click", function (d) {
                if (d.scope) {v.filter("scope", d.typeCode)}
                else {v.filter("type", d.typeCode)}
                var s = d3v4.select(this);
                d.filtered = !s.classed("filtered");
                s.classed("filtered", d.filtered);
                v.update();
            })
            .on("mouseover", function() {v.highlightLink(d3v4.select(this))})
            .on("mouseout", function() {v.highlightLink(d3v4.select(this), true)})
            .attr("transform",function(d,i) {return "translate(5," + (titleOffset + i * v.lScale) + ")";});

        // label text for node legend
        newLN.append("text")
            .attr("class", "legendText")
            .attr("font-size", 12)
            .attr("dominant-baseline", "middle")
            // text is the typeCode + count of type in current graph
            .text(function (d) {
                var c;
                if (d.scope) {c = v.scopeCounts[d.typeCode]}
                else {c = v.typeCounts[d.typeCode]}
                return d.type + " (" + (c || "0") + ")";
            })
            .each(function(d) {
                d.width = this.getBBox().width;
            });

        // hidden rectangle for selection
        newLN.append("rect")
            .attr("height", this.lScale)
            .attr("width", function(d) {return v.lScale + d.width;})
            .attr("opacity", 0);

        // circle icons for node legend
        newLN.append("circle")
            .attr("class", function (d) {
                return d.typeCode + " lNode";
            })
            .attr("r", 7)
            .on("mouseover", function(){v.nodeHover(d3v4.select(this))})
            .on("mouseout", function(){v.nodeHover(d3v4.select(this), true)});

        // node icon
        newLN.append("image")
            .attr("xlink:href", function (d) { return d.imageColored; })
            .attr("height", 7)
            .attr("width", 7)
            .attr("x", (this.lScale / 2) - 4)
            .attr("y", (this.lScale / 2) - 4)
            .attr("pointer-events", "none");

        // MERGE UPDATE + ENTER
        this.lNode = this.lNode.merge(newLN);

        // UPDATE
        this.lNode.selectAll("circle")
            .attr("cx", this.lScale / 2)
            .attr("cy", this.lScale / 2);
        this.lNode.selectAll("text")
            .attr("x", this.lScale + 2)
            .attr("y", this.lScale / 2);

        /**
         * update pattern for drawing/updating/repositioning the label
         * toggle control, button size is dynamic to container and is
         * always positioned 5px away from bottom-left corner
         */

        // DATA JOIN
        this.labelToggle = this.labelToggle.data(this.toggleData);

        // EXIT
        this.labelToggle.exit().remove();

        // ENTER

        // SVG group for toggle control
        var toggleGroup = this.labelToggle.enter().append("g")
            .attr("class", function(d) {return d.code + "-toggle-group interactive-element";})
            .on("mouseover", function() {v.highlightLink(d3v4.select(this))})
            .on("mouseout", function() {v.highlightLink(d3v4.select(this), true)})
            .on("click", function(d){d.click();});

        // text for button label
        toggleGroup.append("text")
            .attr("y", function(d,i) {return i * 20;})
            .attr("x", 5)
            .attr("dominant-baseline", "hanging")
            .attr("font-size", 12)
            .attr("fill", "#00729F")
            .text(function (d) {
                return d.title;
            })
            .each(function(d) {
                d.width = this.getBBox().width;
            });

        // rectangle for button shape
        toggleGroup.append("rect")
            .attr("width", function(d){return d.width;})
            .attr("height", 20)
            .attr("x", 5)
            .attr("y", function(d,i){return i * 20;})
            .attr("opacity", 0);

        // MERGE UPDATE + ENTER
        this.labelToggle = this.labelToggle.merge(toggleGroup);

        this.labelToggle
            .attr("transform", "translate(5," + (scale.heightScale * this.height - 45) + ")");

        // translate legend group to appropriate position
        this.legendGroup.attr("transform", function (d) {
            return "translate(" + (v.width * scale.xScale) + "," + (v.height * scale.yScale) + ")";
        });
    }

    /**
     * buildGraph(data, scale) draws/updates/repositions all
     * graph elements including links, nodes, labels, and the label
     * toggle control. It also prepares the force simulation with the
     * appropriate data and restarts
     */
    this.buildGraph = function (data, scale) {

        /**
         * update pattern for drawing/updating/repositioning graph nodes,
         * does not include node labels
         */

        // DATA JOIN
        this.node = this.node.data(data.nodes, function (d) {
            return d.id;
        });

        // EXIT
        this.node.exit().transition()
            .attr("r", 0)
            .remove();

        // ENTER

        // circle representing node
        this.node = this.node.enter().append("circle")
            .attr("class", function (d) {
                var localClass = d.scope !== "global" ? "" : " non-local";
                return d.typeCode + localClass + " node interactive-element defaultProfile" + (v.riskProfile ? " transparent" : "");
            })
            .call(d3v4.drag()
                .on("start", this.dragstarted)
                .on("drag", this.dragged)
                .on("end", this.dragended)
            )

            // MERGE UPDATE + ENTER
            .merge(this.node);

        // UPDATE
		this.node
		.attr("id", function (d) {
			return d.id;
		})
        .attr("r", function (d) {
            return d.typeCode === "did" ? v.radius * 1.5 : v.radius;
        })
        .attr("stroke-width", function (d) {
            return d.selected ? 8 : 3;
        });

        /**
         * update pattern for drawing/updating/repositioning node labels,
         * includes a text element for the label and data
         */

        // DATA JOIN
        this.labelGroup = this.labelGroup.data(data.nodes, function (d) {
            return d.id;
        });

        // EXIT
        this.labelGroup.exit().remove();

        // ENTER

        // SVG group for node text
        var newLG = this.labelGroup.enter().append("g")
            .attr("class", "labelGroup")
            .attr("id", function (d) { return d.id; });

        // node detail text
        newLG.append("text")
            .attr("font-size", this.radius * 1)
            .attr("class", "nodeLabel lbl" + (this.labeled ? " hidden" : ""));

        // node data text
        newLG.append("text")
            .attr("font-size", this.radius * 0.9)
            .attr("dy", 15)
            .attr("class", "nodeData lbl" + (this.labeled ? " hidden" : ""));

        // MERGE UPDATE + ENTER
		this.labelGroup = this.labelGroup.merge(newLG);
		
		// UPDATE
		this.labelGroup.selectAll(".nodeLabel")
			.html(function (d) {
				var detail = (typeof d.detail === 'undefined') ? "" : ": " + d.detail;
				return d.type + detail;
			})
			.attr("dx", function (d) {
				return d.typeCode === "did" ? (v.radius * 2) : (v.radius * 1.5);
			});

		this.labelGroup.selectAll(".nodeData")
			.html(function (d) {
				return d.data.length > 25 ? v.minimizeStr(d.data) : d.data;
			})
			.attr("dx", function (d) {
				return d.typeCode === "did" ? (v.radius * 2) : (v.radius * 1.5);
			});
			

        /**
         * update pattern for drawing/updating/repositioning node icons
         */

        // DATA JOIN
        this.iconGroup = this.iconGroup.data(data.nodes, function (d) {
            return d.id;
        });

        // EXIT
        this.iconGroup.exit().remove();

        // ENTER

        // SVG group for node text
        var newIG = this.iconGroup.enter().append("g")
            .attr("class", "iconGroup")
            .attr("pointer-events", "none")
            .attr("id", function (d) { return d.id; });

        newIG.append("image")
            .attr("class", "defaultProfile" + (this.riskProfile ? " transparent" : ""))
            .attr("xlink:href", function (d) { return d.image; })
            .attr("x", function(d) {return 0 - v.radius * (d.typeCode==="did"?1.75:0.5);})
            .attr("y", function(d) {return 0 - v.radius * (d.typeCode==="did"?1.75:0.5);})
            .attr("height", function(d) { return v.radius * (d.typeCode==="did"?3.5:1)})
            .attr("width", function(d) { return v.radius * (d.typeCode==="did"?3.5:1)})
            .attr("pointer-events", "none");

        newIG.append("circle")
            .attr("class", "riskProfile" + (this.riskProfile ? "" : " hidden"))
            .attr("pointer-events", "none");

        newIG.append("text")
            .attr("class", "riskProfile" + (this.riskProfile ? "" : " hidden"))
            .text(function(d){return d.risk;})
            .attr("fill", function(d) {
                return (d.risk >= 70 || d.risk <= -70) ? "white" : "black";
            })
            .attr("y", 1);

        // MERGE UPDATE + ENTER
        this.iconGroup = this.iconGroup.merge(newIG);

        this.iconGroup.selectAll("circle")
            .attr("r", function (d) {
                return d.typeCode === "did" ? v.radius * 1.5 : v.radius;
            })
            .attr("stroke-width", function (d) {
                return d.selected ? 5 : 3;
            })
            .attr("fill", function(d) {
                return v.color(d.riskScale);
            })
            .attr("stroke", function(d) {
                return d3v4.color(v.color(d.riskScale)).darker();
            });

        /**
         * update pattern for drawing/updating/repositioning graph links,
         * data for links depends on current graph state
         */

            // set data based on current graph state
        var dat = this.did ? data.didLinks : data.entityLinks;

        // DATA JOIN
        this.link = this.link.data(dat, function (d) {
            return d.id;
        });

        // EXIT
        this.link.exit().remove();

        // ENTER

        // line for link
        this.link = this.link.enter().append("line")
            // MERGE UPDATE + ENTER
            .merge(this.link);

        // UPDATE
        this.link
            .attr("id", function(d) {
                var o = (typeof d.source === 'object');
                return "-" + (o ? d.source.id : d.source) + "-" + (o ? d.target.id : d.target) + "-";
            })
            .attr("stroke", function(d) { return "#efc383"; })
            .attr("stroke-width", function (d) {
                return Math.max(10 * (d.count / (v.did ? v.maxDIDCount : v.maxEntityCount)), 1.5);
            });

        // set nodes for force simulation
        this.simulation.nodes(data.nodes);

        // based on current graph state, set links for force simulation
        if (this.did) {
            this.simulation.force("link").links(data.didLinks);
        } else {
            this.simulation.force("link").links(data.entityLinks);
        }

        // set force simulation tick event handler
        this.simulation.on("tick", this.ticked);
        // restart the simulation with a new alpha and alpha target
        this.simulation.alpha(0.25).alphaTarget(0).restart();

        // translate the graph group to the appropriate position
        this.graphGroup.attr("transform", "translate(" + (this.width * scale.xScale) + "," + (this.height * scale.yScale) + ")");
    }

    /**
     * drag event handlers, used for node positioning when
     * they are interacted with
     */
    this.dragstarted = function (d) {
        v.graphHover(d3v4.select(this))
        v.selectNode(v.graphData, d.id);
        if (!d3v4.event.active) v.simulation.alphaTarget(0.1).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    this.dragged = function (d) {
        d.fx = d3v4.event.x;
        d.fy = d3v4.event.y;
    }
    this.dragended = function (d) {
        v.graphHover(d3v4.select(this), true)
        if (!d3v4.event.active) v.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    /**
     * tick event handler, handles positioning of nodes, links, and
     * node labels on each tick event. nodes are bound inside of the
     * graph panel, links and node labels are bound to their
     * corresponding nodes.
     */
    this.ticked = function () {
        v.node
            .attr("cx", function (d) {
                return d.x = Math.max(v.radius, Math.min(v.gWidth - 2*v.radius, d.x));
            })
            .attr("cy", function (d) {
                return d.y = Math.max(v.radius, Math.min(v.gHeight - 2*v.radius, d.y));
            });

        v.link
            .attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        v.labelGroup.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
        v.iconGroup.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    }

    /**
     * filter(filterType, value) contains the filtering behavior for
     * modifying data based on filter selections from the legend.
     * the graph can be filtered by entity type or scope, with the value
     * being the type or scope being filtered/unfiltered
     */
    this.filter = function (filterType, value) {
        // toggle filter list membership based on filterType
        if (filterType === "type") {
            this.typeFilters.includes(value) ? this.typeFilters.splice(this.typeFilters.indexOf(value), 1) : this.typeFilters.push(value);
        } else if (filterType === "scope") {
            this.scopeFilters.includes(value) ? this.scopeFilters.splice(this.scopeFilters.indexOf(value), 1) : this.scopeFilters.push(value);
        }

        // filter nodes and links in and out of data based on filter criteria
        this.filterNodes(this.graphData.nodes, this.graphStore.nodes);
        this.filterLinks(this.graphData.didLinks, this.graphStore.didLinks);
        this.filterLinks(this.graphData.entityLinks, this.graphStore.entityLinks);
    }

    /**
     * filterNodes(inData, inGraph) handles the inclusion/exclusion
     * of nodes from data based on filter criteria
     */
    this.filterNodes = function (inData, inGraph) {
        // for each node in the graph store...
        inGraph.forEach(function (n) {

            // if the node is not in data but should be, add it back from store
            if (!v.scopeFilters.includes(n.scope) &&
                !v.typeFilters.includes(n.typeCode) &&
                n.filtered) {
                n.filtered = false;
                inData.push(JSON.parse(JSON.stringify(n)));
            }

            // if the node is in data but shouldn't be, remove it
            else if ((v.scopeFilters.includes(n.scope) ||
                    v.typeFilters.includes(n.typeCode)) &&
                !n.filtered) {
                n.filtered = true;
                inData.forEach(function (d, i) {
                    if (d.id === n.id) {
                        inData.splice(i, 1);
                    }
                });
            }
        });
    }

    /**
     * filterLinks(inData, inGraph) handles the inclusion/exclusion
     * of links from data based on filter criteria
     */
    this.filterLinks = function (inData, inGraph) {
        // for each link in the graph store...
        inGraph.forEach(function (l) {

            // if the link is not in data but should be, add it back from store
            if ((!v.scopeFilters.includes(l.nodeScopes[0]) && !v.scopeFilters.includes(l.nodeScopes[1])) &&
                (!v.typeFilters.includes(l.nodeTypes[0]) && !v.typeFilters.includes(l.nodeTypes[1])) &&
                l.filtered) {
                l.filtered = false;
                inData.push(JSON.parse(JSON.stringify(l)));
            }

            // if the link is in data but shouldn't be, remove it
            else if (((v.scopeFilters.includes(l.nodeScopes[0]) || v.scopeFilters.includes(l.nodeScopes[1])) ||
                    (v.typeFilters.includes(l.nodeTypes[0]) || v.typeFilters.includes(l.nodeTypes[1]))) &&
                !l.filtered) {
                l.filtered = true;
                inData.forEach(function (d, i) {
                    if (d.id === l.id) {
                        inData.splice(i, 1);
                    }
                });
            }
        });
    }

    /**
     * detail(data, id) locates the node in data corresponding to the
     * provided id and populates the entity details according to its data
     */
    this.detail = function (data, id) {
        data.nodes.forEach(function (n) {
            if (n.id === id) {
                var dT = n.typeCode === "did";
                d3v4.select(v.div).select(".entity-detail-label.type").text(n.type);
                d3v4.select(v.div).select(".entity-detail-data.type").text(n.data);
                d3v4.select(v.div).select(".entity-detail-data.scope").text(n.scope);
                d3v4.select(v.div).select(".entity-detail-data.first-seen").text(n.firstSeen || "Unavailable");
                d3v4.select(v.div).select(".entity-detail-data.last-seen").text(n.lastSeen || "Unavailable");
            }
        });
    }

    /**
     * scopeCount() returns an object with counts of each node
     * scope from the data store
     */
    this.scopeCount = function () {
        var counts = {local: 0, global: 0};
        this.graphStore.nodes.forEach(function (n) {
            counts[n.scope] = !counts[n.scope] ? 1 : counts[n.scope] + 1;
        });
        return counts;
    }

    /**
     * typeCount() returns an object with counts of each node
     * type from the data store
     */
    this.typeCount = function () {
        var counts = {};
        this.graphStore.nodes.forEach(function (n) {
            counts[n.typeCode] = !counts[n.typeCode] ? 1 : counts[n.typeCode] + 1;
        });
        return counts;
    }

    /**
     * switchLinks() handles toggling between the two graph types by
     * toggling the graph state attribute, filtering/unfiltering the digital ID
     * node from the legend, and then re-rendering the graph
     */
    this.switchLinks = function (did) {
        this.did = did;
        if (this.typeFilters.includes("did")) {
            did ? this.filter("type", "did") : "";
        } else {
            did ? "" : this.filter("type", "did");
        }
        this.render(this.width, this.height);
    }

    /**
     * selectNode(data, id) handles node selection by detailing the
     * provided node in the entity details panel, updating the selected
     * property of each node in data, and then rebuilding the visualization
     */
    this.selectNode = function (data, id) {
        this.detail(data, id);
        var ns = [this.graphStore.nodes, this.graphData.nodes];
        ns.forEach(function (nl) {
            nl.forEach(function (n) {
                n.selected = n.id === id;
            });
        });
        this.update();
    }

    /**
     * toggleLabels() toggles the label property and updates all nodes
     * labels in the graph
     */
    this.hideLabels = function (t) {
        t.title = v.labeled ? "Hide Labels" : "Show Labels";

        d3v4.select(v.div).selectAll(".lbl").classed("hidden", !v.labeled);
        v.labeled = !v.labeled;
        d3v4.select(v.div).select(".label-toggle-group text").text(function(d) { return d.title;});
    }

    /**
     * showRiskProfile() changes the state of nodes and links in the graph
     * to show the risk associated with each entity
     */
    this.showRiskProfile = function(t) {
        t.title = v.riskProfile ? "Show Risk Profile" : "Hide Risk Profile";

        d3v4.select(v.div).selectAll(".defaultProfile").classed("transparent", !v.riskProfile);
        d3v4.select(v.div).selectAll(".riskProfile").classed("hidden", v.riskProfile);
        v.riskProfile = !v.riskProfile;
        d3v4.select(v.div).select(".risk-toggle-group text").text(function(d) {return d.title;});
    }

    /**
     * selectState(s, d) handles state selection from the tab bar by
     * highlighting only the selected state button and then taking action
     * based on the button type
     */
    this.selectState = function (s, d) {
        this.buttons.forEach(function(b) { b.active = b.button === d.button; });
        switch (d.button) {
            case "did":
                this.displayGraph(true);
                break;
            case "entity-rel":
                this.displayGraph(false);
                break;
            case "events":
                this.update();
                this.showEvents();
                break;
        }
    }

    /**
     * displayGraph() prepares the graph state and selects a node
     */
    this.displayGraph = function (did) {
        d3v4.select(".event-dash").remove();
        if (!this.graph) {
            this.rebuildGraph();
            this.graph = true;
            this.switchLinks(did);
            this.selectNode(this.graphData, this.graphData.nodes[0].id);
        } else {
            this.switchLinks(did);
        }
    }

    /**
     * graphHover(sel, disable) handles the hover functionality for graph nodes,
     * more specifically it makes all graph elements opaque other than
     * the nodes being hovered and those one hop away
     */
    this.graphHover = function(sel, disable) {
        var oneHopNodeIDs = [];
        d3v4.select(this.div).selectAll("line[id*='-" + sel.attr("id") + "-']").each(function(){
            d3v4.select(this).attr("id").match(/\d+/g).forEach(function(n){oneHopNodeIDs.push(n);});
        });
        oneHopNodeIDs = oneHopNodeIDs.filter(function(elem, index, self) { return index == self.indexOf(elem);});
        var idNots = "";
        oneHopNodeIDs.forEach(function(i) {idNots += ":not([id='" + i + "'])";});
        var others = this.graphGroup.selectAll(
            "line:not([id*='-" + sel.attr("id") + "-'])," +
            "circle.node" + idNots + "," +
            "g[class*='labelGroup']" + idNots+ "," +
            "g[class*='iconGroup']" + idNots
        );
        others.classed("unfocused", !disable);
    }

    /**
     * nodeHover(sel, disable) handles the hover functionality for legend nodes,
     * more specifically it makes all legend elements darken when
     * being hovered over
     */
    this.nodeHover = function(sel, disable) {
        sel.style("fill", (disable ? d3v4.color(sel.style("fill")).brighter() : d3v4.color(sel.style("fill")).darker()));
    }

    /**
     * highlightLink(sel, disable) underlines text within the provided selection
     * while being hovered over, and removes the underline on a mouseout
     */
    this.highlightLink = function(sel, disable) {
        sel.attr("text-decoration", disable ? "none" : "underline");
    }

    /**
     * minimizeStr(str) returns a minimized substring of the provided
     * string in the format "1234...wxyx"
     */
    this.minimizeStr = function (str) {
        return str.substr(0, 4) + "..." + str.substr(str.length - 4, str.length);
    }

    /**
     * showEvents() removes graph content if necessary, then
     * adds the html for the event dashboard and renders the graphics
     */
    this.showEvents = function() {
        // clean up graph content panels
        d3v4.select(".event-dash").remove();
        this.graph = false;
        d3v4.select(this.div).selectAll(".entity-group, .legend-group, .graph-group, .did-group").remove();
        this.svg.attr("height", this.layoutScales.tabPanel.heightScale * this.height);

        this.dash = new dash(this);
        this.dash.init(this.width -40, this.eventData);
    }

    /**
     * rebuildGraph() reinitializes variables needed for the graph content
     * and then renders the graph below the tabs and did attributes
     */
    this.rebuildGraph = function() {
        d3v4.select(this.div).selectAll(".entity-group, .legend-group, .graph-group, .did-group").remove();

        this.graphGroup = this.svg.append("g").attr("class", "graph-group");
        this.legendGroup = this.svg.append("g").attr("class", "legend-group");
        this.entityGroup = this.svg.append("g").attr("class", "entity-group");
        this.didGroup = this.svg.append("g").attr("class", "did-group");
        this.enDetails = this.entityGroup.selectAll(".entity-detail"),
        this.lNode = this.legendGroup.append("g").selectAll(".legendNode"),
        this.lLink = this.legendGroup.append("g").selectAll(".legendLink"),
        this.labelToggle = this.legendGroup.append("g").selectAll(".labelToggle"),
        this.link = this.graphGroup.append("g").selectAll(".link"),
        this.node = this.graphGroup.append("g").selectAll(".node"),
        this.iconGroup = this.graphGroup.append("g").selectAll(".iconGroup"),
        this.labelGroup = this.graphGroup.append("g").selectAll(".labelGroup");
        this.details = this.didGroup.selectAll(".did-detail");
    }

    /**
     * nodeImage() returns the proper image path for a node given
     * the scope
     */
    this.nodeImage = function(path, scope) {
        if (path === undefined) {
            return "";
        } else {
            var cp;
            switch(scope) {
                case "id":
                    cp = "-orange.svg"
                    break;
                case "global":
                    cp = "-black.svg"
                    break;
                default:
                    cp = "-white.svg"
                    break;
            }
            return path + cp;
        }
    }
}