let map = L.map('map').setView([47.620540, -122.349246], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function getPrecinctResultsFromName(name) {
    return results.find(e => { return e.precinct == name; });
}

function getPrecinctColor(districtNumber) {
    if (districtNumber == 1) {
        return 'red';
    } else if (districtNumber == 2) {
        return 'orange';
    } else if (districtNumber == 3) {
        return 'darkkhaki';
    } else if (districtNumber == 4) {
        return 'green';
    } else if (districtNumber == 5) {
        return 'blue';
    } else if (districtNumber == 6) {
        return 'indigo';
    } else if (districtNumber == 7) {
        return 'violet';
    } else {
        return '#ff00ff';
    }
}

function getComplementColor(color) {
    return tinycolor(color).complement().toHexString();
}

function getCandidateColoring(districtNumber) {
    let districtColor = getPrecinctColor(districtNumber);
    let complementColor = getComplementColor(districtColor);
    if (districtNumber == 1) {
        return {
            'Lisa Herbold': districtColor,
            'Phil Tavel': complementColor
        };
    } else if (districtNumber == 2) {
        return {
            'Tammy Morales': districtColor,
            'Mark Solomon': complementColor
        };
    } else if (districtNumber == 3) {
        return {
            'Egan Orion': districtColor,
            'Kshama Sawant': complementColor
        };
    } else if (districtNumber == 4) {
        return {
            'Alex Pedersen': districtColor,
            'Shaun Scott': complementColor
        };
    } else if (districtNumber == 5) {
        return {
            'Debora Juarez': districtColor,
            'Ann Davison Sattler': complementColor
        };
    } else if (districtNumber == 6) {
        return {
            'Dan Strauss': districtColor,
            'Heidi Wills': complementColor
        };
    } else if (districtNumber == 7) {
        return {
            'Jim Pugel': districtColor,
            'Andrew J. Lewis': complementColor
        };
    } else {
        return null;
    }
}

L.geoJSON(features, {
    onEachFeature: function(feature, layer) {
        let precinctName = feature.properties.NAME;
        let r = getPrecinctResultsFromName(precinctName);
        let districtRace = r.races.find(e => { return e.name.includes("City of Seattle Council District"); });
        if (districtRace === undefined) {
            return;
        }
        let html = '';
        for (let i = 0; i < districtRace.votes.length; i++) {
            let item = districtRace.votes[i];
            html += `<p>${item.item}: ${item.votes}</p>`;
        }
        let popup = L.popup()
            .setContent(`<div><p>${districtRace.name}</p>${html}</div>`);
        layer.bindPopup(popup);
    },
    style: function(feature) {
        let precinctName = feature.properties.NAME;
        let r = getPrecinctResultsFromName(precinctName);
        let districtRace = r.races.find(e => { return e.name.includes("City of Seattle Council District"); });
        if (districtRace === undefined) {
            return;
        }
        let coloring = getCandidateColoring(r.district_number);
        let total = districtRace.total_votes;
        let candidate1 = null;
        let candidate2 = null;
        for (let i = 0; i < districtRace.votes.length; i++) {
            let item = districtRace.votes[i];
            if (item.item == 'Write-in') {
                continue;
            }
            if (candidate1 == null) {
                candidate1 = {
                    name: item.item,
                    votes: item.votes
                };
            } else {
                candidate2 = {
                    name: item.item,
                    votes: item.votes
                };
            }
        }
        let ret = {
            weight: 2,
            color: getPrecinctColor(r.district_number),
            dashArray: 5
        };
        if (candidate1.votes > candidate2.votes) {
            ret.fillColor = coloring[candidate1.name];
            ret.fillOpacity = candidate1.votes / total;
            return ret;
        } else if (candidate2.votes > candidate1.votes) {
            ret.fillColor = coloring[candidate2.name];
            ret.fillOpacity = candidate2.votes / total;
            return ret;
        } else {
            ret.fillColor = '#000000';
            ret.fillOpacity = 0.0;
            return ret;
        }
    }
}).addTo(map);
