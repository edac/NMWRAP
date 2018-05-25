
//   _   __         _      __   __      
//  | | / /__ _____(_)__ _/ /  / /__ ___
//  | |/ / _ `/ __/ / _ `/ _ \/ / -_|_-<
//  |___/\_,_/_/ /_/\_,_/_.__/_/\__/___/

var NMWRAPurl = "https://edacarc.unm.edu/arcgis/rest/services/NMWRAP/NMWRAP/MapServer"
var activelayer = "9"
var activereflayers = [5]
//becuse I listed them backards...
var activereflayersKey = [5, 4, 3, 2, 1, 0]
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
    "esri/geometry/Polygon",
    "esri/geometry/geometryEngine",
    "esri/widgets/Print",
    "dojo/_base/array",
    "dojo/on",
    "dojo/dom",
    "dojo/domReady!"
], function (Map, MapView, Draw, MapImageLayer, Legend, IdentifyParameters, IdentifyTask, webMercatorUtils, Search, Extent, Fullscreen, LayerList, GraphicsLayer, Graphic, Polyline, Polygon, geometryEngine, Print, arrayUtils, on, dom) {
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
    console.log(slider)
    var slider2 = document.getElementById("RefRange");
    var output = document.getElementById("demo");
    var refrgnpct = document.getElementById("RefRangepct");
    output.innerHTML = slider.value;
    refrgnpct.innerHTML = slider2.value;

    $('#myRange').on('change', function () {
        console.log("aa")
        output.innerHTML = this.value;
        var newopacity = this.value / 100
        dangerLyr.opacity = newopacity
    })

    $('#RefRange').on('change', function () {
        console.log(this.value)
        refrgnpct.innerHTML = this.value;
        var newopacity = this.value / 100
        RefLyr.opacity = newopacity
    })

    // slider.oninput = function () {
    //     console.log("aa")
    //     output.innerHTML = this.value;
    //     var newopacity = this.value / 100
    //     dangerLyr.opacity = newopacity
    // }
    // slider2.oninput = function () {
    //     output.innerHTML = this.value;
    //     var newopacity = this.value / 100
    //     RefLyr.opacity = newopacity
    // }

    var reporturl = ""

    var apigeometry = {}

    //    __                     ____       _ __      __          
    //   / /  ___ ___ _____ ____/ __/    __(_) /_____/ /  ___ ____
    //  / /__/ _ `/ // / -_) __/\ \| |/|/ / / __/ __/ _ \/ -_) __/
    // /____/\_,_/\_, /\__/_/ /___/|__,__/_/\__/\__/_//_/\__/_/   
    //           /___/                                            



    //polyfill for garbage IE
    // https://tc39.github.io/ecma262/#sec-array.prototype.find
    if (!Array.prototype.find) {
        Object.defineProperty(Array.prototype, 'find', {
            value: function (predicate) {
                // 1. Let O be ? ToObject(this value).
                if (this == null) {
                    throw new TypeError('"this" is null or not defined');
                }

                var o = Object(this);

                // 2. Let len be ? ToLength(? Get(O, "length")).
                var len = o.length >>> 0;

                // 3. If IsCallable(predicate) is false, throw a TypeError exception.
                if (typeof predicate !== 'function') {
                    throw new TypeError('predicate must be a function');
                }

                // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
                var thisArg = arguments[1];

                // 5. Let k be 0.
                var k = 0;

                // 6. Repeat, while k < len
                while (k < len) {
                    // a. Let Pk be ! ToString(k).
                    // b. Let kValue be ? Get(O, Pk).
                    // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                    // d. If testResult is true, return kValue.
                    var kValue = o[k];
                    if (predicate.call(thisArg, kValue, k, o)) {
                        return kValue;
                    }
                    // e. Increase k by 1.
                    k++;
                }

                // 7. Return undefined.
                return undefined;
            },
            configurable: true,
            writable: true
        });
    }



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
                    activereflayers.push(activereflayersKey[i])
                } else {
                    ReflayerObject[i].visible = false
                    console.log(i)
                    console.log(activereflayersKey[i])
                    const index = activereflayers.indexOf(activereflayersKey[i]);
                    if (index !== -1) {
                        activereflayers.splice(index, 1);
                    }
                }
                console.log(activereflayers)
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
        $( "#pdfspinner" ).show();
       // $( "#pdfdl" ).hide();
       
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
        var pdfdlname = $( "#reportname" ).val();
        if (pdfdlname===""){
            pdfdlname="NMWRAP-Report.pdf"
        }
        if (pdfdlname.slice((pdfdlname.lastIndexOf(".") - 1 >>> 0) + 2)!="pdf"){
            pdfdlname=pdfdlname+".pdf"
        }

        pdfbasename=pdfdlname.slice(0, -4)


        apigeometry.title = pdfbasename;
