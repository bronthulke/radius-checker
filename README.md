[![Azure Static Web Apps CI/CD](https://github.com/bronthulke/radius-checker/actions/workflows/azure-static-web-apps-polite-mud-014f9e91e.yml/badge.svg)](https://github.com/bronthulke/radius-checker/actions/workflows/azure-static-web-apps-polite-mud-014f9e91e.yml)

# Google Maps Radius Checker
A simple tool, utilising the Google Maps API, to check where your 5km radius extends to for Stage 4 lockdowns.

## Usage
* `npm start` to run eslint on watch mode and dev-server at localhost:8085.
* `npm run watch` to only watch for/recompile on changes.
* `npm run build` to generate a minified, production-ready build.

## New Feature: Filter Businesses Inside Radius
This tool now includes a feature to filter and display businesses (such as grocery stores and restaurants) within the specified radius. The businesses are fetched using the Google Places API and displayed on the map with blue markers.
