package integrations

import (
	"backend/models"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
)

const GET_ALL_MARKERS_URL = `https://mapy.geoportal.gov.pl/iMapLite/imlDataService/service/data/clust/get/4028e4e54e6ceb84014e6ced4d1c0000/4028e4e54e6ceb84014e6ced4d230001?bbox=74181.74314932924,-41384.196200247825,891216.7105525975,980967.8485038417&s=-1&filtr=(%27Status%27%3D%22Nowe%22%2C%22Potwierdzone%22%2C%22Potwierdzone%20(przekazane%20poza%20Policj%C4%99)%22)%20AND%20(%27Typ%27%3D%22Dzikie%20wysypiska%20%C5%9Bmieci%22)%20AND%20(((%27Typ%27!%3D%22Miejsce%20niebezpiecznej%20dzia%C5%82alno%C5%9Bci%20rozrywkowej%22%2C%22Zn%C4%99canie%20si%C4%99%20nad%20zwierz%C4%99tami%22%2C%22U%C5%BCywanie%20%C5%9Brodk%C3%B3w%20odurzaj%C4%85cych%22)AND((%27Status%27%3D%22Nowe%22%2C%22Weryfikacja%22%2C%22Potwierdzone%22%2C%22Potwierdzone%20(przekazane%20poza%20Policj%C4%99)%22)OR((%27Status%27%3D%22Niepotwierdzone%22)AND(%27Data%20modyfikacji%27%3E%3D1731711600000))OR((%27Status%27%3D%22Potwierdzone%20(wyeliminowane)%22)AND(%27Data%20modyfikacji%27%3E%3D1729634400000))))OR((%27Typ%27%3D%22Miejsce%20niebezpiecznej%20dzia%C5%82alno%C5%9Bci%20rozrywkowej%22)AND((%27Status%27%3D%22Potwierdzone%22)OR(%27Status%27%3D%22Potwierdzone%20(przekazane%20poza%20Policj%C4%99)%22)OR((%27Status%27%3D%22Potwierdzone%20(wyeliminowane)%22)AND(%27Data%20modyfikacji%27%3E%3D1729634400000)))))`

type GovMarkerAttributes struct {
	ObjectId     int64 `json:"OBJECTID"`
	CreationDate int64 `json:"Data utworzenia"`
}

type GovMarkerGeometry struct {
	Latitude  float64 `json:"x"`
	Longitude float64 `json:"y"`
}

type GovMarker struct {
	Attributes GovMarkerAttributes `json:"attributes"`
	Geometry   GovMarkerGeometry   `json:"geometry"`
}

type Reponse struct {
	Features []GovMarker `json:"features"`
}

// epsg2180ToWGS84 performs manual conversion from EPSG:2180 to WGS84
func epsg2180ToWGS84(x, y float64) (lat, lon float64) {
	// EPSG:2180 parameters
	a := 6378137.0               // Semi-major axis (GRS80)
	f := 1 / 298.257222101       // Flattening
	b := a * (1 - f)             // Semi-minor axis
	e2 := (a*a - b*b) / (a * a)  // First eccentricity squared
	k0 := 0.999923               // Scale factor
	x0 := 500000.0               // False easting
	y0 := -5300000.0             // False northing
	lam0 := 19 * math.Pi / 180.0 // Central meridian in radians

	// Adjusted coordinates
	xAdj := x - x0
	yAdj := y - y0

	// Meridian arc length constants
	n := (a - b) / (a + b)
	a1 := (a + b) / 2 * (1 + math.Pow(n, 2)/4 + math.Pow(n, 4)/64)
	epsilon := e2 / (1 - e2)

	// Auxiliary latitude calculations
	m := yAdj / k0
	mu := m / a1
	phi1 := mu + (3*n/2-27*math.Pow(n, 3)/32)*math.Sin(2*mu) +
		(21*math.Pow(n, 2)/16-55*math.Pow(n, 4)/32)*math.Sin(4*mu) +
		(151*math.Pow(n, 3)/96)*math.Sin(6*mu) +
		(1097*math.Pow(n, 4)/512)*math.Sin(8*mu)

	// Latitude and longitude calculations
	sinPhi1 := math.Sin(phi1)
	cosPhi1 := math.Cos(phi1)
	t1 := math.Tan(phi1)
	eta2 := epsilon * math.Pow(cosPhi1, 2)
	n1 := a / math.Sqrt(1-e2*math.Pow(sinPhi1, 2))
	r1 := n1 * (1 - e2) / (1 - e2*math.Pow(sinPhi1, 2))

	d := xAdj / (n1 * k0)
	lat = phi1 - (n1*t1/r1)*(math.Pow(d, 2)/2-(5+3*math.Pow(t1, 2)+10*eta2-4*math.Pow(eta2, 2)-9*epsilon)*math.Pow(d, 4)/24+
		(61+90*math.Pow(t1, 2)+298*eta2+45*math.Pow(t1, 4)-252*epsilon-3*math.Pow(eta2, 2))*math.Pow(d, 6)/720)

	lon = lam0 + (d-(1+2*math.Pow(t1, 2)+eta2)*math.Pow(d, 3)/6+
		(5-2*eta2+28*math.Pow(t1, 2)-3*math.Pow(eta2, 2)+8*epsilon+24*math.Pow(t1, 4))*math.Pow(d, 5)/120)/cosPhi1

	// Convert radians to degrees
	lat = lat * 180 / math.Pi
	lon = lon * 180 / math.Pi

	return lat, lon
}

func GetAllGovMarkers() ([]models.CreateMarkerBody, error) {
	client := &http.Client{}

	req, err := http.NewRequest(
		"GET",
		GET_ALL_MARKERS_URL,
		http.NoBody,
	)
	if err != nil {
		return nil, fmt.Errorf("error creating http request: %s\n", err)
	}

	res, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error making http request: %s\n", err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Error: received status code %d\n", res.StatusCode)
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, fmt.Errorf("Error reading response body: %v\n", err)
	}

	var response Reponse
	err = json.Unmarshal(body, &response)
	if err != nil {
		return nil, fmt.Errorf("Error unmarshaling JSON: %v\n", err)
	}

	markers := make([]models.CreateMarkerBody, len(response.Features))
	for idx, Feature := range response.Features {
		Latitude, Longitude := epsg2180ToWGS84(Feature.Geometry.Latitude, Feature.Geometry.Longitude)
		markers[idx] = models.CreateMarkerBody{
			ExternalObjectId: &Feature.Attributes.ObjectId,
			Latitude:         Latitude,
			Longitude:        Longitude,
			Status:           "approved",
		}
	}

	return markers, nil
}
