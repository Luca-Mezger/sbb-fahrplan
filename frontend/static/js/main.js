document.addEventListener('DOMContentLoaded', function () {
    const bahnhofSuche = document.getElementById('bahnhof-suche');
    const searchButton = document.getElementById('search-button');
    const suggestionsList = document.getElementById('suggestions');

    let names = [];
    let filteredNames = [];

    // Fetch the list of station names from the backend
    fetch('/bhfs')
        .then(response => response.json())
        .then(data => {
            // Extract the names from the JSON data
            names = data.map(station => station[1]);
        });

    // Filter names based on the search query
    bahnhofSuche.addEventListener('input', function () {
        const query = bahnhofSuche.value.toLowerCase();
        filteredNames = names.filter(name => name.toLowerCase().includes(query));
        displaySuggestions(query);
    });

    // Display the filtered suggestions in the dropdown
    function displaySuggestions(query) {
        suggestionsList.innerHTML = '';
        if (query && filteredNames.length > 0) {
            filteredNames.forEach(name => {
                const listItem = document.createElement('li');
                listItem.textContent = name;
                listItem.addEventListener('click', function () {
                    bahnhofSuche.value = name;
                    suggestionsList.innerHTML = '';
                });
                suggestionsList.appendChild(listItem);
            });
        }
    }

    // Handle the search button click
    searchButton.addEventListener('click', function () {
        const query = bahnhofSuche.value.toLowerCase();
        alert('Searching for: ' + query);
        // Implement search functionality here if needed
    });

    // Slider and button click event listeners remain unchanged
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
