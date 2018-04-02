
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
            "esri/geometry/geometryEngine",
            "dojo/on",
            "dojo/dom",
            "dojo/domReady!"
        ], function (Map, MapView, MapImageLayer, Legend, IdentifyParameters, IdentifyTask, webMercatorUtils, Search, Extent, Fullscreen, LayerList, GraphicsLayer, Graphic, geometryEngine, on, dom) {
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
            }, {
                id: 10,
                visible: false
            }, {
                id: 11,
                visible: false
            }]
            var dangerLyr = new MapImageLayer({
                url: NMWRAPurl,
                id: "Danger",
                title: "Risk",
                sublayers: sublayerObject
            });
            var slider = document.getElementById("myRange");
            var output = document.getElementById("demo");
            output.innerHTML = slider.value;
            slider.oninput = function () {
                output.innerHTML = this.value;
                var newopacity = this.value / 100
                dangerLyr.opacity = newopacity
            }


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
                    console.log(item.id)
                    console.log(val)
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
                console.log(activeBaselayer)
                console.log(map)
                map.basemap = this.value

            });

            $(".ReferenceLayers").change(function () {


                ischecked = this.checked

                var val = parseInt(this.value)
                var filteredObj = sublayerObject.find(function (item, i) {

                    if (item.id === val) {
                        if (ischecked) {
                            sublayerObject[i].visible = true
                        } else {
                            sublayerObject[i].visible = false
                        }

                    }
                    dangerLyr.sublayers = sublayerObject
                });



            });

            var map = new Map({
                layers: [dangerLyr],
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
                            // document.getElementById("wf5").style["padding-top"] = "10px";
                            // $('#wf5').style('border:3px solid white;')
                            //document.getElementById("#wf5").style.border="3px solid white";
                            document.getElementById("wf5").style.border = "3px solid LightGray";

                        }
                    } else if (activelayer == "8") {
                        cleartooltips();
                        //  $('.wfvalue').text(response.results["0"].feature.attributes["Class value"]);
                        var popval = "#pop" + response.results["0"].feature.attributes["Class value"]
                        $(popval).tooltip('show')
                    } else if (activelayer == "7") {
                        cleartooltips();
                        if (response.results.length > 0) {
                            var wuival = "#wui" + response.results["0"].feature.attributes.WUIFLAG10
                            $(wuival).tooltip('show')
                            // $('.wfvalue').text(response.results["0"].feature.attributes.WUIFLAG10);
                        } else {
                            $('#wui0').tooltip('show')
                            // $('.wfvalue').text("0");
                        }
                    } else if (activelayer == "6") {
                        cleartooltips();
                        arwvalue = Math.ceil(parseFloat(response.results["0"].feature.attributes.Group_v1)).toString()
                        var arwval = "#arw" + arwvalue
                        $(arwval).tooltip('show')
                        //  $('.wfvalue').text(arwvalue);
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
                    console.log(response.results.length)
                    console.log(response)

                    //console.log("a")
                    if (response.results.length == 0) {
                        console.log('zero')
                        $('.yrinstruct').text("Click inside the NM boundary to see risk");
                        $('.yrgeom').text("")
                        $('.yrvalue').text("");
                        $('.riskblurb').text(defaultblurb);
                        document.getElementById("riskstatus").style["border-top"] = "1px transparent";
                        document.getElementById("riskstatus").style["border-bottom"] = "1px transparent";
                        document.getElementById("riskstatus").style["background-color"] = "#f8f9fa";
                    } else if (response.results["0"].feature.attributes["Pixel Value"] == "0") {
                        // console.log('px zero')
                        $('.yrinstruct').text("Click inside the NM boundary to see risk");
                        $('.yrgeom').text("");
                        $('.yrvalue').text("");
                        $('.riskblurb').text(defaultblurb);
                        document.getElementById("riskstatus").style["border-top"] = "1px transparent";
                        document.getElementById("riskstatus").style["border-bottom"] = "1px transparent";
                        document.getElementById("riskstatus").style["background-color"] = "#f8f9fa";
                    } else {
                        // console.log("wut")
                        $('.yrinstruct').text("Click on the map to see your risk");
                        pixelvalue = response.results["0"].feature.attributes["Pixel Value"]
                        // console.log(pixelvalue)
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
                        console.log('aaaad')
                        document.getElementById("riskstatus").style["border-top"] = "1px solid";
                        document.getElementById("riskstatus").style["border-bottom"] = "1px solid";
                        document.getElementById("riskstatus").style["background-color"] = bgcolor;
                        document.getElementById("riskstatus").style["color"] = textcolor;
                        document.getElementById("riskstatus").style["border-color"] = "black";
                        $('.yrvalue').text(riskstring);
                        $('.yrgeom').text(clicklat.toString() + "\u00B0 N " + clicklon.toString() + "\u00B0")//.text(params.geometry.latitude.toString() + "  " + params.geometry.longitude.toString())
                        $('.riskblurb').text(blurb);
                        var buffer = geometryEngine.geodesicBuffer(point, .25, "miles");
                        //Add new graphic to the bufffer layer
                        buffLayer.add(new Graphic({
                            geometry: buffer,
                            symbol: polyBuff
                        }));
                        //Add the new graphic to the point layer
                        pointLayer.add(new Graphic({
                            geometry: buffer,
                            symbol: pointBuff
                        }));
                        $("#layers").collapse('hide');
                        return false;
                    }
                })


            });

        });
        $(document).ready(function () {
            $('.yrinstruct').text("Click on the map to see your risk");
            $("#riskbutton").click(function () {
                // $("#yourrisk").collapse('hide');
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
