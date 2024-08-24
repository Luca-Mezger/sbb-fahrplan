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
    let selectedAgencyKuerzel = null; // Store selected agency Kürzel

    // Set date picker to today's date
    const today = new Date().toISOString().split('T')[0];
    datePicker.value = today;

    // Hide time selection elements initially
    timeSelectionContainer.style.display = 'none';

    // Function to display a message when no results are found
    function displayNoResults() {
        resultsContainer.innerHTML = '';
        const noResultsMessage = document.createElement('p');
        noResultsMessage.textContent = 'Keine Unterbrüche gefunden.';
        resultsContainer.appendChild(noResultsMessage);
    }

    // Parse time in 'HH:MM' format to minutes since midnight
    function parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // Initialize time range slider
    const slider = document.getElementById('range-slider');

    noUiSlider.create(slider, {
        start: [0, 24],
        connect: true,
        step: 1,
        range: {
            'min': 0,
            'max': 24
        },
        format: {
            to: function (value) {
                if (value === 24) return '23:59'; // handle end of day
                return ('0' + Math.floor(value)).slice(-2) + ":00"; // format time as HH:MM
            },
            from: function (value) {
                if (value === '23:59') return 24;
                return Number(value.replace(":00", "")); // convert time back to hours
            }
        }
    });

    // Update time display when slider values change
    slider.noUiSlider.on('update', function (values, handle) {
        console.log('Slider is updating:', values);  // Ensure slider is working
        if (handle === 0) {
            startTimeDisplay.textContent = values[0]; // update start time display
        } else {
            endTimeDisplay.textContent = values[1]; // update end time display
        }
    
        filterAndDisplayResults();  // Safe to call here since slider is active
    });

    // Preset buttons for common time ranges
    document.getElementById('morning-button').addEventListener('click', function () {
        slider.noUiSlider.set([0, 12]);
    });

    document.getElementById('midday-button').addEventListener('click', function () {
        slider.noUiSlider.set([10, 15]);
    });

    document.getElementById('evening-button').addEventListener('click', function () {
        slider.noUiSlider.set([16, 24]);
    });

    resultsContainer.style.display = 'none'; // initially hide results container

    // Toggle advanced settings with smooth transition
    advancedSettingsToggle.addEventListener('click', function () {
        const isHidden = timeSelectionContainer.style.display === 'none';

        if (isHidden) {
            timeSelectionContainer.style.display = 'block';
            timeSelectionContainer.style.height = '0px'; // Start with height 0
            timeSelectionContainer.style.overflow = 'hidden'; // Hide overflow during the animation
            toggleArrow.textContent = '▲'; // Change arrow direction

            // Trigger the height transition
            setTimeout(() => {
                timeSelectionContainer.style.height = timeSelectionContainer.scrollHeight + 'px'; // Expand to full height
            }, 10);
        } else {
            timeSelectionContainer.style.height = timeSelectionContainer.scrollHeight + 'px'; // Set current height
            toggleArrow.textContent = '▼'; // Change arrow direction

            // Trigger the height transition
            setTimeout(() => {
                timeSelectionContainer.style.height = '0px'; // Collapse to height 0
            }, 10);

            // Hide the element after the transition is complete
            setTimeout(() => {
                timeSelectionContainer.style.display = 'none';
            }, 100); // Adjust time to match CSS transition duration
        }
    });

    // Listen for the transition end event to reset the height style
    timeSelectionContainer.addEventListener('transitionend', function () {
        if (timeSelectionContainer.style.height !== '0px') {
            timeSelectionContainer.style.height = 'auto'; // Reset height to auto after expansion
        }
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
        function nameSorter(a, b) {
            const queryLength = query.length;

            a = a.name;
            b = b.name;

            if ((a.toLowerCase().substring(0, queryLength) == query) &&
                (b.toLowerCase().substring(0, queryLength) == query)) {
                return a.localeCompare(b);
            }
            else if ((a.toLowerCase().substring(0, queryLength) == query) &&
                     (b.toLowerCase().substring(0, queryLength) != query)) {
                return -1;
            }
            else if ((a.toLowerCase().substring(0, queryLength) != query) &&
                     (b.toLowerCase().substring(0, queryLength) == query)) {
                return 1;
            }
            else if ((a.toLowerCase().substring(0, queryLength) != query) &&
                     (b.toLowerCase().substring(0, queryLength) != query)) {
                return a.localeCompare(b);
            }
        }

        const query = bahnhofSuche.value.toLowerCase();

        if (query.trim() === '') {
            suggestionsList.style.display = 'none';
            return;
        }

        filteredNames = stations.filter(station => station.name.toLowerCase().includes(query));
        filteredNames.sort(nameSorter);
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
        function nameSorter(a, b) {
            const queryLength = query.length;

            a = a.displayName;
            b = b.displayName;

            if ((a.toLowerCase().substring(0, queryLength) == query) &&
                (b.toLowerCase().substring(0, queryLength) == query)) {
                return a.localeCompare(b);
            }
            else if ((a.toLowerCase().substring(0, queryLength) == query) &&
                     (b.toLowerCase().substring(0, queryLength) != query)) {
                return -1;
            }
            else if ((a.toLowerCase().substring(0, queryLength) != query) &&
                     (b.toLowerCase().substring(0, queryLength) == query)) {
                return 1;
            }
            else if ((a.toLowerCase().substring(0, queryLength) != query) &&
                     (b.toLowerCase().substring(0, queryLength) != query)) {
                return a.localeCompare(b);
            }
        }

        const query = transportunternehmenSuche.value.toLowerCase();

        if (query.trim() === '') {
            transportunternehmenSuggestions.style.display = 'none';
            return;
        }

        const filteredTransportunternehmen = transportunternehmen.filter(company =>
            company.displayName.toLowerCase().includes(query)
        );
        filteredTransportunternehmen.sort(nameSorter);
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
                    selectedAgencyKuerzel = company.id;  // Store the selected Kürzel
                    console.log('Selected Agency Kürzel:', selectedAgencyKuerzel);  // Debugging line
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
    
        const selectedStation = stations.find(station => station.name === selectedName);
    
        if (selectedStation && selectedDate) {
            searchContainer.style.marginTop = '-15px';
            resultsContainer.style.display = 'none'; // Hide results container initially
            loadingSpinner.style.display = 'block';  // Show the spinner
    
            const url = `/bhfs/${selectedDate}/${selectedStation.id}`;
            fetch(url)
            .then(response => response.json())
            .then(data => {
                // Log each result to inspect its structure
                data.forEach((result, index) => {
                    console.log(`Result ${index}:`, result);
                });
        
                // Now apply filtering
                allResults = data;
        
                filterAndDisplayResults(); // Display filtered results based on time range
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
        // Ensure start and end times are defined correctly before filtering
        const [startTime, endTime] = slider.noUiSlider.get(); // Retrieve time range from slider
        const start = parseTime(startTime); // Convert start time to minutes since midnight
        const end = parseTime(endTime); // Convert end time to minutes since midnight
    
        console.log('Start time:', start); // Debugging: log start time
        console.log('End time:', end); // Debugging: log end time
    
        // Ensure allResults is correctly populated before filtering
        if (allResults.length === 0) {
            console.log('No results to filter');
            displayNoResults();
            return;
        }
    
        const filteredResults = allResults.filter(item => {
            const arrivalTime = parseTime(item[0]); // Parse the arrival time of each item
    
            let passesFilter = arrivalTime >= start && arrivalTime <= end; // Check if it falls within the time range
    
            // Apply agency filter if an agency is selected
            if (selectedAgencyKuerzel) {
                const subItems = item[6]; // Assuming sub-items are in the 7th element (index 6)
                if (Array.isArray(subItems)) {
                    const subItemsMatchingAgency = subItems.some(subItem => {
                        const company = subItem[4]; // Access the company value in sub-item
                        return company && company.toLowerCase() === selectedAgencyKuerzel.toLowerCase();
                    });
                    passesFilter = passesFilter && subItemsMatchingAgency; // Combine filters
                } else {
                    passesFilter = false; // If sub-items are not an array, don't include this item
                }
            }
    
            return passesFilter; // Include item if it passes all filters
        });
    
        console.log('Filtered Results:', filteredResults); // Log filtered results
    
        if (filteredResults.length === 0) {
            displayNoResults(); // Display message if no results found
        } else {
            displayResults(filteredResults); // Display the filtered results
        }
    }

    let agencyCache = {}; // Global cache for storing agency data

    // Function to fetch agencies and update cache
    function fetchAndCacheAgencies() {
        return fetch('/agency')
            .then(response => response.json())
            .then(agencyList => {
                let newCache = {};
                agencyList.forEach(agency => {
                    newCache[agency[0]] = agency[2]; // Cache the agency data
                });
                agencyCache = newCache; // Replace the old cache with the new one
            });
    }

    // Function to display results
    function displayResults(data) {
        resultsContainer.innerHTML = '';
        const table = document.createElement('table');
        table.classList.add('results-table');

        // Check if we need to fetch the agencies
        if (Object.keys(agencyCache).length === 0) {
            fetchAndCacheAgencies().then(() => populateResults(data, table));
        } else {
            populateResults(data, table);
        }
    }

    function populateResults(data, table) {
        data.forEach(item => {
            const row = document.createElement('tr');
            const resultItem = document.createElement('div');
            resultItem.classList.add('result-item');

            const trainInfo = document.createElement('div');
            trainInfo.classList.add('train-info');

            const trainSvg = document.createElement('img');
            trainSvg.src = '/static/assets/train.svg';
            trainSvg.alt = 'Train Icon';
            trainSvg.classList.add('train-svg-icon');

            const trainType = item[2].toLowerCase();
            const trainNumber = item[3];
            let trainIconUrl = trainNumber
                ? `https://icons.app.sbb.ch/icons/${trainType}-${trainNumber}.svg`
                : `https://icons.app.sbb.ch/icons/${trainType}.svg`;

            const trainIcon = document.createElement('img');
            trainIcon.src = trainIconUrl;
            trainIcon.alt = `${item[2]} ${item[3]}`;
            trainIcon.classList.add('train-icon');

            const trainTimesAndButton = document.createElement('div');
            trainTimesAndButton.classList.add('train-times-button-container');

            const trainTimes = document.createElement('div');
            trainTimes.classList.add('train-times');

            const arrivalWithout = document.createElement('div');
            arrivalWithout.setAttribute('data-label', 'Alt:');
            arrivalWithout.classList.add('time');
            arrivalWithout.textContent = item[0] || '-';

            const arrivalWith = document.createElement('div');
            arrivalWith.setAttribute('data-label', 'Neu:');
            arrivalWith.classList.add('time');
            arrivalWith.textContent = item[1] || '-';

            trainTimes.appendChild(arrivalWithout);
            trainTimes.appendChild(arrivalWith);

            const detailsButton = document.createElement('button');
            detailsButton.textContent = 'Betroffene Verbindungen';
            detailsButton.classList.add('details-button');

            const dropdownContent = document.createElement('div');
            dropdownContent.classList.add('dropdown-content');

            // Add hr element here
            const separator = document.createElement('hr');
            separator.classList.add('result-separator');
            separator.style.marginTop = 0; // Initially hidden
            separator.style.marginBottom = 0;
            separator.style.display = 'none'; // Initially hidden

            item[6].forEach(subItem => {
                const detail = document.createElement('div');
                detail.classList.add('transport-info');

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
                transportIcon.alt = subItem[1];
                transportIcon.classList.add('transport-icon');

                const agencyKuerzel = agencyCache[subItem[4]] || '-';

                const transportDetails = document.createElement('div');
                transportDetails.style.display = 'flex';
                transportDetails.style.alignItems = 'center';

                const kuerzelField = document.createElement('span');
                kuerzelField.innerHTML = `<strong>${agencyKuerzel}</strong>`;
                kuerzelField.style.marginRight = '10px';

                const abfahrtzeitField = document.createElement('span');
                abfahrtzeitField.innerHTML = `<strong>Abfahrtszeit:</strong><br>${subItem[0] || '-'}`;
                abfahrtzeitField.style.marginRight = '20px';
                abfahrtzeitField.style.marginLeft = '20px';

                const kanteField = document.createElement('span');
                kanteField.innerHTML = `<strong>Kante:</strong><br>${subItem[3] || '-'}`;
                kanteField.style.marginRight = '20px';

                const nrField = document.createElement('span');
                nrField.innerHTML = `<strong>Nr.:</strong><br>${subItem[5] || '-'}`;

                transportDetails.appendChild(kuerzelField);
                transportDetails.appendChild(transportIcon);
                transportDetails.appendChild(abfahrtzeitField);
                transportDetails.appendChild(kanteField);
                transportDetails.appendChild(nrField);

                detail.appendChild(transportDetails);
                dropdownContent.appendChild(detail);
            });

            detailsButton.addEventListener('click', function () {
                const isVisible = dropdownContent.style.display === 'block';
                dropdownContent.style.display = isVisible ? 'none' : 'block';
                separator.style.display = isVisible ? 'none' : 'block'; // Toggle hr visibility
            });

            trainInfo.appendChild(trainSvg);
            trainInfo.appendChild(trainIcon);
            trainTimesAndButton.appendChild(trainTimes);
            trainTimesAndButton.appendChild(detailsButton);

            resultItem.appendChild(trainInfo);
            resultItem.appendChild(trainTimesAndButton);

            row.appendChild(resultItem);
            row.appendChild(separator); // Append hr before dropdown content
            row.appendChild(dropdownContent);
            table.appendChild(row);
        });

        resultsContainer.appendChild(table);
    }

    // Function to set a single option in a dropdown from a given endpoint
    function setDropdownOption(endpoint, dropdownId) {
        fetch(endpoint)
            .then(response => response.text()) // Expecting a single string response
            .then(text => {
                const dropdown = document.getElementById(dropdownId);
                dropdown.innerHTML = ''; // Clear any existing options
                const option = document.createElement('option');
                option.value = text; // Set the option value to the fetched string
                option.textContent = text; // Use the fetched string as the option label
                dropdown.appendChild(option);
            })
            .catch(error => console.error('Error fetching dropdown data:', error));
    }

    // Get the base URL dynamically
    const baseUrl = window.location.origin;

    // Construct the endpoint URLs dynamically
    const newDbUrl = `${baseUrl}/new_db`;
    const oldDbUrl = `${baseUrl}/old_db`;

    // Set the option for the "Neuer Fahrplan" dropdown
    setDropdownOption(newDbUrl, 'neuer-fahrplan-dropdown');

    // Set the option for the "Alter Fahrplan" dropdown
    setDropdownOption(oldDbUrl, 'alter-fahrplan-dropdown');
});
