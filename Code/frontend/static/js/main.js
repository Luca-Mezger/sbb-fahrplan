document.addEventListener('DOMContentLoaded', function () {
    const bahnhofSuche = document.getElementById('bahnhof-suche');
    const searchButton = document.getElementById('search-button');
    const suggestionsList = document.getElementById('suggestions');
    const datePicker = document.getElementById('date-picker');
    const resultsContainer = document.getElementById('results-container');
    const searchContainer = document.getElementById('search-container');
    const advancedSettingsToggle = document.getElementById('advanced-settings-toggle');
    const toggleArrow = document.getElementById('toggle-arrow');
    const timeSelectionContainer = document.getElementById('time-selection-container');
    const startTimeDisplay = document.getElementById('start-time-display');
    const endTimeDisplay = document.getElementById('end-time-display');
    const loadingSpinner = document.getElementById('loading-spinner');

    let stations = [];
    let filteredNames = [];
    let allResults = [];

    // Hide time selection elements initially
    timeSelectionContainer.style.display = 'none';

    // Toggle advanced settings
    advancedSettingsToggle.addEventListener('click', function () {
        const isHidden = timeSelectionContainer.style.display === 'none';
        timeSelectionContainer.style.display = isHidden ? 'block' : 'none';
        toggleArrow.textContent = isHidden ? '▲' : '▼'; // Change arrow direction
    });

    // fetch station names and ids from the backend
    fetch('/bhfs')
        .then(response => response.json())
        .then(data => {
            stations = data.map(station => ({
                id: station[0],
                name: station[1]
            }));
        });

    // filter station names based on search query
    bahnhofSuche.addEventListener('input', function () {
        const query = bahnhofSuche.value.toLowerCase();
        
        if (query.trim() === '') {
            suggestionsList.style.display = 'none';
            return;
        }

        filteredNames = stations.filter(station => station.name.toLowerCase().includes(query));
        displaySuggestions();
    });

    function displaySuggestions() {
        suggestionsList.innerHTML = '';

        if (filteredNames.length > 0) {
            suggestionsList.style.display = 'block';
            filteredNames.forEach(station => {
                const listItem = document.createElement('li');
                listItem.textContent = station.name;
                listItem.addEventListener('click', function () {
                    bahnhofSuche.value = station.name;
                    suggestionsList.innerHTML = '';
                    suggestionsList.style.display = 'none';
                });
                suggestionsList.appendChild(listItem);
            });
        } else {
            suggestionsList.style.display = 'none';
        }
    }

    // handle search button click
    searchButton.addEventListener('click', function () {
        const selectedName = bahnhofSuche.value;
        const selectedDate = datePicker.value;

        const selectedStation = stations.find(station => station.name === selectedName);

        if (selectedStation && selectedDate) {
            searchContainer.style.marginTop = '-15px';
            resultsContainer.style.display = 'none'; // Hide results container initially
            loadingSpinner.style.display = 'block';  // Show the spinner

            const url = `/bhfs/${selectedDate}/${selectedStation.id}`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    allResults = data;
                    filterAndDisplayResults(); // display filtered results based on time range
                })
                .catch(error => {
                    console.error('Error:', error);
                })
                .finally(() => {
                    loadingSpinner.style.display = 'none';  // Hide the spinner
                    resultsContainer.style.display = 'block'; // Show results container
                });
        } else {
            alert('Please select a valid station and date.');
        }
    });

    function filterAndDisplayResults() {
        const [startTime, endTime] = slider.noUiSlider.get();
        const start = parseTime(startTime);
        const end = parseTime(endTime);

        const filteredResults = allResults.filter(item => {
            const arrivalTime = parseTime(item[0]);
            return arrivalTime >= start && arrivalTime <= end;
        });

        if (filteredResults.length === 0) {
            displayNoResults();
        } else {
            displayResults(filteredResults);
        }
    }

    function displayResults(data) {
        resultsContainer.innerHTML = '';
        const table = document.createElement('table');
        table.classList.add('results-table');

        data.forEach(item => {
            const row = document.createElement('tr');
            
            const timeCell = document.createElement('td');
            
            const trainInfo = document.createElement('div');
            trainInfo.classList.add('train-info');

            // Train SVG icon
            const trainSvg = document.createElement('img');
            trainSvg.src = '/static/assets/train.svg';
            trainSvg.alt = 'Train Icon';
            trainSvg.classList.add('train-svg-icon');

            // Train-specific icon (e.g., RE 5 or RE)
            const trainType = item[2].toLowerCase(); // e.g., "re"
            const trainNumber = item[3]; // e.g., "5"
            let trainIconUrl;

            if (trainNumber) {
                // If the train number is present, include it in the URL
                trainIconUrl = `https://icons.app.sbb.ch/icons/${trainType}-${trainNumber}.svg`;
            } else {
                // If the train number is not present, just use the train type
                trainIconUrl = `https://icons.app.sbb.ch/icons/${trainType}.svg`;
            }

            const trainIcon = document.createElement('img');
            trainIcon.src = trainIconUrl;
            trainIcon.alt = `${item[2]} ${item[3]}`; // alt text as train name, e.g., "RE 5"
            trainIcon.classList.add('train-icon'); // Larger size

            const trainTimes = document.createElement('div');
            trainTimes.classList.add('train-times');

            const arrivalWithout = document.createElement('div');
            arrivalWithout.setAttribute('data-label', 'Ankunft ohne Baustelle:');
            arrivalWithout.classList.add('time');
            arrivalWithout.textContent = item[0]; // scheduled arrival time

            const arrivalWith = document.createElement('div');
            arrivalWith.setAttribute('data-label', 'Ankunft mit Baustelle:');
            arrivalWith.classList.add('time');
            arrivalWith.textContent = item[1]; // actual arrival time

            trainTimes.appendChild(arrivalWithout);
            trainTimes.appendChild(arrivalWith);

            trainInfo.appendChild(trainSvg); // Append the train SVG icon first
            trainInfo.appendChild(trainIcon); // Then append the specific train icon
            timeCell.appendChild(trainInfo);
            timeCell.appendChild(trainTimes);
            row.appendChild(timeCell);

            table.appendChild(row); // add row to table
        });

        resultsContainer.appendChild(table);
    }

    function displayNoResults() {
        resultsContainer.innerHTML = '';
        const noResultsMessage = document.createElement('p');
        noResultsMessage.textContent = 'Keine Verspätungen gefunden.';
        resultsContainer.appendChild(noResultsMessage);
    }

    // parse time in 'HH:MM' format to minutes since midnight
    function parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // initialize time range slider
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

    // preset buttons for common time ranges
    document.getElementById('morning-button').addEventListener('click', function() {
        slider.noUiSlider.set([0, 12]);
    });

    document.getElementById('midday-button').addEventListener('click', function() {
        slider.noUiSlider.set([10, 15]);
    });

    document.getElementById('evening-button').addEventListener('click', function() {
        slider.noUiSlider.set([16, 24]);
    });

    resultsContainer.style.display = 'none'; // initially hide results container
});
