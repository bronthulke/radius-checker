import $ from "jquery";
import "./jquery.geocomplete.min.js";

export default class MapLib {
    constructor() {
        this.resultRadiusCircles = [];
        this.resultMarkers = [];
        this.points = [];
        this.currentPoint = undefined;
        this.halfwayPoint1 = undefined;
        this.halfwayPoint2 = undefined;
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

        $("#SearchAddress1")
            .geocomplete({
                country: 'AU'
            })
            .bind("geocode:result", (event, result) => {
                this.halfwayPoint1 = new google.maps.LatLng(
                    result.geometry.location.lat(),
                    result.geometry.location.lng()
                );
            });

        $("#SearchAddress2")
            .geocomplete({
                country: 'AU'
            })
            .bind("geocode:result", (event, result) => {
                this.halfwayPoint2 = new google.maps.LatLng(
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

        $("#btnFindHalfwayPoint").on("click", () => {
            this.findHalfwayPoint();
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

    drawSearchRadiusCircle(point, radius) {
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
            radius: radius !== undefined ? radius : parseInt(document.getElementById("ddlRadius").value),
        };
        this.resultRadiusCircles.push(new google.maps.Circle(circleOptions));
    }

    fetchBusinesses(point, radius) {
        const service = new google.maps.places.PlacesService(this.map);
        const searchRadius = radius !== undefined ? radius : parseInt(document.getElementById("ddlRadius").value);
        const request = {
            location: point,
            radius: searchRadius,
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

    getLat(point) {
        return typeof point.lat === 'function' ? point.lat() : point.lat;
    }

    getLng(point) {
        return typeof point.lng === 'function' ? point.lng() : point.lng;
    }

    calculateDistance(point1, point2) {
        const R = 6371000; // Earth radius in metres
        const lat1 = this.getLat(point1) * Math.PI / 180;
        const lat2 = this.getLat(point2) * Math.PI / 180;
        const dLat = (this.getLat(point2) - this.getLat(point1)) * Math.PI / 180;
        const dLng = (this.getLng(point2) - this.getLng(point1)) * Math.PI / 180;

        const a = Math.sin(dLat / 2) ** 2 +
                  Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // metres
    }

    calculateMidpoint(point1, point2) {
        const lat1 = this.getLat(point1) * Math.PI / 180;
        const lat2 = this.getLat(point2) * Math.PI / 180;
        const lng1 = this.getLng(point1) * Math.PI / 180;
        const dLng = (this.getLng(point2) - this.getLng(point1)) * Math.PI / 180;

        const bx = Math.cos(lat2) * Math.cos(dLng);
        const by = Math.cos(lat2) * Math.sin(dLng);

        const midLat = Math.atan2(
            Math.sin(lat1) + Math.sin(lat2),
            Math.sqrt((Math.cos(lat1) + bx) ** 2 + by ** 2)
        ) * 180 / Math.PI;

        const midLng = (lng1 + Math.atan2(by, Math.cos(lat1) + bx)) * 180 / Math.PI;

        return new google.maps.LatLng(midLat, midLng);
    }

    findHalfwayPoint() {
        if (!this.halfwayPoint1 || !this.halfwayPoint2) {
            alert('Please enter both locations to find the halfway point.');
            return;
        }

        const distance = this.calculateDistance(this.halfwayPoint1, this.halfwayPoint2);
        const radius = 5000; // fixed 5km radius from midpoint
        const midpoint = this.calculateMidpoint(this.halfwayPoint1, this.halfwayPoint2);

        this.clearPreviousRadius();

        this.resultMarkers.push(new google.maps.Marker({
            map: this.map,
            title: 'Halfway point',
            position: midpoint,
            icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
        }));

        this.resultMarkers.push(new google.maps.Marker({
            map: this.map,
            title: 'Location 1',
            position: this.halfwayPoint1,
            icon: 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png'
        }));

        this.resultMarkers.push(new google.maps.Marker({
            map: this.map,
            title: 'Location 2',
            position: this.halfwayPoint2,
            icon: 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png'
        }));

        this.focusMarker(midpoint);
        this.drawSearchRadiusCircle(midpoint, radius);

        if (this.showBusinesses) {
            this.fetchBusinesses(midpoint, radius);
        }

        const distanceKm = (distance / 1000).toFixed(1);
        const radiusKm = (radius / 1000).toFixed(1);
        document.getElementById('halfwayResultText').textContent =
            `Distance between locations: ${distanceKm}km. Meeting radius: ${radiusKm}km from the halfway point.`;
        document.getElementById('halfwayResult').style.display = '';
    }
}
