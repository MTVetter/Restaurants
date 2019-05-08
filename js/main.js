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
  "esri/Graphic"
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
  Graphic
) {
  //load the webmap to the application
  // var webmap = new WebMap({
  //     portalItem: {
  //         id: "36b293c47c744ba9bad3329b8f6a3da0"
  //     }
  // });

  //Create the map
  var map = new Map({
    basemap: "streets-navigation-vector"
  });

  //Add the view
  var view = new MapView({
    map: map,
    container: "viewDiv",
    center: [-95.555, 29.756],
    zoom: 10,
    popup: {
      actionsMenuEnabled: false
    }
  });

  //Action item to be added to the popup template
  var restaurantDirection = {
    title: "Directions to Restaurant",
    id: "directions-to",
    className: "esri-icon-tracking"
    // image:
    //   "https://cdn1.iconfinder.com/data/icons/maps-and-navigation-11/24/compass-map-bearing-navigation-maps-gps-heading-directions-512.png"
  };

  //Action item to display the menu
  var restaurantMenu = {
    title: "Display the Menu",
    id: "menu-display",
    className: "esri-icon-review"
  };

  //Create the needed information for the route task
  var routeTask = new RouteTask({
    url:
      "https://utility.arcgis.com/usrsvcs/appservices/vcEgOcIHpPKKRSiK/rest/services/World/Route/NAServer/Route_World"
  });

  var routeLayer = new GraphicsLayer();

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

  //Create Arcade Expressions
  var arcadeExpressionInfos = [
    {
      name: "main",
      title: "Restaurant Info",
      expression: `if ($feature.Type == "Burgers"){
                "This restaurant serves varies different types of burgers."
            } else if ($feature.Type == "Wings"){
                "This restaurant is known for their wings, but also has different types of burgers and sandwiches."
            } else if ($feature.Type == "Poutine"){
                "This restaurant is bringing a Candian tradition to the South."
            } else if ($feature.Type == "BBQ"){
                "This one of many restaurants in Houston that serves BBQ."
            } else if ($feature.Type == "Italian"){
                "This unique restaurant combines a sports bar with an Italian restaurant."
            } else if ($feature.Type == "Chinese"){
                "This Chinese restaurant is extremely unique because it is a combo Chinese/Pizza restaurant."
            } else if ($feature.Type == "Pizza"){
                "This restaurant serves pizza and appears to have a buffet every day from 11-2."
            } else if ($feature.Type == "Seafood"){
                "This is a popular chain restaurant that people have recommended."
            } else if ($feature.Type == "Mediterranean"){
                "We've been to this buffet. This restaurant has really good gyro meat and desserts."
            } else if ($feature.Type == "Mexican"){
                "We've been to this restaurant. 2 tacos are enough to be full."
            }`
    },
    {
      name: "menu",
      title: "Restaurant Menu",
      expression: `if (IsEmpty($feature.Menu)){
                "https://internetdevels.com/sites/default/files/public/blog_preview/404_page_cover.jpg"
            } else{
                $feature.Menu
            }`
    }
  ];

  //Create the popup template
  var template = {
    title: "{Name}",
    content: [
      {
        type: "text",
        text:
          "<b>{Name}</b> is a <b>{Type}</b> restaurant.<br/>{expression/main}<br/><br/>For more information about the restaurant:<br/>" +
          "<a href='{Website}' target='_blank'>Click for the website</a>"
      }
    ],
    expressionInfos: arcadeExpressionInfos,
    actions: [restaurantDirection, restaurantMenu]
  };

  //Create unique value renderer for the points
  var visited = {
      type: "simple-marker",
      outline: {
          width: 1,
          color: [0,112,255,1]
      },
      color: [0,112,255,1],
      size: 6
  };

  var notVisited = {
      type: "simple-marker",
      outline: {
          width: 1,
          color: [255,0,0,1]
      },
      color: [255,0,0,1],
      size: 6
  };

  var other = {
      type: "simple-marker",
      outline: {
          width: 1,
          color: [0,0,0,1]
      },
      color: [0,0,0,1],
      size: 6
  };

  var restaurantRenderer = {
      type: "unique-value",
      defaultSymbol: other,
      field: "Visited",
      uniqueValueInfos: [
          {
              value: "Y",
              symbol: visited
          },{
              value: "N",
              symbol: notVisited
          }
      ]
  };

  //Feature Layer url
  var featureLayer = new FeatureLayer({
    url:
      "https://services7.arcgis.com/CNA1UqWfbopIY83R/arcgis/rest/services/restaurants/FeatureServer/0?token=cv9w2W6FQgqZEa51YqTV_rQI7vnMtnx4tXHaft5tiS6IhlqHYj8fqRcJrNJ3YQj65XB3w2zR-a-GlHfw291cVUA6Oi-ZIb_V1UVyaHDwf7GPVtOpUli0pap4E6unUbXEK-Us69GEzzdMG5AcGR5ZKCEEywXGmkG07VlowmjTeApOjnFldtehEjqq2m8kqXpz_tZ4BqKjetKnzn4WzdMqdtGZHTByJp5dZCtrI3KuecESUEUoJq70M54OtcNCaG2o",
    outFields: ["*"],
    popupTemplate: template,
    renderer: restaurantRenderer
  });
  map.add(featureLayer);
  map.add(routeLayer);

  //Add a Home button
  var homeWidget = new Home({
    view: view
  });
  view.ui.add(homeWidget, "top-left");

  //Add a help expand for the user
  var infoContent = document.createElement("div");
  infoContent.style.padding = "5px";
  infoContent.style.backgroundColor = "white";
  infoContent.style.width = "250px";
  infoContent.innerHTML = [
    "<div id='title' class='esri-widget'>",
    "This application is to show the different restaurants around Houston that we want to try.",
    "<br><br>The application has a widget for the user to get directions to the different restaurants.",
    "<br><br>The blue dots represent restaurants we've already eaten at while the reds dots represents restaurants we want to eat at."
  ].join(" ");
  var infoExpand = new Expand({
    expandIconClass: "esri-icon-chat",
    expandTooltip: "Application Help",
    view: view,
    content: infoContent,
    expanded: view.widthBreakpoint !== "xsmall"
  });
  view.ui.add(infoExpand, "top-left");

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
});
