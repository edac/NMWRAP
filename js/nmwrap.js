
//   _   __         _      __   __      
//  | | / /__ _____(_)__ _/ /  / /__ ___
//  | |/ / _ `/ __/ / _ `/ _ \/ / -_|_-<
//  |___/\_,_/_/ /_/\_,_/_.__/_/\__/___/

var NMWRAPurl = "https://edacarc.unm.edu/arcgis/rest/services/NMWRAP/NMWRAP/MapServer"
var activelayer = "9"
var defaultblurb = "NMWRAP is Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
WildfireRiskLayers = [6, 7, 8, 9]

//Define the symbol(look) of the polygon part of the buffer
var polyBuff = {
    type: "simple-fill", outline: {
        color: [0, 0, 0, 0.5],
        width: 2
    },
    color: [111, 111, 111, 0.6]
};

//Define the symbol(look) of the center point of the buffer
var pointBuff = {
    type: "simple-marker",
    style: "x",
    outline: {
        color: [50, 50, 50],
        width: 5
    },
    color: [113, 113, 113],
    size: 10
};

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}

require([
    "esri/Map",
    "esri/views/MapView",
    "esri/views/2d/draw/Draw",
    "esri/layers/MapImageLayer",
    "esri/widgets/Legend",
    "esri/tasks/support/IdentifyParameters",
    "esri/tasks/IdentifyTask",
    "esri/geometry/support/webMercatorUtils",
    "esri/widgets/Search",
    "esri/geometry/Extent",
    "esri/widgets/Fullscreen",
    "esri/widgets/LayerList",
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
    "esri/geometry/Polyline",
    "esri/geometry/geometryEngine",
    "esri/widgets/Print",
    "dojo/on",
    "dojo/dom",
    "dojo/domReady!"
], function (Map, MapView, Draw, MapImageLayer, Legend, IdentifyParameters, IdentifyTask, webMercatorUtils, Search, Extent, Fullscreen, LayerList, GraphicsLayer, Graphic, Polyline, geometryEngine, Print, on, dom) {
    sublayerObject = [{
        id: 6,
        visible: false
    }, {
        id: 7,
        visible: false
    }, {
        id: 8,
        visible: false
    }, {
        id: 9,
        visible: true
    }, {
        id: 10,
        visible: false
    }, {
        id: 11,
        visible: false
    }]


    ReflayerObject = [{
        id: 5,
        visible: true
    }, {
        id: 4,
        visible: false
    }, {
        id: 3,
        visible: false
    }, {
        id: 2,
        visible: false
    }, {
        id: 1,
        visible: false
    }, {
        id: 0,
        visible: false
    }]

    var dangerLyr = new MapImageLayer({
        url: NMWRAPurl,
        id: "Danger",
        title: "Risk",
        sublayers: sublayerObject
    });

    var RefLyr = new MapImageLayer({
        url: NMWRAPurl,
        id: "Reference",
        title: "Reference",
        sublayers: ReflayerObject
    });

    var slider = document.getElementById("myRange");
    var slider2 = document.getElementById("RefRange");
    var output = document.getElementById("demo");
    output.innerHTML = slider.value;
    output.innerHTML = slider2.value;
    slider.oninput = function () {
        output.innerHTML = this.value;
        var newopacity = this.value / 100
        dangerLyr.opacity = newopacity
    }
    slider2.oninput = function () {
        output.innerHTML = this.value;
        var newopacity = this.value / 100
        RefLyr.opacity = newopacity
    }

    var reporturl = ""



    //    __                     ____       _ __      __          
    //   / /  ___ ___ _____ ____/ __/    __(_) /_____/ /  ___ ____
    //  / /__/ _ `/ // / -_) __/\ \| |/|/ / / __/ __/ _ \/ -_) __/
    // /____/\_,_/\_, /\__/_/ /___/|__,__/_/\__/\__/_//_/\__/_/   
    //           /___/                                            



    $(".LayerSwitcher").click(function () {
        cleartooltips();
        activelayer = this.value
        var index = -1;
        var val = parseInt(this.value)
        var filteredObj = sublayerObject.find(function (item, i) {
            if (item.id === val) {
                index = i;
                sublayerObject[i].visible = true
                legendstr = ".Legend" + i
                $(legendstr).show();
            } else {
                if (isInArray(item.id, WildfireRiskLayers)) {
                    sublayerObject[i].visible = false
                    legendstr = ".Legend" + i
                    $(legendstr).hide();
                }
            }
        });
        dangerLyr.sublayers = sublayerObject
    });


    $(".BaseLayerSwitcher").click(function () {
        activeBaselayer = this.value
        map.basemap = this.value

    });

    $(".ReferenceLayers").change(function () {
        ischecked = this.checked
        var val = parseInt(this.value)
        var filteredObj = ReflayerObject.find(function (item, i) {
            if (item.id === val) {
                if (ischecked) {
                    ReflayerObject[i].visible = true
                } else {
                    ReflayerObject[i].visible = false
                }

            }
            RefLyr.sublayers = ReflayerObject
        });



    });

    var map = new Map({
        layers: [dangerLyr, RefLyr],
        basemap: "streets",
        visible: true,
        index: 7
    });






    //New GraphicsLayer instances
    var buffLayer = new GraphicsLayer();
    var pointLayer = new GraphicsLayer();

    // Add them to the map 
    map.addMany([buffLayer, pointLayer]);




    var view = new MapView({
        container: "viewDiv",  // Reference to the scene div created in step 5
        map: map,  // Reference to the map object created before the scene
        zoom: 7,  // Sets zoom level based on level of detail (LOD)
        center: [-106, 34.2],  // Sets center point of view using longitude,latitude
        index: 7
    });

    var draw = new Draw({
        view: view
    });
    console.log(draw)


    // function labelAreas(geom, length) {
    //     console.log("lol")
    //     console.log(geom.paths[0])
    //     var graphic = new Graphic({
    //         geometry: geom.centroid,
    //         symbol: {
    //             type: "text",
    //             color: "white",
    //             haloColor: "black",
    //             haloSize: "1px",
    //             text: length.toFixed(2) + " miles",
    //             xoffset: 3,
    //             yoffset: 3,
    //             font: { // autocast as Font
    //                 size: 14,
    //                 family: "sans-serif"
    //             }
    //         }
    //     });
    //     view.graphics.add(graphic);
    // }

    var print = new Print({
        view: view,
        printServiceUrl: "https://edacarc.unm.edu/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
    });


    var printing = false
    var reporting = false
    var clickEnabled = "risk"
    var topbuttonlist = ["#PrintBtn", "#ReportButton", "#MeasureButton", "#InfoBtn"]
    $("#PrintBtn").click(function () {
        toptoolbar("#PrintBtn")
    })
    $("#MeasureButton").click(function () {

        toptoolbar("#MeasureButton")
    })
    $("#ReportButton").click(function () {
        toptoolbar("#ReportButton")
    })
    $("#InfoBtn").click(function () {
        toptoolbar("#InfoBtn")

    })
    $("#GenReport").click(function () {
        county = ""
        FireStationBlurb = ""
        FireStationMargin = 0
        CommunitesatRiskBlurb = ""
        CommunitesatRiskMargin = 0
        VegetationTreatments = ""
        ReportTableJSON = {}
        VegetationTreatmentsMargin = 0
        HasVegTable = false
        ordereddata = { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [], "7": [], "8": [], "9": [], "10": [], "11": [] }
        $.ajax({
            url: reporturl,

            success: function (data) {
                jdata = JSON.parse(data);
                jdata.results.forEach(function (element) {
                    ordereddata[element.layerId.toString()].push(element)
                });
                if (ordereddata["0"].length > 0) {
                    if (ordereddata["0"].length == 1) {
                        FireStationBlurb = "There is a single fire station in your area of interest. The " + ordereddata["0"]["0"].attributes.Name + " is located at " + ordereddata["0"]["0"].attributes.Address + " in the city of " + ordereddata["0"]["0"].attributes.City + "."
                        FireStationMargin = 10
                    } else {
                        FireStationBlurb = "There are " + ordereddata["0"].length + " fire stations in your area of interest."
                        ordereddata["0"].forEach(function (firestation) {
                            FireStationBlurb = FireStationBlurb + " " + firestation.attributes.Name + " is located at " + firestation.attributes.Address + " in the city of " + firestation.attributes.City + "."
                            FireStationMargin = 20 * ordereddata["0"].length
                        })


                    }

                } else {
                    FireStationBlurb = "There are no fire stations in the area of intrest you have chosen."
                    FireStationMargin = 10
                }

                if (ordereddata["1"].length > 0) {
                    if (ordereddata["1"].length == 1) {
                        valletter = ordereddata["1"]["0"].attributes.Rate_2016
                        riskval = ""
                        if (valletter == "H") {
                            riskval = "high"
                        } else if (valletter == "M") {
                            riskval = "medium"
                        } else if (valletter == "L") {
                            riskval = "low"
                        }
                        CommunitesatRiskBlurb = "There is a single community at risk in your area of interest. The " + ordereddata["1"]["0"].attributes.NAME + " community is considered " + riskval + " risk."
                        CommunitesatRiskMargin = 10
                    } else {
                        CommunitesatRiskBlurb = "There are " + ordereddata["1"].length + " communities at risk in your area of interest."
                        ordereddata["1"].forEach(function (car) {
                            valletter = car.attributes.Rate_2016
                            riskval = ""
                            if (valletter == "H") {
                                riskval = "high"
                            } else if (valletter == "M") {
                                riskval = "medium"
                            } else if (valletter == "L") {
                                riskval = "low"
                            }
                            CommunitesatRiskBlurb = CommunitesatRiskBlurb + " The " + car.attributes.NAME + " community is considered " + riskval + " risk."
                            CommunitesatRiskMargin = 10 * ordereddata["1"].length
                        })


                    }

                } else {
                    CommunitesatRiskBlurb = "There are no communites at risk in the area of intrest you have chosen."
                    CommunitesatRiskMargin = 10
                }

                if (ordereddata["3"].length > 0) {
                    if (ordereddata["3"]["0"].attributes["Name of Treatment"] != "needs input") {
                        if (ordereddata["3"].length == 1) {
                            treatmentName = ordereddata["3"]["0"].attributes["Name of Treatment"]

                            VegetationTreatments = "There has been a single vegetation treatment in your area of interest. The treatment is named " + ordereddata["3"]["0"].attributes["Name of Treatment"] + ". "
                            if (ordereddata["3"]["0"].attributes["Year (Calendar)"] != "needs input") {

                                VegetationTreatments = VegetationTreatments + "This treatment took place in calendar year of " + ordereddata["3"]["0"].attributes["Year (Calendar)"] + "."
                            }

                        } else {
                            HasVegTable = true
                            BuildTable(ordereddata["3"])
                            VegetationTreatmentsMargin = 10 * ordereddata["3"].length
                            VegetationTreatments = "There are " + ordereddata["3"].length + " vegetation treatments on record in your area of interest."
                            VegKeyArray = []
                            for (key in ordereddata["3"]["0"].attributes) {
                                VegKeyArray.push(key)
                            }
                            ordereddata["3"].forEach(function (treat) {
                                VegetationTreatments = ""
                            })


                        }
                    } else {
                        VegetationTreatments = "There have been " + ordereddata["3"].length + " vegetation treatments in the area of interest."
                    }

                } else {
                    VegetationTreatments = "There are no vegetation treatments on record for the area of intrest you have chosen."
                }
                county = jdata.results[1].value
                console.log(ReportTableJSON)
                aBlurb = VegetationTreatments + CommunitesatRiskBlurb + FireStationBlurb

                margintop = 140
                var imgData = 'data:image/png;base64,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'
                var imgBackgrounds = 'data:image/png;base64,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'
                var imgBackground = 'data:image/png;base64,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'
                var doc = new jsPDF('p', 'pt')
                doc.addImage(imgBackground, 'PNG', 0, 0, 594, 120)
                doc.addImage(imgData, 'PNG', 10, 10)
                doc.setFontSize(20)
                doc.text(122, 67, 'New Mexico Wildfire Risk Assesment Report')
                doc.setFontSize(15)

                if (FireStationBlurb != "") {
                    doc.text(22, margintop, "Fire Stations")
                    doc.setFontSize(10)
                    var FireStationBlurbSplit = doc.splitTextToSize(FireStationBlurb, 540);
                    margintop = margintop + 20
                    doc.text(22, margintop, FireStationBlurbSplit)
                    margintop = margintop + FireStationMargin
                }

                if (CommunitesatRiskBlurb != "") {
                    margintop = margintop + 20
                    doc.setFontSize(15)
                    doc.text(22, margintop, "Communites at Risk")
                    doc.setFontSize(10)
                    var CommunitesatRiskBlurbSplit = doc.splitTextToSize(CommunitesatRiskBlurb, 540);
                    margintop = margintop + 10
                    doc.text(22, margintop, CommunitesatRiskBlurbSplit)
                    margintop = margintop + CommunitesatRiskMargin
                }
                if (VegetationTreatments != "") {
                    margintop = margintop + 20
                    doc.setFontSize(15)
                    doc.text(22, margintop, "Vegetation Treatments")
                    doc.setFontSize(10)
                    var VegetationTreatmentsSplit = doc.splitTextToSize(VegetationTreatments, 540);
                    margintop = margintop + 10
                    doc.text(22, margintop, VegetationTreatmentsSplit)
                    margintop = margintop + VegetationTreatmentsMargin

                    console.log(ordereddata)
                }
                if (HasVegTable === true) {
                    margintop = margintop + 20
                    doc.setFontSize(15)
                    doc.text(22, margintop, "Vegetation Treatments")
                    var columns = ReportTableJSON[3].col//["ID", "Name", "Country"];
                    var rows = ReportTableJSON[3].rows
                    margintop = margintop + 20
                    doc.autoTable(columns, rows, {
                        margin: { top: margintop },
                        styles: { cellPadding: 0.5, fontSize: 8 }
                    });
                }
                doc.output('save', 'NMWRAP-Report.pdf');
            }
        });






    })


    function BuildTable(orderedobj) {
        Lid = orderedobj[0].layerId
        TmpArray = []
        excludelist = ["OBJECTID", "Shape", "Shape_Length", "Shape_Area", "Land Owner", "Partners in accomplishing work", "Agency", "Acre (US)", "Project_Type"]
        for (key in orderedobj["0"].attributes) {
            if (isInArray(key, excludelist)) {

            } else {
                TmpArray.push(key)
            }
        }
        ReportTableJSON[Lid] = {}
        ReportTableJSON[Lid].col = TmpArray
        rows = []
        orderedobj.forEach(function (treat) {
            innerRow = []
            ReportTableJSON[Lid].col.forEach(function (name) {
                innerRow.push(treat.attributes[name])
            })
            rows.push(innerRow)
        })
        ReportTableJSON[Lid].rows = rows
    }
    var action

    function goodchoice(isgood) {
        if (isgood == true) {
            document.getElementById("GenReport").disabled = false;
        } else if (isgood == false) {
            document.getElementById("GenReport").disabled = true;
        }
    }

    function toptoolbar(buttonclicked) {
        console.log(buttonclicked)
        clearTheseButtons = topbuttonlist.filter(function (bc) {
            return bc != buttonclicked;
        });
        console.log(clearTheseButtons)
        clearTheseButtons.forEach(function (element) {
            $(element).removeClass('active');
            $(element).blur();
        });
        if ($(buttonclicked).hasClass('active')) {
            $(buttonclicked).toggleClass('active');
            $(buttonclicked).blur();
            if (buttonclicked == "#PrintBtn") {
                view.ui.remove(print, "top-right");
            } else if (buttonclicked == "#ReportButton") {
                $("#reportbox").hide();
            } else if (buttonclicked == "#InfoBtn") {
                clickEnabled = "risk"
            } else if (buttonclicked == "#MeasureButton") {
                clickEnabled = "risk"
                view.graphics.removeAll();
                
                $("#measurebox").hide();
            }

            console.log("active so deacivating")
        } else {
            $(buttonclicked).toggleClass('active');
            console.log("activating")
            if (buttonclicked == "#PrintBtn") {
                view.ui.add(print, "top-right");
                clickEnabled = "risk"
                // view.graphics.removeAll();
                
            } else {
                view.ui.remove(print, "top-right");
            }
            if (buttonclicked == "#ReportButton") {
                $("#reportbox").show();
                clickEnabled = "risk"
                view.graphics.removeAll();
            } else {
                $("#reportbox").hide();
            }
            if (buttonclicked == "#InfoBtn") {
                clickEnabled = "info"
                view.graphics.removeAll();

            }
            if (buttonclicked == "#MeasureButton") {
                $("#measurebox").show();
                action = draw.create("polyline");
                clickEnabled = "measure"
            }else{
                $("#measurebox").hide();
                view.graphics.removeAll();

                $('#measureresult').text("");
            }
        }



    }

    view.ui.add("draw-polygon", "right");

    identifyTask = new IdentifyTask(NMWRAPurl);
    params = new IdentifyParameters();
    params.tolerance = 1;
    params.layerIds = [activelayer];
    params.width = view.width;
    params.height = view.height;
    function cleartooltips() {
        $('.wf').tooltip('hide')
        $('.pop').tooltip('hide')
        $('.wui').tooltip('hide')
        $('.arw').tooltip('hide')
        $('.ttborder').css('border', '3px solid black');
    }


    //    ___       _      __              __  ___            
    //   / _ \___  (_)__  / /____ ________/  |/  /__ _  _____ 
    //  / ___/ _ \/ / _ \/ __/ -_) __/___/ /|_/ / _ \ |/ / -_)
    // /_/   \___/_/_//_/\__/\__/_/     /_/  /_/\___/___/\__/ 




    view.on("pointer-move", pointereventHandler);
    function pointereventHandler(event) {
        params.geometry = view.toMap({ x: event.x, y: event.y })
        params.mapExtent = view.extent;
        params.layerIds = [activelayer];
        identifyTask.execute(params).then(function (response) {
            if (activelayer == "9") {
                //   $('.wfvalue').text(response.results["0"].feature.attributes.CLASS_DESC);
                cleartooltips();
                if (response.results["0"].feature.attributes.CLASS_DESC == "6: Non-burnable") {
                    $('#wf-1').tooltip('show')
                    document.getElementById("wf-1").style.border = "3px solid LightGray";
                } else if (response.results["0"].feature.attributes.CLASS_DESC == "7: Water") {
                    $('#wf0').tooltip('show')
                    document.getElementById("wf0").style.border = "3px solid LightGray";
                } else if (response.results["0"].feature.attributes.CLASS_DESC == "1: Very Low") {
                    $('#wf1').tooltip('show')
                    document.getElementById("wf1").style.border = "3px solid LightGray";
                } else if (response.results["0"].feature.attributes.CLASS_DESC == "2: Low") {
                    $('#wf2').tooltip('show')
                    document.getElementById("wf2").style.border = "3px solid LightGray";
                } else if (response.results["0"].feature.attributes.CLASS_DESC == "3: Moderate") {
                    $('#wf3').tooltip('show')
                    document.getElementById("wf3").style.border = "3px solid LightGray";
                } else if (response.results["0"].feature.attributes.CLASS_DESC == "4: High") {
                    $('#wf4').tooltip('show')
                    document.getElementById("wf4").style.border = "3px solid LightGray";
                } else if (response.results["0"].feature.attributes.CLASS_DESC == "5: Very High") {
                    $('#wf5').tooltip('show')
                    document.getElementById("wf5").style.border = "3px solid LightGray";

                }
            } else if (activelayer == "8") {
                cleartooltips();
                var popval = "#pop" + response.results["0"].feature.attributes["Class value"]
                $(popval).tooltip('show')
            } else if (activelayer == "7") {
                cleartooltips();
                if (response.results.length > 0) {
                    var wuival = "#wui" + response.results["0"].feature.attributes.WUIFLAG10
                    $(wuival).tooltip('show')
                } else {
                    $('#wui0').tooltip('show')
                }
            } else if (activelayer == "6") {
                cleartooltips();
                arwvalue = Math.ceil(parseFloat(response.results["0"].feature.attributes.Group_v1)).toString()
                var arwval = "#arw" + arwvalue
                $(arwval).tooltip('show')
            }
        })
    }
    view.ui.move("zoom", "top-right");
    var searchWidget = new Search({
        view: view
    });
    var extent = new Extent({
        "spatialReference": {
            "wkid": 102100
        },
        "xmin": -1.227682587657231E7,
        "ymin": 3968095.553478353,
        "xmax": -1.1329151969027687E7,
        "ymax": 4470424.090965004
    });
    var defaultSource = searchWidget.defaultSource;
    defaultSource.countryCode = "US";
    defaultSource.searchExtent = extent;
    searchWidget.container = "searchwidge"



    //   ________     __  
    //  / ___/ (_)___/ /__
    // / /__/ / / __/  '_/
    // \___/_/_/\__/_/\_\ 




    view.on("click", function (evt) {
        console.log(clickEnabled)
        if (clickEnabled === "measure") {


            // create an instance of draw polyline action


            // fires when a vertex is added
            action.on("vertex-add", function (evt) {
               // console.log("1")
                measureLine(evt.vertices);
            });

            // fires when the pointer moves
            action.on("cursor-update", function (evt) {
                measureLine(evt.vertices);
               // console.log("1")
            });

            // fires when the drawing is completed
            action.on("draw-complete", function (evt) {
                measureLine(evt.vertices);
               // console.log("1")
               action = draw.create("polyline");
            });

            // fires when a vertex is removed
            action.on("vertex-remove", function (evt) {
                measureLine(evt.vertices);
              //  console.log("1")
            });

            function measureLine(vertices) {
                view.graphics.removeAll();
               // console.log(vertices)

                var graphic = new Graphic({
                    geometry: new Polyline({
                        paths: vertices,
                        spatialReference: view.spatialReference
                    }),
                    symbol: {
                        type: "simple-line", // autocasts as new SimpleFillSymbol
                        color: [4, 90, 141],
                        width: 4,
                        cap: "round",
                        join: "round"
                    }
                });

                view.graphics.add(graphic);

                // var line = createLine(vertices);
                var lineLength = geometryEngine.geodesicLength(graphic.geometry, "miles");
                // labelAreas(graphic.geometry, lineLength)
                console.log(lineLength.toFixed(2).toString() + " Miles") 
                $('#measureresult').text(lineLength.toFixed(2).toString() + " Miles");
                // var graphic = createGraphic(line);
                // view.graphics.add(graphic);
            }
        }



        if (clickEnabled === "risk") {
            var clicklat = evt.mapPoint.latitude.toFixed(2);
            var clicklon = evt.mapPoint.longitude.toFixed(2);
            // console.log(evt)
            var point = view.toMap({
                x: evt.x,
                y: evt.y
            });

            params.geometry = point
            params.mapExtent = view.extent;
            params.layerIds = [11]
            pointLayer.removeAll();
            buffLayer.removeAll();

            //console.log(params.mapExtent)
            identifyTask.execute(params).then(function (response) {
                if (response.results.length == 0) {
                    goodchoice(false)
                    $('.yrinstruct').text("Click inside the NM boundary to see risk");
                    $('.yrgeom').text("")
                    $('.yrvalue').text("");
                    $('.riskblurb').text(defaultblurb);
                    document.getElementById("riskstatus").style["border-top"] = "1px transparent";
                    document.getElementById("riskstatus").style["border-bottom"] = "1px transparent";
                    document.getElementById("riskstatus").style["background-color"] = "#f8f9fa";
                } else if (response.results["0"].feature.attributes["Pixel Value"] == "0") {
                    goodchoice(false)
                    $('.yrinstruct').text("Click inside the NM boundary to see risk");
                    $('.yrgeom').text("");
                    $('.yrvalue').text("");
                    $('.riskblurb').text(defaultblurb);
                    document.getElementById("riskstatus").style["border-top"] = "1px transparent";
                    document.getElementById("riskstatus").style["border-bottom"] = "1px transparent";
                    document.getElementById("riskstatus").style["background-color"] = "#f8f9fa";
                } else {
                    goodchoice(true)
                    // console.log("wut")
                    $('.yrinstruct').text("Click on the map to see your risk");
                    pixelvalue = response.results["0"].feature.attributes["Pixel Value"]
                    var bgcolor;
                    var textcolor;
                    var riskstring
                    switch (pixelvalue) {
                        case '1':
                            bgcolor = "green";
                            textcolor = "white";
                            blurb = "Very Low Risk: Areas with very low risk are Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident."
                            riskstring = "Very Low Risk"
                            break;
                        case "2":

                            bgcolor = "lightgreen";
                            textcolor = "black";
                            blurb = "Low Risk: An area with low risk to wildfire is Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident."
                            riskstring = "Low Risk"
                            break;
                        case '3':
                            bgcolor = "#ffff74";
                            textcolor = "black";
                            blurb = "Moderate Risk: An area with moderate risk is Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.";
                            riskstring = "Moderate Risk"
                            break;
                        case '4':
                            bgcolor = "#ffa900";
                            textcolor = "black";
                            blurb = "High Risk: An area with high risk is Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.";
                            riskstring = "High Risk"
                            break;
                        case '5':
                            bgcolor = "red";
                            textcolor = "white";
                            blurb = "Very High Risk: To begin preparing, you should build an emergency kit and make a family communications plan.Design and landscape your home with wildfire safety in mind. Select materials and plants that can help contain fire rather than fuel it.Use fire-resistant or noncombustible materials on the roof and exterior structure of the dwelling, or treat wood or combustible material used in roofs, siding, decking or trim with fire-retardant chemicals."
                            riskstring = "Very High Risk"
                            break;
                        case '6':
                            bgcolor = " #a2d9ce";
                            textcolor = "black";
                            blurb = "Minimal Risk: An area with minimal wildfire risk is Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident."
                            riskstring = "Minimal Wildfire Risk"
                            break;
                        case '7':
                            bgcolor = " #a2d9ce ";
                            textcolor = "black";
                            blurb = "Minimal Risk: An area with minimal wildfire risk is Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident."
                            riskstring = "Minimal Wildfire Risk"
                    }
                    document.getElementById("riskstatus").style["border-top"] = "1px solid";
                    document.getElementById("riskstatus").style["border-bottom"] = "1px solid";
                    document.getElementById("riskstatus").style["background-color"] = bgcolor;
                    document.getElementById("riskstatus").style["color"] = textcolor;
                    document.getElementById("riskstatus").style["border-color"] = "black";
                    $('.yrvalue').text(riskstring);
                    $('.yrgeom').text(clicklat.toString() + "\u00B0 N " + clicklon.toString() + "\u00B0")//.text(params.geometry.latitude.toString() + "  " + params.geometry.longitude.toString())
                    $('.riskblurb').text(blurb);
                    var buffer = geometryEngine.geodesicBuffer(point, .25, "miles");
                    newrings = []
                    buffer.rings[0].forEach(function (element, index) {
                        if (index % 2 == 0) {
                            latlon = []
                            latlon.push(element[0].toFixed(2))
                            latlon.push(element[1].toFixed(2))
                            newrings.push(latlon);
                        }
                    });
                    apigeometry = { "rings": [newrings] }
                    reporturl = 'https://edacarc.unm.edu/arcgis/rest/services/NMWRAP/NMWRAP/MapServer/identify?geometry='
                    reporturl = reporturl + JSON.stringify(apigeometry) + '&geometryType=esriGeometryPolygon&sr=102100&layerDefs=&time=&layerTimeOptions=&tolerance=0&mapExtent=-12282336.546622703,3646597.8836240033,-11498398.384530144,4491685.668344687&imageDisplay=1855,856,96&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&dynamicLayers=&returnZ=false&returnM=false&gdbVersion=&f=pjson&layers=all'
                    buffLayer.add(new Graphic({
                        geometry: buffer,
                        symbol: polyBuff
                    }));
                    pointLayer.add(new Graphic({
                        geometry: buffer,
                        symbol: pointBuff
                    }));
                    $("#layers").collapse('hide');
                    return false;
                }

            })


        }
    });

});
$(document).ready(function () {


    function isEven(n) {
        return n % 2 == 0;
    }

    $('.yrinstruct').text("Click on the map to see your risk");
    $("#riskbutton").click(function () {
        $("#layers").collapse('hide');
        return false;
    });
    $("#layersbutton").click(function () {
        $("#yourrisk").collapse('hide');
        return false;
    });
    $('#yourrisk').on('hidden.bs.collapse', function () {
        $("#layers").collapse('show');
    })
    $('#layers').on('hidden.bs.collapse', function () {
        $("#yourrisk").collapse('show');
    })

    $("#collapseOne").on('show.bs.collapse', function () {
        $("#collapseTwo").collapse('hide');
        $("#collapseThree").collapse('hide');
    })
    $("#collapseTwo").on('show.bs.collapse', function () {
        $("#collapseOne").collapse('hide');
        $("#collapseThree").collapse('hide');
    })
    $("#collapseThree").on('show.bs.collapse', function () {
        $("#collapseTwo").collapse('hide');
        $("#collapseOne").collapse('hide');
    })

    $('[data-toggle="tooltip"]').tooltip()
    $('.riskblurb').text(defaultblurb);
    $(".infopop").mouseover(function (val) {
        console.log(val.target.id)
        if (val.target.id == "info13") {

            opt = {
                container: 'body',
                template: '<div class="popover" role="tooltip"><div class="arrow"></div><div><img src="images/firestations.png" alt="">Fire Stations</div></div>',
                title: 'Fire Stations',
                placement: 'right'
            }
            $('#info13').popover(opt)
            $('#info13').popover("show")
        }
        else if (val.target.id == "info14") {
            opt = {
                container: 'body',
                template: '<div class="popover" role="tooltip"><div class="arrow"></div><div><img src="images/CARlow.png" alt="">Low<br><img src="images/CARmedium.png" alt="">Medium<br><img src="images/CARhigh.png" alt="">High</div></div>',

                title: 'Communites at Risk',
                placement: 'right'
            }
            $('#info14').popover(opt)
            $('#info14').popover("show")

        } else if (val.target.id == "info15") {
            opt = {
                container: 'body',
                template: '<div class="popover" role="tooltip"><div class="arrow"></div><div><img src="images/CityBoundaries.png" alt="">Incorporated City Boundaries</div></div>',
                title: 'Incorporated City Boundaries',
                placement: 'right'
            }
            $('#info15').popover(opt)
            $('#info15').popover("show")

        } else if (val.target.id == "info16") {
            opt = {
                container: 'body',
                template: '<div class="popover" role="tooltip"><div class="arrow"></div><div><img src="images/veg.png" alt="">Vegetation Treatments</div></div>',
                title: 'Vegetation Treatments',
                placement: 'right'
            }
            $('#info16').popover(opt)
            $('#info16').popover("show")

        } else if (val.target.id == "info17") {
            opt = {
                container: 'body',
                template: '<div class="popover" role="tooltip"><div class="arrow"></div><div><img src="images/watersheds.png" alt="">Watersheds HUC8</div></div>',
                title: 'Watersheds HUC8',
                placement: 'right'
            }
            $('#info17').popover(opt)
            $('#info17').popover("show")

        } else if (val.target.id == "info18") {
            opt = {
                container: 'body',
                template: '<div class="popover" role="tooltip"><div class="arrow"></div><div><img src="images/county.png" alt="">County</div></div>',
                title: 'County',
                placement: 'right'
            }
            $('#info18').popover(opt)
            $('#info18').popover("show")

        } else {
            $("#" + val.target.id).popover("show");
        }
    }).mouseout(function () {

        $(".infopop").popover('hide');
    });

});
var legend9 = '<div class="col-3">Wildfire Potential</div><div data-toggle="tooltip" data-delay=0 data-animation=false data-placement="top" title="No Risk" class="col-1" style="border: 3px solid black; border-radius: 7px;  margin:2px; background: white;"></div><div data-toggle="tooltip" data-delay=0 data-animation=false data-placement="top" title="Very Low" class="col-1" style="border: 3px solid black; border-radius: 7px;  margin:2px; background:green;"></div><div data-toggle="tooltip" data-delay=0 data-animation=false data-placement="top" title="Low" class="col-1" style="border: 3px solid black; border-radius: 7px;  margin:2px; background:lightgreen;"></div><div data-toggle="tooltip" data-delay=0 data-animation=false data-placement="top" title="Moderate" class="col-1" style="border: 3px solid black; border-radius: 7px;  margin:2px; background: #ffff74;"></div><div data-toggle="tooltip" data-delay=0 data-animation=false data-placement="top" title="High" class="col-1" style="border: 3px solid black; border-radius: 7px;  margin:2px; background:#ffa900;"></div><div data-toggle="tooltip" data-delay=0 data-animation=false data-placement="top" title="Very High" class="col-1" style="border: 3px solid black; border-radius: 7px;  margin:2px; background: red;"></div><div class="col-2">';
$(".bottomLegend").replaceWith(legend9);
