import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'
import MapLib from './maplib'

const main = async () => {
  // do any init here
}

main().then(() => console.log('Started'));

window.initMap = async () => {
  const mapLib = new MapLib();
}

