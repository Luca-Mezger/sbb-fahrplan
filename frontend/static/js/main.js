document.addEventListener('DOMContentLoaded', function () {
    const bahnhofSuche = document.getElementById('bahnhof-suche');
    const searchButton = document.getElementById('search-button');
    const suggestionsList = document.getElementById('suggestions');
    const datePicker = document.getElementById('date-picker');

    let stations = [];
    let filteredNames = [];

    // fetch the list of station names and ids from the backend
    fetch('/bhfs')
        .then(response => response.json())
        .then(data => {
            // store the data as a list of objects with id and name
            stations = data.map(station => ({
                id: station[0],
                name: station[1]
            }));
        });

    // filter names based on search query
    bahnhofSuche.addEventListener('input', function () {
        const query = bahnhofSuche.value.toLowerCase();
        filteredNames = stations.filter(station => station.name.toLowerCase().includes(query));
        displaySuggestions();
    });

    // display filtered suggestions
    function displaySuggestions() {
        suggestionsList.innerHTML = '';
        filteredNames.forEach(station => {
            const listItem = document.createElement('li');
            listItem.textContent = station.name;
            listItem.addEventListener('click', function () {
                bahnhofSuche.value = station.name;
                suggestionsList.innerHTML = '';
            });
            suggestionsList.appendChild(listItem);
        });
    }

    // handle search button click
    searchButton.addEventListener('click', function () {
        const selectedName = bahnhofSuche.value;
        const selectedDate = datePicker.value; // this will be in 'yyyy-mm-dd' format
    
        // find the station id by matching the selected name
        const selectedStation = stations.find(station => station.name === selectedName);
    
        if (selectedStation && selectedDate) {
            // send the request with the station id and date
            const url = `/bhfs/${selectedDate}/${selectedStation.id}`;
            fetch(url, {
                method: 'POST', // or 'GET' depending on your flask route method
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ date: selectedDate }) // date is sent in the body as well
            })
            .then(response => response.json())
            .then(data => {
                console.log('success:', data);
                // handle the response as needed
            })
            .catch(error => {
                console.error('error:', error);
            });
        } else {
            alert('please select a valid station and date.');
        }
    });
    

    // slider and button click event listeners remain unchanged
    var slider = document.getElementById('range-slider');
    var startTimeDisplay = document.getElementById('start-time-display');
    var endTimeDisplay = document.getElementById('end-time-display');

    noUiSlider.create(slider, {
        start: [20, 24], 
        connect: true, 
        step: 1, 
        range: {
            'min': 0,
            'max': 24 
        },
        format: {
            to: function(value) {
                if (value === 24) {
                    return '23:59';
                }
                return ('0' + Math.floor(value)).slice(-2) + ":00";
            },
            from: function(value) {
                if (value === '23:59') {
                    return 24;
                }
                return Number(value.replace(":00", ""));
            }
        }
    });

    slider.noUiSlider.on('update', function(values, handle) {
        if (handle === 0) {
            startTimeDisplay.textContent = values[0];
        } else {
            endTimeDisplay.textContent = values[1];
        }
    });

    document.getElementById('morning-button').addEventListener('click', function() {
        slider.noUiSlider.set([0, 12]);
    });

    document.getElementById('midday-button').addEventListener('click', function() {
        slider.noUiSlider.set([10, 15]);
    });

    document.getElementById('evening-button').addEventListener('click', function() {
        slider.noUiSlider.set([16, 24]);
    });
});
