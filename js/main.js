require([
    "esri/Map",
    "esri/WebMap",
    "esri/views/MapView",
    "esri/widgets/Home",
    "esri/widgets/Directions",
    "esri/widgets/Expand"
], function(Map, WebMap, MapView, Home, Directions, Expand){

    //load the webmap to the application
    const webmap = new WebMap({
        portalItem: {
            id: "36b293c47c744ba9bad3329b8f6a3da0"
        }
    });

    //Add the view
    const view = new MapView({
        map: webmap,
        container: "viewDiv"
    });

    //Add a Home button
    const homeWidget = new Home({
        view: view
    });
    view.ui.add(homeWidget, "top-left");

    //Add the directions to an expand box
    const directionWidget = new Directions({
        view: view,
        routeServiceUrl: "https://utility.arcgis.com/usrsvcs/appservices/vcEgOcIHpPKKRSiK/rest/services/World/Route/NAServer/Route_World"
    });
    const directionExpand = new Expand({
        expandIconClass: "esri-icon-directions",
        expandTooltip: "Directions",
        expanded: false,
        view: view,
        content: directionWidget,
        mode: "floating"
    });
    view.ui.add(directionExpand, "top-right");

    //Add a help expand for the user
    const infoContent = document.createElement("div");
    infoContent.style.padding = "5px";
    infoContent.style.backgroundColor = "black";
    infoContent.style.width = "250px";
    infoContent.innerHTML = [
        "<div id='title' class='esri-widget'>",
        "This application is to show the different restaurants around Houston that we want to try.",
        "<br><br>The application has a widget for the user to get directions to the different restaurants.",
        "<br><br>The blue dots represent restaurants we've already eaten at while the reds dots represents restaurants we want to eat at."
    ].join(" ");
    const infoExpand = new Expand({
        expandIconClass: "esri-icon-chat",
        expandTooltip: "Application Help",
        view: view,
        content: infoContent,
        expanded: view.widthBreakpoint !== "xsmall"
    });
    view.ui.add(infoExpand, "top-left");
})
