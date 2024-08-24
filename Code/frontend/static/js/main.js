document.addEventListener('DOMContentLoaded', function () {
    const bahnhofSuche = document.getElementById('bahnhof-suche');
    const searchButton = document.getElementById('search-button');
    const suggestionsList = document.getElementById('suggestions');
    const datePicker = document.getElementById('date-picker');
    const resultsContainer = document.getElementById('results-container');
    const searchContainer = document.getElementById('search-container');
    const startTimeDisplay = document.getElementById('start-time-display');
    const endTimeDisplay = document.getElementById('end-time-display');
    
    let stations = [];
    let filteredNames = [];
    let allResults = []; // store all results fetched from the server

    // fetch the list of station names and ids from the backend
    fetch('/bhfs')
        .then(response => response.json())
        .then(data => {
            // map the data to an array of station objects
            stations = data.map(station => ({
                id: station[0],
                name: station[1]
            }));
        });

    // filter station names based on search query
    bahnhofSuche.addEventListener('input', function () {
        const query = bahnhofSuche.value.toLowerCase();
        
        if (query.trim() === '') {
            suggestionsList.style.display = 'none'; // hide suggestions if query is empty
            return;
        }

        // filter stations matching the query
        filteredNames = stations.filter(station => station.name.toLowerCase().includes(query));
        displaySuggestions(); // display the filtered suggestions
    });

    function displaySuggestions() {
        suggestionsList.innerHTML = ''; // clear previous suggestions

        if (filteredNames.length > 0) {
            suggestionsList.style.display = 'block'; // show suggestions dropdown
            filteredNames.forEach(station => {
                const listItem = document.createElement('li');
                listItem.textContent = station.name;
                listItem.addEventListener('click', function () {
                    bahnhofSuche.value = station.name; // update input with selected station
                    suggestionsList.innerHTML = ''; // clear suggestions
                    suggestionsList.style.display = 'none'; // hide dropdown
                });
                suggestionsList.appendChild(listItem);
            });
        } else {
            suggestionsList.style.display = 'none'; // hide suggestions if no match
        }
    }

    // handle search button click event
    searchButton.addEventListener('click', function () {
        const selectedName = bahnhofSuche.value;
        const selectedDate = datePicker.value;

        // find the selected station by name
        const selectedStation = stations.find(station => station.name === selectedName);

        if (selectedStation && selectedDate) {
            searchContainer.style.marginTop = '-15px'; // adjust layout after search
            resultsContainer.style.display = 'block'; // show results container

            const url = `/bhfs/${selectedDate}/${selectedStation.id}`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    allResults = data; // store results from server
                    filterAndDisplayResults(); // filter and display results based on time range
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } else {
            alert('Please select a valid station and date.'); // alert if selection is invalid
        }
    });

    function filterAndDisplayResults() {
        const [startTime, endTime] = slider.noUiSlider.get(); // get selected time range
        const start = parseTime(startTime);
        const end = parseTime(endTime);

        // filter results within the selected time range
        const filteredResults = allResults.filter(item => {
            const arrivalTime = parseTime(item[0]);
            return arrivalTime >= start && arrivalTime <= end;
        });

        if (filteredResults.length === 0) {
            displayNoResults(); // display message if no results found
        } else {
            displayResults(filteredResults); // display filtered results
        }
    }

    function displayResults(data) {
        resultsContainer.innerHTML = ''; // clear previous results
        const table = document.createElement('table');
        table.classList.add('results-table');

        data.forEach(item => {
            const row = document.createElement('tr');
            
            const timeCell = document.createElement('td');
            
            const trainInfo = document.createElement('div');
            trainInfo.classList.add('train-info');

            const trainIcon = document.createElement('img');
            trainIcon.src = '/static/assets/train.svg'; // train icon
            trainIcon.alt = 'Train Icon';

            const trainName = document.createElement('span');
            trainName.textContent = `${item[2]} ${item[3]}`; // train type and number

            trainInfo.appendChild(trainIcon);
            trainInfo.appendChild(trainName);

            const trainTimes = document.createElement('div');
            trainTimes.classList.add('train-times');

            const arrivalWithout = document.createElement('div');
            arrivalWithout.setAttribute('data-label', 'Ankunft ohne Baustelle:');
            arrivalWithout.classList.add('time');
            arrivalWithout.textContent = item[0]; // scheduled arrival time

            const arrivalWith = document.createElement('div');
            arrivalWith.setAttribute('data-label', 'Ankunft mit Baustelle:');
            arrivalWith.classList.add('time');
            arrivalWith.textContent = item[1]; // actual arrival time with delay

            trainTimes.appendChild(arrivalWithout);
            trainTimes.appendChild(arrivalWith);

            timeCell.appendChild(trainInfo);
            timeCell.appendChild(trainTimes);
            row.appendChild(timeCell);

            table.appendChild(row); // add row to table
        });

        resultsContainer.appendChild(table); // display the table in the results container
    }

    function displayNoResults() {
        resultsContainer.innerHTML = ''; // clear previous results
        const noResultsMessage = document.createElement('p');
        noResultsMessage.textContent = 'Keine Verspätungen gefunden.'; // no results found message
        resultsContainer.appendChild(noResultsMessage);
    }

    // parse time in 'HH:MM' format to minutes since midnight
    function parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes; // convert to total minutes
    }

    // initialize the time range slider
    var slider = document.getElementById('range-slider');

    noUiSlider.create(slider, {
        start: [0, 24],
        connect: true,
        step: 1,
        range: {
            'min': 0,
            'max': 24
        },
        format: {
            to: function(value) {
                if (value === 24) return '23:59'; // handle end of day
                return ('0' + Math.floor(value)).slice(-2) + ":00"; // format time as HH:MM
            },
            from: function(value) {
                if (value === '23:59') return 24;
                return Number(value.replace(":00", "")); // convert time back to hours
            }
        }
    });

    // update time display when slider values change
    slider.noUiSlider.on('update', function(values, handle) {
        if (handle === 0) {
            startTimeDisplay.textContent = values[0]; // update start time display
        } else {
            endTimeDisplay.textContent = values[1]; // update end time display
        }

        filterAndDisplayResults(); // update results based on the selected time range
    });

    // preset buttons to set common time ranges
    document.getElementById('morning-button').addEventListener('click', function() {
        slider.noUiSlider.set([0, 12]); // set slider to morning range
    });

    document.getElementById('midday-button').addEventListener('click', function() {
        slider.noUiSlider.set([10, 15]); // set slider to midday range
    });

    document.getElementById('evening-button').addEventListener('click', function() {
        slider.noUiSlider.set([16, 24]); // set slider to evening range
    });

    resultsContainer.style.display = 'none'; // initially hide the results container
});
