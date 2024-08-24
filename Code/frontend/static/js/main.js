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
    const transportunternehmenSuche = document.getElementById('transportunternehmen-suche');
    const transportunternehmenSuggestions = document.getElementById('transportunternehmen-suggestions');

    let stations = [];
    let filteredNames = [];
    let allResults = [];
    let transportunternehmen = []; // To store fetched data

    // Set date picker to today's date
    const today = new Date().toISOString().split('T')[0];
    datePicker.value = today;

    // Hide time selection elements initially
    timeSelectionContainer.style.display = 'none';

    // Toggle advanced settings
    advancedSettingsToggle.addEventListener('click', function () {
        const isHidden = timeSelectionContainer.style.display === 'none';
        timeSelectionContainer.style.display = isHidden ? 'block' : 'none';
        toggleArrow.textContent = isHidden ? '▲' : '▼'; // Change arrow direction
    });

    // Fetch station names and ids from the backend
    fetch('/bhfs')
        .then(response => response.json())
        .then(data => {
            stations = data.map(station => ({
                id: station[0],
                name: station[1]
            }));
        });

    // Fetch transportunternehmen data from the provided URL
    fetch('http://127.0.0.1:5000/agency')
        .then(response => response.json())
        .then(data => {
            transportunternehmen = data.map(item => ({
                id: item[0],
                displayName: `${item[1]} (${item[2]})`
            }));
        });

    // Filter station names based on search query
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

    // Filter transportunternehmen based on search query
    transportunternehmenSuche.addEventListener('input', function () {
        const query = transportunternehmenSuche.value.toLowerCase();

        if (query.trim() === '') {
            transportunternehmenSuggestions.style.display = 'none';
            return;
        }

        const filteredTransportunternehmen = transportunternehmen.filter(company =>
            company.displayName.toLowerCase().includes(query)
        );
        displayTransportunternehmenSuggestions(filteredTransportunternehmen);
    });

    function displayTransportunternehmenSuggestions(filteredTransportunternehmen) {
        transportunternehmenSuggestions.innerHTML = '';

        if (filteredTransportunternehmen.length > 0) {
            transportunternehmenSuggestions.style.display = 'block';
            filteredTransportunternehmen.forEach(company => {
                const listItem = document.createElement('li');
                listItem.textContent = company.displayName;
                listItem.addEventListener('click', function () {
                    transportunternehmenSuche.value = company.displayName;
                    transportunternehmenSuggestions.innerHTML = '';
                    transportunternehmenSuggestions.style.display = 'none';
                });
                transportunternehmenSuggestions.appendChild(listItem);
            });
        } else {
            transportunternehmenSuggestions.style.display = 'none';
        }
    }

    // Handle search button click
    searchButton.addEventListener('click', function () {
        const selectedName = bahnhofSuche.value;
        const selectedDate = datePicker.value;
        const selectedTransportCompany = transportunternehmenSuche.value;
        const filterBus = document.getElementById('filter-bus').checked;
        const filterTram = document.getElementById('filter-tram').checked;
        const filterShip = document.getElementById('filter-ship').checked;

        const selectedStation = stations.find(station => station.name === selectedName);

        if (selectedStation && selectedDate) {
            searchContainer.style.marginTop = '-15px';
            resultsContainer.style.display = 'none'; // Hide results container initially
            loadingSpinner.style.display = 'block';  // Show the spinner

            const url = `/bhfs/${selectedDate}/${selectedStation.id}`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    allResults = data.filter(result => {
                        let passesFilter = true;
                        if (filterBus) passesFilter = passesFilter && result.transportType === 'Bus';
                        if (filterTram) passesFilter = passesFilter && result.transportType === 'Tram';
                        if (filterShip) passesFilter = passesFilter && result.transportType === 'Ship';
                        if (selectedTransportCompany) passesFilter = passesFilter && result.company.toLowerCase() === selectedTransportCompany.toLowerCase();
                        return passesFilter;
                    });
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
    
        // Fetch the agency data and store it in a map
        let agencyData = {}; // Map from agency-id to agency kürzel
        fetch('/agency')
            .then(response => response.json())
            .then(agencyList => {
                agencyList.forEach(agency => {
                    agencyData[agency[0]] = agency[2]; // Store kürzel by agency-id
                });
    
                // Now that the agency data is available, process the main data
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
                    arrivalWithout.textContent = item[0] || '-'; // scheduled arrival time or '-'
    
                    const arrivalWith = document.createElement('div');
                    arrivalWith.setAttribute('data-label', 'Ankunft mit Baustelle:');
                    arrivalWith.classList.add('time');
                    arrivalWith.textContent = item[1] || '-'; // actual arrival time or '-'
    
                    // Dropdown button
                    const dropdownButton = document.createElement('button');
                    dropdownButton.textContent = 'Details';
                    dropdownButton.classList.add('dropdown-button');
    
                    // Dropdown content
                    const dropdownContent = document.createElement('div');
                    dropdownContent.classList.add('dropdown-content');
                    dropdownContent.style.display = 'none'; // Initially hidden
    
                    // Add bus, tram, or ship information to the dropdown
                    item[6].forEach(subItem => {
                        const detail = document.createElement('div');
                        detail.classList.add('transport-info');
                        detail.style.display = 'flex';
                        detail.style.alignItems = 'center';
    
                        // Determine the appropriate icon based on the transport type (B, T, S)
                        let iconUrl;
                        if (subItem[1] === 'B') {
                            iconUrl = 'https://icons.app.sbb.ch/icons/bus-profile-small.svg';
                        } else if (subItem[1] === 'T') {
                            iconUrl = 'https://icons.app.sbb.ch/icons/tram-small.svg';
                        } else if (subItem[1] === 'S') {
                            iconUrl = 'https://icons.app.sbb.ch/icons/boat-profile-small.svg';
                        }
    
                        const transportIcon = document.createElement('img');
                        transportIcon.src = iconUrl;
                        transportIcon.alt = subItem[1]; // B, T, or S
                        transportIcon.classList.add('transport-icon'); // Adjust size accordingly
                        transportIcon.style.marginRight = '10px'; // Add some space between icon and text
    
                        // Match the agency ID with the agency kürzel
                        const agencyKuerzel = agencyData[subItem[4]] || '-'; // Get kürzel from agency-id or '-'
    
                        // Create the formatted text similar to the image
                        const transportDetails = document.createElement('div');
                        transportDetails.style.display = 'flex';
                        transportDetails.style.alignItems = 'center';
    
                        const kuerzelField = document.createElement('span');
                        kuerzelField.innerHTML = `<strong>${agencyKuerzel}</strong>`;
                        kuerzelField.style.marginRight = '10px'; // Spacing between kürzel and icon
    
                        const abfahrtszeitField = document.createElement('div');
                        abfahrtszeitField.innerHTML = `<strong>Abfahrtszeit:</strong><br>${subItem[0] || '-'}`;
    
                        const kanteField = document.createElement('div');
                        kanteField.style.marginLeft = '20px';
                        kanteField.innerHTML = `<strong>Kante:</strong><br>${subItem[3] || '-'}`;
    
                        const nummerField = document.createElement('div');
                        nummerField.style.marginLeft = '20px';
                        nummerField.innerHTML = `<strong>Nr.:</strong><br>${subItem[5] || '-'}`;
    
                        // Append the icon and details to the detail div
                        transportDetails.appendChild(kuerzelField);
                        transportDetails.appendChild(transportIcon);
                        transportDetails.appendChild(abfahrtszeitField);
                        transportDetails.appendChild(kanteField);
                        transportDetails.appendChild(nummerField);
    
                        // Add the detail div to the dropdownContent
                        dropdownContent.appendChild(transportDetails);
                    });
    
                    dropdownButton.addEventListener('click', function () {
                        dropdownContent.style.display = dropdownContent.style.display === 'none' ? 'block' : 'none';
                    });
    
                    trainTimes.appendChild(arrivalWithout);
                    trainTimes.appendChild(arrivalWith);
    
                    trainInfo.appendChild(trainSvg); // Append the train SVG icon first
                    trainInfo.appendChild(trainIcon); // Then append the specific train icon
                    timeCell.appendChild(trainInfo);
                    timeCell.appendChild(trainTimes);
                    timeCell.appendChild(dropdownButton); // Add the dropdown button
                    timeCell.appendChild(dropdownContent); // Add the dropdown content
    
                    row.appendChild(timeCell);
                    table.appendChild(row); // add row to table
                });
    
                resultsContainer.appendChild(table);
            })
            .catch(error => console.error('Error fetching agency data:', error));
    }
    
    
    
    
    
    

    function displayNoResults() {
        resultsContainer.innerHTML = '';
        const noResultsMessage = document.createElement('p');
        noResultsMessage.textContent = 'Keine Verspätungen gefunden.';
        resultsContainer.appendChild(noResultsMessage);
    }

    // Parse time in 'HH:MM' format to minutes since midnight
    function parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // Initialize time range slider
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

    // Update time display when slider values change
    slider.noUiSlider.on('update', function(values, handle) {
        if (handle === 0) {
            startTimeDisplay.textContent = values[0]; // update start time display
        } else {
            endTimeDisplay.textContent = values[1]; // update end time display
        }

        filterAndDisplayResults(); // update results based on the selected time range
    });

    // Preset buttons for common time ranges
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
