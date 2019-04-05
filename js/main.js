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
})