console.log(JSON.stringify(apigeometry))

        $.ajax({
            method: "POST",
            url: "/postgeom",
            data: JSON.stringify(apigeometry),
          })
            .done(function( msg ) {
              console.log(msg);
              $( "#pdfspinner" ).hide();
    
             pdfdownloadurl="/getreport/"+msg+"/"+pdfdlname
 
             pdfdlstr='<div><a href="'+pdfdownloadurl+'"<span class="esri-icon-download"></span><span>'+pdfdlname+'</span></a></div>'
             $( ".pdfdl" ).append(pdfdlstr)

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
            $('#GenReportText').text("Create report by clicking the button below.");
        } else if (isgood == false) {
            $('#GenReportText').text("Click on map to define an area of interest.");
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

            } else {
                view.ui.remove(print, "top-right");
            }
            if (buttonclicked == "#ReportButton") {
                $("#reportbox").show();
                clickEnabled = "report"
                view.graphics.removeAll();
                action = draw.create("polygon");
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
            } else {
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

    var measureGeom = {}
    //var measureUnit=""
    $("#unitchoice").change(function () {
        if (jQuery.isEmptyObject(measureGeom) === false) {
            console.log(measureGeom)
            unitchoice = $("#unitchoice").val();
            ll = geometryEngine.geodesicLength(measureGeom, unitchoice);
            console.log(ll)
            $('#measureresult').text(ll.toFixed(2).toString() + " " + unitchoice);
        }
    });


    view.on("click", function (evt) {
        console.log(clickEnabled)
        if (clickEnabled === "report") {

            action.on("vertex-add", function (evt) {
                // console.log(evt)
                MakePoly(evt.vertices);
            });

            action.on("cursor-update", function (evt) {
                MakePoly(evt.vertices);
            });

            action.on("draw-complete", function (evt) {
                MakePoly(evt.vertices);
                document.getElementById("GenReport").disabled = false;
                action = draw.create("polygon");
            });

            action.on("vertex-remove", function (evt) {
                MakePoly(evt.vertices);
            });

            function MakePoly(vertices) {
                view.graphics.removeAll();

                var graphic = new Graphic({
                    geometry: new Polygon({
                        hasZ: true,
                        rings: vertices,
                        spatialReference: view.spatialReference
                    }),
                    symbol: {
                        type: "simple-fill",
                        color: [227, 139, 79, 0.5]
                    }

                });

                apigeometry = { "rings": [vertices] }
                console.log(apigeometry)
                reporturl = 'https://edacarc.unm.edu/arcgis/rest/services/NMWRAP/NMWRAP/MapServer/identify?geometry='
                reporturl = reporturl + JSON.stringify(apigeometry) + '&geometryType=esriGeometryPolygon&sr=102100&layerDefslayer=&time=&layerTimeOptions=&tolerance=0&mapExtent=-12282336.546622703,3646597.8836240033,-11498398.384530144,4491685.668344687&imageDisplay=1855,856,96&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&dynamicLayers=&returnZ=false&returnM=false&gdbVersion=&f=pjson&layers=all'

                view.graphics.add(graphic);
            }
        }
        if (clickEnabled === "measure") {
            unitchoice = $("#unitchoice").val();
            console.log(unitchoice)
            // create an instance of draw polyline action


            // fires when a vertex is added
            action.on("vertex-add", function (evt) {

                measureLine(evt.vertices);
            });

            // fires when the pointer moves
            action.on("cursor-update", function (evt) {
                measureLine(evt.vertices);

            });

            // fires when the drawing is completed
            action.on("draw-complete", function (evt) {
                measureLine(evt.vertices);

                action = draw.create("polyline");
            });

            // fires when a vertex is removed
            action.on("vertex-remove", function (evt) {
                measureLine(evt.vertices);

            });

            function measureLine(vertices) {
                view.graphics.removeAll();


                var graphic = new Graphic({
                    geometry: new Polyline({
                        paths: vertices,
                        spatialReference: view.spatialReference
                    }),
                    symbol: {
                        type: "simple-line", // autocasts as new SimpleFillSymbol
                        color: [68, 68, 68],
                        width: 4,
                        cap: "round",
                        join: "round"
                    }
                });




                view.graphics.add(graphic);

                lineLength = geometryEngine.geodesicLength(graphic.geometry, unitchoice);

                console.log(typeof graphic.geometry)
                measureGeom = graphic.geometry
                measureUnit = unitchoice
                console.log(typeof unitchoice)
                console.log(unitchoice)
                $('#measureresult').text(lineLength.toFixed(2).toString() + " " + unitchoice);

            }

        }

        if (clickEnabled === "info") {
            var clicklat = evt.mapPoint.latitude.toFixed(2);
            var clicklon = evt.mapPoint.longitude.toFixed(2);
            var point = view.toMap({
                x: evt.x,
                y: evt.y
            });
            var activereflayersRev = activereflayers
            identifyTask = new IdentifyTask(NMWRAPurl);
            infoparams = new IdentifyParameters();
            infoparams.tolerance = 5;
            infoparams.layerIds = activereflayersRev.reverse() //[0, 1, 2, 3, 4, 5];
            infoparams.layerOption = "top";
            infoparams.width = view.width;
            infoparams.height = view.height;

            infoparams.geometry = point
            infoparams.mapExtent = view.extent;
            // params.layerIds = [5, 4, 3, 2, 1, 0];
            console.log(infoparams)

            identifyTask.execute(infoparams).then(function (response) {
                console.log(response)
                var results = response.results;
                console.log(results)
                return arrayUtils.map(results, function (result) {
                    console.log(result)
                    var feature = result.feature;

                    var layerName = result.layerName;
                    console.log(feature)
                    feature.attributes.layerName = layerName;
                    if (layerName === 'County') {
                        feature.popupTemplate = { // autocasts as new PopupTemplate()
                            title: " County",
                            content: "<b>Name: </b> {NAME}"
                        };
                    }
                    else if (layerName === 'Watersheds HUC8') {
                        feature.popupTemplate = { // autocasts as new PopupTemplate()
                            title: "{NAME}",
                            content: "<b>HUC8: </b> {HUC8} <br><b>Number of Communities: </b> {No Communities in Watershed} " +
                                "<br><b>Rank:</b> {Rank Text}"
                        };
                    }
                    else if (layerName === 'Vegetation Treatments') {
                        feature.popupTemplate = { // autocasts as new PopupTemplate()
                            title: layerName + " {OBJECTID}",
                            content: "<b>Acre (US): </b> {Acre (US)} <br> <b>Agency: </b> {Agency} <br> <b>Land Owner: </b> {Land Owner} <br> <b>Name of Treatment: </b> {Name of Treatment} <br> <b>Object ID: </b> {OBJECTID} <br> <b>Partners: </b> {Partners in accomplishing work} <br> <b>Project Type: </b> {Project_Type} <br> <b>Target Species: </b> {Target Species or Existing Veg} <br> <b>Treatment Description: </b> {Treatment Description} <br> <b>Treatment Type: </b> {Treatment Type} <br> <b>Year (Calendar): </b> {Year (Calendar)}   "
                        };
                    }
                    else if (layerName === 'Incorporated City Boundaries') {
                        feature.popupTemplate = { // autocasts as new PopupTemplate()
                            title: "{NAME10}",
                            content: "<b>Geo ID: </b>{GEOID10}<br><b>Name: </b>{NAME10} <br><b>LSAD Name: </b>{NAMELSAD10} <br><b>Object ID: </b>{OBJECTID} <br>"
                        };
                    }
                    else if (layerName === 'Communites at Risk') {
                        rate = feature.attributes.Rate_2016
                        var rateString;
                        switch (rate) {
                            case 'H':
                                rateString = "High";
                                break;
                            case 'M':
                                rateString = "Medium";
                                break;
                            case 'L':
                                rateString = "Low";
                                break;

                        }
                        feature.popupTemplate = { // autocasts as new PopupTemplate()
                            title: "Communites at Risk",
                            content: "<b>County: </b>{County} <br><b>Name: </b>{NAME} <br><b>Rate for 2016: </b>" + rateString
                        };
                    }
                    else if (layerName === 'Fire Stations') {
                        feature.popupTemplate = { // autocasts as new PopupTemplate()
                            title: "Fire Stations",
                            content: "<b>Name: </b>{Name}<br><b>Address: </b>{Address}<br><b>City: </b>{City}<br>"
                        };
                    }
                    return feature;
                });
            }).then(showPopup); // Send the array of features to showPopup()

            function showPopup(response) {
                // console.log("lol")
                if (response.length > 0) {
                    view.popup.open({
                        features: response,
                        location: evt.mapPoint
                    });
                }
                dom.byId("viewDiv").style.cursor = "auto";
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

    console.log("VVVV")
    if (/*@cc_on!@*/false || !!document.documentMode) {
        // if ($.browser.msie && $.browser.version > 6){

        $("#myRange").addClass('sliderIEisGarbage');
        $("#RefRange").addClass('sliderIEisGarbage');

    } else {
        $("#myRange").addClass('slider');
        $("#RefRange").addClass('slider');

    }

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
    $('#layers').on('hidden.bs.collapse', function (evt) {
        //This is a hack, because I could not get stopPropagation() to work
        if (evt.target.childNodes["0"].parentElement.id === "layers") {
            $("#yourrisk").collapse('show');
        }
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
