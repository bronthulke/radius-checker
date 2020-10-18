import $ from "jquery";
import "./jquery.geocomplete.min.js";

export default class MapLib {
    constructor() {
        this.radius = 25000; // eventually this can be a parameter
        
        this.resultRadiusCircle = null;
        this.resultMarker = null;

        this.points = [];

        this.map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: -37.8136, lng: 144.9631 },
            zoom: 8,
        });

        $("#SearchAddress")
            .geocomplete({
                country: 'AU'
            })
            .bind("geocode:result", (event, result) => {
                // clear the old radius
                if(document.getElementById("chkClearPreviousPoints").checked)
                    this.points = [];


                let point = new google.maps.LatLng(
                    result.geometry.location.lat(),
                    result.geometry.location.lng()
                );

                this.points.push(point);

                drawPointsAndRadii();
            });

        $("#ddlRadius").on("change", function() {
            drawPointsAndRadii();
        });
    }

    drawPointsAndRadii() {
        this.clearPreviousRadius(); // clear all radii so we can redraw them at the specified radius

        this.points.forEach(point => {

            this.resultMarker = new google.maps.Marker({
                map: this.map,
                title: "Home",
                position: point,
                icon: 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png'
            });

            this.focusMarker(point);
            this.drawSearchRadiusCircle(point);
        })
    }
    
    focusMarker(point) {
        this.map.setCenter(point);
        this.map.setZoom(13);
    }

    clearPrevious() {
        if(this.resultRadiusCircle)
            this.resultRadiusCircle.setMap(null);

        if(this.resultMarker)
            this.resultMarker.setMap(null);
    }

    drawSearchRadiusCircle(point) {
        const circleOptions = {
            strokeColor: "#bb2865",
            strokeOpacity: 0.3,
            strokeWeight: 1,
            fillColor: "#bb2865",
            fillOpacity: 0.05,
            map: this.map,
            center: point,
            clickable: false,
            zInd: -1,
            radius: parseInt(document.getElementById("ddlRadius").value),
        };
        this.resultRadiusCircle = new google.maps.Circle(circleOptions);
    }
}
