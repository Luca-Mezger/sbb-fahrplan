document.addEventListener('DOMContentLoaded', function () {
    const bahnhofSuche = document.getElementById('bahnhof-suche');
    const searchButton = document.getElementById('search-button');
    const suggestionsList = document.getElementById('suggestions');
    const datePicker = document.getElementById('date-picker');
    const resultsContainer = document.getElementById('results-container');
    const searchContainer = document.getElementById('search-container');

    let stations = [];
    let filteredNames = [];

    // Fetch the list of station names and ids from the backend
    fetch('/bhfs')
        .then(response => response.json())
        .then(data => {
            // Store the data as a list of objects with id and name
            stations = data.map(station => ({
                id: station[0],
                name: station[1]
            }));
        });

    // Filter names based on search query
    bahnhofSuche.addEventListener('input', function () {
        const query = bahnhofSuche.value.toLowerCase();
        
        if (query.trim() === '') {
            suggestionsList.style.display = 'none'; // Hide the dropdown if search field is empty
            return;
        }

        filteredNames = stations.filter(station => station.name.toLowerCase().includes(query));
        displaySuggestions();
    });

    // Display filtered suggestions
    function displaySuggestions() {
        suggestionsList.innerHTML = '';

        if (filteredNames.length > 0) {
            suggestionsList.style.display = 'block'; // Show dropdown if there are results
            filteredNames.forEach(station => {
                const listItem = document.createElement('li');
                listItem.textContent = station.name;
                listItem.addEventListener('click', function () {
                    bahnhofSuche.value = station.name;
                    suggestionsList.innerHTML = '';
                    suggestionsList.style.display = 'none'; // Hide dropdown on selection
                });
                suggestionsList.appendChild(listItem);
            });
        } else {
            suggestionsList.style.display = 'none'; // Hide dropdown if no results
        }
    }

    // Handle search button click
    searchButton.addEventListener('click', function () {
        const selectedName = bahnhofSuche.value;
        const selectedDate = datePicker.value; // this will be in 'yyyy-mm-dd' format
    
        // Find the station id by matching the selected name
        const selectedStation = stations.find(station => station.name === selectedName);
    
        if (selectedStation && selectedDate) {
            // Move the search box up slightly by increasing its margin-top
            searchContainer.style.marginTop = '-15px';

            // Ensure results container is visible after search
            resultsContainer.style.display = 'block';

            // Send the request with the station id and date
            const url = `/bhfs/${selectedDate}/${selectedStation.id}`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    if (data.length === 0) {
                        displayNoResults();
                    } else {
                        displayResults(data);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } else {
            alert('Please select a valid station and date.');
        }
    });

    function displayResults(data) {
        // Clear previous results
        resultsContainer.innerHTML = '';

        // Create a table to display the results
        const table = document.createElement('table');
        table.classList.add('results-table');

        data.forEach(item => {
            const row = document.createElement('tr');
            
            const timeCell = document.createElement('td');
            const trainInfo = `${item[2]} ${item[3]}`; // Combine train type and number (e.g., RE 5)
            timeCell.textContent = `${trainInfo}: Ankunft ohne Baustelle: ${item[0]} | Ankunft mit Baustelle: ${item[1]}`;
            row.appendChild(timeCell);

            table.appendChild(row);
        });

        resultsContainer.appendChild(table);
    }

    function displayNoResults() {
        // Clear previous results
        resultsContainer.innerHTML = '';

        // Display "No results" message
        const noResultsMessage = document.createElement('p');
        noResultsMessage.textContent = 'Keine Verspätungen gefunden.';
        resultsContainer.appendChild(noResultsMessage);
    }

    // Initialize date picker with min and max dates
    const minDate = new Date('2023-12-10');
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 3);

    const formatDate = (date) => {
        let day = String(date.getDate()).padStart(2, '0');
        let month = String(date.getMonth() + 1).padStart(2, '0');
        let year = date.getFullYear();
        return `${year}-${month}-${day}`;
    };

    datePicker.min = formatDate(minDate);
    datePicker.max = formatDate(maxDate);

    // Slider initialization
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

    // Initially hide the results container
    resultsContainer.style.display = 'none';
});
