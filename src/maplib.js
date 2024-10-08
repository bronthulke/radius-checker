import $ from "jquery";
import "./jquery.geocomplete.min.js";

export default class MapLib {
    constructor() {
        this.resultRadiusCircles = [];
        this.resultMarkers = [];
        this.points = [];
        this.currentPoint = undefined;
        this.showBusinesses = true;
        this.businessMarkers = [];
        this.infoWindow = new google.maps.InfoWindow();

        this.map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: -37.8136, lng: 144.9631 },
            zoom: 8,
        });

        this.updateFavouritesButtons();

        $("#SearchAddress")
            .geocomplete({
                country: 'AU'
            })
            .bind("geocode:result", (event, result) => {
                this.currentPoint = new google.maps.LatLng(
                    result.geometry.location.lat(),
                    result.geometry.location.lng()
                );
            });

        $("#ddlRadius").on("change", () => {
            this.drawPointsAndRadii();
        });

        $("#btnAddToMap").on("click", () => {
            this.addCurrentPointToMap();

            $("#btnSetAsFavourite").removeClass("hidden"); // hidden until an address has been loaded
        });

        $("#btnClearMap").on("click", () => {
            this.points = [];
            this.drawPointsAndRadii();
        });

        $("#btnSetAsFavourite").on("click", () => {
            localStorage.setItem('favouritepoint', JSON.stringify(this.currentPoint));

            this.updateFavouritesButtons();
        });

        $("#btnLoadFavourite").on("click", () => {
            let favouritePoint = localStorage.getItem('favouritepoint');

            if(favouritePoint) {
                this.currentPoint = JSON.parse(favouritePoint);

                this.addCurrentPointToMap();
            }
        });

        $("#btnClearFavourite").on("click", () => {
            localStorage.removeItem('favouritepoint');
            this.updateFavouritesButtons();
        });

        $("#toggleBusinesses").on("change", (event) => {
            this.showBusinesses = event.target.checked;
            this.drawPointsAndRadii();
        });

        // Close any open pop ups when clicking off it
        google.maps.event.addListener(this.map, 'click', () => {
            this.infoWindow.close();
        });
    }

    addCurrentPointToMap() {
        const pointExists = this.points && this.points.filter(e => e.lat === this.currentPoint.lat && e.lng === this.currentPoint.lng).length > 0;
        if(this.currentPoint && !pointExists) {
            this.points.push(this.currentPoint);
            this.drawPointsAndRadii();
        }
    }

    updateFavouritesButtons() {
        let favouritePoint = localStorage.getItem('favouritepoint');
        $("#btnLoadFavourite").toggleClass("hidden", !favouritePoint);
        $("#btnClearFavourite").toggleClass("hidden", !favouritePoint);
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
            if (this.showBusinesses) {
                this.fetchBusinesses(point);
            }
        })
    }
    
    focusMarker(point) {
        this.map.setCenter(point);
        this.map.setZoom(12);
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

        if(this.businessMarkers.length > 0) {
            this.businessMarkers.forEach(m => m.setMap(null));
            this.businessMarkers = [];
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

    fetchBusinesses(point) {
        const service = new google.maps.places.PlacesService(this.map);
        const radius = parseInt(document.getElementById("ddlRadius").value);
        const request = {
            location: point,
            radius: radius,
            type: ['store', 'restaurant']
        };

        service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                results.forEach(business => {
                    const marker = new google.maps.Marker({
                        map: this.map,
                        title: business.name,
                        position: business.geometry.location,
                        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                    });

                    const photoUrl = business.photos && business.photos.length > 0 ? business.photos[0].getUrl() : '';
                    const rating = business.rating ? `Rating: ${business.rating} (${business.user_ratings_total} reviews)` : 'No rating available';
                    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${business.geometry.location.lat()},${business.geometry.location.lng()}`;

                    const infoWindowContent = `
                        <div>
                            <strong>${business.name}</strong><br>
                            ${business.vicinity}<br>
                            ${photoUrl ? `<img src="${photoUrl}" alt="${business.name}" style="width:100px;height:auto;"><br>` : ''}
                            ${rating}<br>
                            <a href="${directionsUrl}" target="_blank">Get Directions</a>
                        </div>
                    `;

                    marker.addListener('click', () => {
                        this.infoWindow.close();
                        this.infoWindow.setContent(infoWindowContent);
                        this.infoWindow.open(this.map, marker);
                    });

                    this.businessMarkers.push(marker);
                });
            }
        });
    }
}
