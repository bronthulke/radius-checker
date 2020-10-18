import $ from "jquery";
import "./jquery.geocomplete.min.js";

export default class MapLib {
    constructor() {
        this.resultRadiusCircles = [];
        this.resultMarkers = [];
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

                this.drawPointsAndRadii();
            });

        $("#ddlRadius").on("change", () => {
            this.drawPointsAndRadii();
        });
    }

    drawPointsAndRadii() {
        this.clearPreviousRadius(); // clear all radii so we can redraw them at the specified radius

        this.points.forEach(point => {

            this.resultMarkers.push(new google.maps.Marker({
                map: this.map,
                title: "Home",
                position: point,
                icon: 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png'
            }));

            this.focusMarker(point);
            this.drawSearchRadiusCircle(point);
        })
    }
    
    focusMarker(point) {
        this.map.setCenter(point);
        this.map.setZoom(13);
    }

    clearPreviousRadius() {
        if(this.resultRadiusCircles.length > 0) {
            this.resultRadiusCircles.forEach(c => c.setMap(null));
            this.resultRadiusCircles = [];
        }

        if(this.resultMarkers.length > 0) {
            this.resultMarkers.forEach(m => m.setMap(null));
            this.resultMarkers = [];
        }
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
        this.resultRadiusCircles.push(new google.maps.Circle(circleOptions));
    }
}
