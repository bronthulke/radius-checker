import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'
import './radius-checker.png'
import MapLib from './maplib'

// console.log("API key" + process.env.GOOGLE_API_KEY);

const main = async () => {
  // do any init here
}

main().then(() => console.log('Started'));

window.initMap = async () => {
  const mapLib = new MapLib();
}

