let allResults = [];
document.addEventListener('DOMContentLoaded', function () {
    const bahnhofSuche = document.getElementById('bahnhof-suche');
    const searchButton = document.getElementById('search-button');
    const suggestionsList = document.getElementById('suggestions');
    const startDatePicker = document.getElementById('start-date-picker');
    const endDatePicker = document.getElementById('end-date-picker');
    const dateRangeToggle = document.getElementById('date-range-toggle');
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
    
    let transportunternehmen = [];
    let selectedAgencyKuerzel = null;

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    startDatePicker.value = today;
    endDatePicker.value = today;

    // Toggle date range
    dateRangeToggle.addEventListener('change', function () {
        if (dateRangeToggle.checked) {
            endDatePicker.style.display = 'inline-block';
        } else {
            endDatePicker.style.display = 'none';
        }
    });




    // Toggle date range
dateRangeToggle.addEventListener('change', function () {
    if (dateRangeToggle.checked) {
        endDatePicker.style.display = 'inline-block';
    } else {
        endDatePicker.style.display = 'none';
    }
});

// Function to generate an array of dates between the start and end date
function getDateRange(startDate, endDate) {
    const dateRange = [];
    let currentDate = new Date(startDate);

    while (currentDate <= new Date(endDate)) {
        dateRange.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateRange;
}


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

    timeSelectionContainer.style.display = 'none';
            timeSelectionContainer.style.height = '0px'; // Start with height 0
            timeSelectionContainer.style.overflow = 'hidden'; // Hide overflow during the animation
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
    fetch('/agency')
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
    searchButton.addEventListener('click', function () {
        const selectedName = bahnhofSuche.value;
        const selectedStartDate = startDatePicker.value;
        const selectedEndDate = dateRangeToggle.checked ? endDatePicker.value : selectedStartDate;
    
        const selectedStation = stations.find(station => station.name === selectedName);
    
        if (selectedStation && selectedStartDate && selectedEndDate) {
            searchContainer.style.marginTop = '-15px';
            resultsContainer.style.display = 'none'; // Hide results container initially
            loadingSpinner.style.display = 'block';  // Show the spinner
    
            // Generate date range and fetch results for each date
            const dateRange = getDateRange(selectedStartDate, selectedEndDate);
            const fetchPromises = dateRange.map(date =>
                fetch(`/bhfs/${date}/${selectedStation.id}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Error fetching data for ${date}: ${response.statusText}`);
                        }
                        return response.json();
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        return null; // Return null in case of an error to filter out later
                    })
            );
    
            Promise.all(fetchPromises)
                .then(results => {
                    // Filter out any null results (due to errors)
                    allResults = results.filter(result => result !== null).flat(); // Combine results from all dates
                    filterAndDisplayResults(); // Filter and display results
                })
                .catch(error => {
                    console.error('Error:', error);
                    displayNoResults();
                })
                .finally(() => {
                    loadingSpinner.style.display = 'none';  // Hide the spinner
                    resultsContainer.style.display = 'block'; // Show results container
                });
        } else {
            alert('Please select a valid station and date.');
        }
    });
    
    

    function groupResultsByDate(results) {
        if (!Array.isArray(results)) {
            console.error('Expected an array but got:', results);
            return [];
        }
    
        const grouped = results.reduce((acc, item) => {
            if (!item[0]) {
                console.warn('Skipping item with invalid or missing datetime:', item[0]);
                return acc;
            }
    
            let [time, date] = [item[0], item[item.length - 1]]; // Assuming date is the last element in the item array
    
            if (!acc[date]) acc[date] = [];
            acc[date].push(item);
            return acc;
        }, {});
    
        // Flatten grouped results back into a single array, sorted by date and time
        const flattenedResults = [];
        Object.keys(grouped).sort().forEach(date => {
            const sortedGroup = grouped[date].sort((a, b) => {
                const timeA = parseTime(a[0]);
                const timeB = parseTime(b[0]);
                return timeA - timeB;
            });
            flattenedResults.push(...sortedGroup);
        });
    
        return flattenedResults;
    }
    
    
    

    
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
            if (!item[0]) {
                console.warn('Skipping item with undefined time:', item);
                return false;
            }
    
            const timeString = item[0]; // Assuming item[0] contains only the time (e.g., '22:36')
            const arrivalTime = parseTime(timeString); // Parse the time part directly
    
            let passesFilter = arrivalTime >= start && arrivalTime <= end; // Check if it falls within the time range
    
            // Apply agency filter if an agency is selected
            if (selectedAgencyKuerzel) {
                const subItems = item[6]; // Assuming sub-items are in the 7th element (index 6)
                if (Array.isArray(subItems)) {
                    const subItemsMatchingAgency = subItems.filter(subItem => {
                        const company = subItem[4]; // Access the company value in sub-item
                        return company && company.toLowerCase() === selectedAgencyKuerzel.toLowerCase();
                    });
                    passesFilter = passesFilter && subItemsMatchingAgency.length > 0; // Combine filters
                    if (passesFilter) {
                        item[6] = subItemsMatchingAgency; // Update the item with only matching sub-items
                    }
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
            const groupedAndSortedResults = groupResultsByDate(filteredResults); // Group and sort by date
            displayResults(groupedAndSortedResults); // Display the grouped and sorted results
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

    resultsContainer.appendChild(table);
}

    
    
function populateResults(data, table) {
    data.forEach(item => {
        if (!item || item.length < 8) {
            console.warn('Skipping invalid item:', item);
            return;
        }

        const row = document.createElement('tr');
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');

        const trainInfo = document.createElement('div');
        trainInfo.classList.add('train-info');

        const trainNumberSpan = document.createElement('span');
        trainNumberSpan.classList.add('train-number');
        trainNumberSpan.textContent = item[4] || '-';
        trainNumberSpan.style.marginRight = '10px';

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

        const altTime = item[0];
        const altDate = item[item.length - 1];
        const altTimeText = `Alt: ${altTime} (${altDate})`;

        const neuTime = item[1];
        const neuDate = item[item.length - 1];
        const neuTimeText = `Neu: ${neuTime || '-'} (${neuDate})`;

        const altTimeDiv = document.createElement('div');
        altTimeDiv.textContent = altTimeText;
        altTimeDiv.style.marginBottom = '5px'; // Small margin between lines

        const neuTimeDiv = document.createElement('div');
        neuTimeDiv.textContent = neuTimeText;

        trainTimes.appendChild(altTimeDiv);
        trainTimes.appendChild(neuTimeDiv);

        const detailsButton = document.createElement('button');
        detailsButton.textContent = 'Betroffene Verbindungen';
        detailsButton.classList.add('details-button');

        const dropdownContent = document.createElement('div');
        dropdownContent.classList.add('dropdown-content');

        const separator = document.createElement('hr');
        separator.classList.add('result-separator');
        separator.style.marginTop = 0;
        separator.style.marginBottom = 0;
        separator.style.display = 'none';

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
            kuerzelField.style.width = '70px';

            const abfahrtzeitField = document.createElement('span');
            abfahrtzeitField.innerHTML = `<strong>Abfahrtszeit:</strong><br>${subItem[0] || '-'}`;
            abfahrtzeitField.style.marginRight = '20px';
            abfahrtzeitField.style.marginLeft = '20px';

            const kanteField = document.createElement('span');
            kanteField.innerHTML = `<strong>Kante:</strong><br>${subItem[3] || '-'}`;
            kanteField.style.marginRight = '20px';

            const nrField = document.createElement('span');
            nrField.innerHTML = `<strong>Nr.:</strong><br>${subItem[5] || '-'}`;
            nrField.style.width = '50px';

            const walkIconField = document.createElement('span');
                const walkIcon = document.createElement('img');
                walkIcon.src = 'https://icons.app.sbb.ch/icons/walk-large-medium.svg';
                walkIcon.alt = 'Walk Icon';
                walkIcon.classList.add('walk-icon');
                walkIcon.style.marginLeft = '15px';

                walkIconField.appendChild(walkIcon);

                const lastEntry = subItem[6] ? `${subItem[6]}'` : '-';
                const lastEntryField = document.createElement('span');
                lastEntryField.innerHTML = lastEntry;
                lastEntryField.style.marginLeft = '0px';
                lastEntryField.style.position = 'relative';
                lastEntryField.style.top = '-0.7em';

                walkIconField.appendChild(lastEntryField);
            

            transportDetails.appendChild(kuerzelField);
            transportDetails.appendChild(transportIcon);
            transportDetails.appendChild(abfahrtzeitField);
            transportDetails.appendChild(kanteField);
            transportDetails.appendChild(nrField);
            transportDetails.appendChild(walkIconField);

            detail.appendChild(transportDetails);
            dropdownContent.appendChild(detail);
        });

        detailsButton.addEventListener('click', function () {
            const isVisible = dropdownContent.style.display === 'block';
            dropdownContent.style.display = isVisible ? 'none' : 'block';
            separator.style.display = isVisible ? 'none' : 'block';
        });

        trainInfo.appendChild(trainNumberSpan);
        trainInfo.appendChild(trainSvg);
        trainInfo.appendChild(trainIcon);
        trainTimesAndButton.appendChild(trainTimes);
        trainTimesAndButton.appendChild(detailsButton);

        resultItem.appendChild(trainInfo);
        resultItem.appendChild(trainTimesAndButton);

        row.appendChild(resultItem);
        row.appendChild(separator);
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


document.getElementById('download-csv-button').addEventListener('click', function () {
    if (allResults.length === 0) {
        alert('No results available to download.');
        return;
    }

    const headers = [
        'Date',
        'Time',
        'Train Type',
        'Train Number',
        'Station',
        'Additional Info',
        'Level 1 Type',
        'Level 1 Detail 1',
        'Level 1 Detail 2',
        'Level 1 Detail 3',
        'Level 1 Detail 4',
        'Level 1 Detail 5',
        'Level 2 Type',
        'Level 2 Detail 1',
        'Level 2 Detail 2',
        // Add more headers as needed to accommodate deeper levels
    ];
    const csvRows = [];

    // Add the headers row
    csvRows.push(headers.join(','));

    // Recursive function to flatten nested structures
    function flattenItem(item, levelPrefix) {
        let flatItem = [];

        // Base details from the primary level
        flatItem.push(
            item[0] || '-',  // Date
            item[1] || '-',  // Time
            item[2] || '-',  // Train Type
            item[3] || '-',  // Train Number
            item[4] || '-',  // Station
            item[5] || '-'   // Additional Info
        );

        // Loop through the nested lists
        if (Array.isArray(item[6])) {
            item[6].forEach(subItem => {
                let subFlat = [];
                subFlat.push(
                    subItem[1] || '-',  // Sub-Transport Type
                    subItem[0] || '-',  // Sub-Transport Departure Time
                    subItem[3] || '-',  // Sub-Transport Platform
                    subItem[5] || '-',  // Sub-Transport Number
                    subItem[4] || '-'   // Sub-Transport Company
                );

                // If there are deeper nested sub-items, flatten them too
                if (Array.isArray(subItem[6])) {
                    subItem[6].forEach(deeperSubItem => {
                        let deeperSubFlat = [
                            deeperSubItem[0] || '-',  // Deeper Sub-Transport Detail 1
                            deeperSubItem[1] || '-',  // Deeper Sub-Transport Detail 2
                            // Add more as needed...
                        ];

                        // Concatenate all levels together
                        csvRows.push(flatItem.concat(subFlat, deeperSubFlat).join(','));
                    });
                } else {
                    // No deeper levels, just push the flat result
                    csvRows.push(flatItem.concat(subFlat).join(','));
                }
            });
        } else {
            // No nested lists, just push the flat result
            csvRows.push(flatItem.join(','));
        }
    }

    // Process each result in `allResults`
    allResults.forEach(item => {
        flattenItem(item);
    });

    // Create a CSV string
    const csvContent = csvRows.join('\n');

    // Create a Blob and a URL for it
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    // Create a temporary link element
    const a = document.createElement('a');
    a.href = url;
    a.download = 'results.csv';
    a.style.display = 'none';
    document.body.appendChild(a);

    // Trigger the download
    a.click();

    // Clean up the URL and remove the link element
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
});




document.getElementById('download-excel-button').addEventListener('click', function () {
    if (allResults.length === 0) {
        alert('No results available to download.');
        return;
    }

    const headers = [
        'Date',
        'Time',
        'Train Type',
        'Train Number',
        'Station',
        'Additional Info',
        'Level 1 Type',
        'Level 1 Detail 1',
        'Level 1 Detail 2',
        'Level 1 Detail 3',
        'Level 1 Detail 4',
        'Level 1 Detail 5',
        'Level 2 Type',
        'Level 2 Detail 1',
        'Level 2 Detail 2',
        // Add more headers as needed to accommodate deeper levels
    ];

    const dataRows = [];

    // Add the headers row
    dataRows.push(headers);

    // Recursive function to flatten nested structures
    function flattenItem(item, levelPrefix) {
        let flatItem = [];

        // Base details from the primary level
        flatItem.push(
            item[0] || '-',  // Date
            item[1] || '-',  // Time
            item[2] || '-',  // Train Type
            item[3] || '-',  // Train Number
            item[4] || '-',  // Station
            item[5] || '-'   // Additional Info
        );

        // Loop through the nested lists
        if (Array.isArray(item[6])) {
            item[6].forEach(subItem => {
                let subFlat = [];
                subFlat.push(
                    subItem[1] || '-',  // Sub-Transport Type
                    subItem[0] || '-',  // Sub-Transport Departure Time
                    subItem[3] || '-',  // Sub-Transport Platform
                    subItem[5] || '-',  // Sub-Transport Number
                    subItem[4] || '-'   // Sub-Transport Company
                );

                // If there are deeper nested sub-items, flatten them too
                if (Array.isArray(subItem[6])) {
                    subItem[6].forEach(deeperSubItem => {
                        let deeperSubFlat = [
                            deeperSubItem[0] || '-',  // Deeper Sub-Transport Detail 1
                            deeperSubItem[1] || '-',  // Deeper Sub-Transport Detail 2
                            // Add more as needed...
                        ];

                        // Concatenate all levels together
                        dataRows.push(flatItem.concat(subFlat, deeperSubFlat));
                    });
                } else {
                    // No deeper levels, just push the flat result
                    dataRows.push(flatItem.concat(subFlat));
                }
            });
        } else {
            // No nested lists, just push the flat result
            dataRows.push(flatItem);
        }
    }

    // Process each result in `allResults`
    allResults.forEach(item => {
        flattenItem(item);
    });

    // Create a new workbook and a worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(dataRows);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Results");

    // Generate and download the Excel file
    XLSX.writeFile(wb, 'results.xlsx');
});
