require([
  "esri/Map",
  "esri/WebMap",
  "esri/views/MapView",
  "esri/widgets/Home",
  "esri/widgets/Directions",
  "esri/widgets/Expand",
  "esri/layers/FeatureLayer",
  "esri/widgets/Locate",
  "esri/layers/GraphicsLayer",
  "esri/tasks/RouteTask",
  "esri/tasks/support/RouteParameters",
  "esri/tasks/support/FeatureSet",
  "esri/Graphic",
  "esri/widgets/LayerList",
  "esri/widgets/Zoom"
], function(
  Map,
  WebMap,
  MapView,
  Home,
  Directions,
  Expand,
  FeatureLayer,
  Locate,
  GraphicsLayer,
  RouteTask,
  RouteParameters,
  FeatureSet,
  Graphic,
  LayerList,
  Zoom
) {
  var restaurantLayerView;

  //Create the map
  var map = new Map({
    basemap: "streets-navigation-vector"
  });

  //Add the view
  var view = new MapView({
    map: map,
    container: "viewDiv",
    center: [-95.555, 29.756],
    zoom: 9,
    popup: {
      actionsMenuEnabled: false
    }
  });
  view.ui.remove("zoom");

  //Add the zoom buttons
  var zoom = new Zoom({
    view: view
  });
  view.ui.add(zoom, "top-left");

  //Action item to be added to the popup template
  var restaurantDirection = {
    title: "Directions",
    id: "directions-to",
    className: "esri-icon-tracking"
  };

  //Action item to display the menu
  var restaurantMenu = {
    title: "Menu",
    id: "menu-display",
    className: "esri-icon-review"
  };

  //Create the needed information for the route task
  var routeTask = new RouteTask({
    url:
      "https://utility.arcgis.com/usrsvcs/appservices/vcEgOcIHpPKKRSiK/rest/services/World/Route/NAServer/Route_World"
  });

  var routeLayer = new GraphicsLayer();
  routeLayer.listMode = "hide";

  var routeParams = new RouteParameters({
    stops: new FeatureSet()
  });

  var stopSymbol = {
    type: "simple-marker",
    style: "cross",
    size: 12,
    outline: {
      width: 4
    }
  };

  var routeSymbol = {
    type: "simple-line",
    color: [0, 0, 255, 0.5],
    width: 2
  };

  //Create the popup templates
  var topRestaurantTemplate = {
    expressionInfos: [{
      name: "ranking",
      title: "Ranking",
      expression: "if ($feature.Ranking == 'NA'){'restaurant that has not been ranked by Eric Sandler, but we want to try.'}else{'restaurant ranked '+$feature.Ranking+ ' by Eric Sandler.'}"
    }],
    title: "{Name}",
    content: [
      {
        type: "text",
        text: 
          "<b>{Name}</b> is a <b>{Type}</b> {expression/ranking}<br/><br/>{Name} is located at <b>{Address}, {City}, TX {ZIP}</b>."+
          " {Name} is in the <b>{Price}</b> price range."
      }
    ],
    actions: [restaurantDirection]
  };

  //Houston's Top 100 restaurants based on Eric Sandler broken out by his levels
  var topRestaurants = new FeatureLayer({
    url: "https://services7.arcgis.com/CNA1UqWfbopIY83R/ArcGIS/rest/services/Top100_Restaurants/FeatureServer/0",
    outFields: ["*"],
    popupTemplate: topRestaurantTemplate,
    title: "Top 100 Restaurants"
  });
  map.add(topRestaurants);
  map.add(routeLayer);

  //Add a Home button
  var homeWidget = new Home({
    view: view
  });
  view.ui.add(homeWidget, "top-left");

  //Part of the popup action
  function success(pos) {
    routeParams.stops.features.pop();
    long = pos.coords.longitude;
    lat = pos.coords.latitude;
    var point = {
      type: "point",
      longitude: long,
      latitude: lat
    };

    //Create a point graphic to display the user's current location
    var stop = new Graphic({
      geometry: point,
      symbol: stopSymbol
    });
    routeLayer.add(stop);
    routeParams.stops.features.push(stop);

    // Get the geometry of the popup
    var restaurantLat = view.popup.selectedFeature.geometry.latitude;
    var restaurantLong = view.popup.selectedFeature.geometry.longitude;
    var restaurantPoint = {
      type: "point",
      longitude: restaurantLong,
      latitude: restaurantLat
    };
    var restaurantStop = new Graphic({
      geometry: restaurantPoint,
      symbol: stopSymbol
    });
    routeLayer.add(restaurantStop);
    routeParams.stops.features.push(restaurantStop);

    //Check to see if 2 stops have been added
    if (routeParams.stops.features.length >= 2) {
      routeTask.solve(routeParams).then(showRoute);
    }
  }

  //Show the solved route on the map for the user
  function showRoute(data) {
    var routeResult = data.routeResults[0].route;
    routeResult.symbol = routeSymbol;
    routeLayer.add(routeResult);
  }

  //Create the function that will be called when the user clicks the feature action
  function directionsTo() {
    if (window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(success);
    } else {
      console.log("Not working");
    }
  }

  //Create the function to display the menu
  function menuDisplay() {
    var attributes = view.popup.selectedFeature.attributes;
    var info = attributes.Menu;
    if (info) {
      window.open(info.trim());
    }
  }

  view.popup.on("trigger-action", function(event) {
    if (event.action.id === "directions-to") {
      directionsTo();
    } else if (event.action.id === "menu-display") {
      menuDisplay();
    }
  });

  //Create the layer list with legend capabilities
  var layerList = new LayerList({
    view: view,
    listItemCreatedFunction: function(event){
      var item = event.item;
      if (item.layer.type != "group"){
        item.panel = {
          content: "legend",
          open: true
        };
      }
    }
  });

  var layerButton = new Expand({
    expandIconClass: "esri-icon-layer-list",
    expandTooltip: "View the Layers",
    view: view,
    content: layerList,
    mode: "floating",
    group: "top-left"
  });

  view.ui.add(layerButton, "top-left");

  //Determine where to place the widgets
  isResponsiveSize = view.widthBreakpoint === "xsmall";
  updateView(isResponsiveSize);

  //Watch for Breakpoints
  view.watch("widthBreakpoint", function(breakpoint){
      switch(breakpoint){
          case "xsmall":
          case "small":
              updateView(true);
              break;
          case "medium":
          case "large":
          case "xlarge":
              updateView(false);
              break;
          default:
      }
  });

  //Functions to determine the screen size
  function updateView(isMobile){
    setMobileWidgets(isMobile);
  }

  function setMobileWidgets(isMobile){
    if (isMobile){
      view.ui.add(zoom, "bottom-right");
      view.ui.add(homeWidget, "bottom-right");
      view.ui.add(layerButton, "top-right");
    } else {
      view.ui.add(zoom, "top-left");
      view.ui.add(homeWidget, "top-left");
      view.ui.add(layerButton, "top-left");
    }
  }

  //Allow the user to filter based on price
  var priceNodes = document.querySelectorAll(".price-item");
  var priceElement = document.getElementById("price-filter");

  //Click event handler for price choice
  priceElement.addEventListener("click", filterByPrice);

  //Function to set an attribute filter on top restaurant layer view
  function filterByPrice(event){
    var selectedPrice = event.target.getAttribute("data-price");
    restaurantLayerView.effect ={
      filter: {
        where: "Price IN('" + selectedPrice + "')"
      },
      excludedEffect: "grayscale(100%) opacity(30%)"
    };
  }

  view.whenLayerView(topRestaurants).then(function(layerView){
    //Once the restaurants are loaded get a reference to the layerview
    restaurantLayerView = layerView;

    //Set up the expand button for the filter
    priceElement.style.visibility = "visible";
    var priceExpand = new Expand({
      view: view,
      content: priceElement,
      expandIconClass: "esri-icon-filter",
      group: "top-left"
    });

    //Clear the filters when the user closes the expand widget
    priceExpand.watch("expanded", function(){
      if (!priceExpand.expanded){
        restaurantLayerView.effect = null;
      }
    });
    view.ui.add(priceExpand, "top-left");
    view.ui.add("titleDiv", "top-right");
  });

});


// 1-30: The city's most outstanding restaurants regardless of price, cuisine, location, or style.
// 31-60: Restaurants that are outstanding in their category (the best burgers, barbecue joints, steakhouses, Tex-Mex, etc.).
// 61-90: Restaurants that do most things very well and generally make Houston a better, more exciting place to dine.
// 91-100: Restaurants with one or two outstanding dishes or that I feel a personal affection towards (for example, the French dip at Houston's, which is an outstanding dish at a restaurant that I feel affection for).
