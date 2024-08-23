// frontend/static/js/main.js

document.addEventListener('DOMContentLoaded', function () {
    const searchField = document.getElementById('search-field');
    const searchButton = document.getElementById('search-button');
    const suggestionsList = document.getElementById('suggestions');
    const searchResults = document.getElementById('search-results');

    let names = [];
    let filteredNames = [];

    // Fetch the list of names from the backend
    fetch('/api/names')
        .then(response => response.json())
        .then(data => {
            names = data;
        });

    // Filter names based on the search query
    searchField.addEventListener('input', function () {
        const query = searchField.value.toLowerCase();
        filteredNames = names.filter(name => name.toLowerCase().includes(query));
        displaySuggestions();
    });

    // Display the filtered suggestions in the dropdown
    function displaySuggestions() {
        suggestionsList.innerHTML = '';
        if (filteredNames.length > 0) {
            filteredNames.forEach(name => {
                const listItem = document.createElement('li');
                listItem.textContent = name;
                listItem.addEventListener('click', function () {
                    searchField.value = name;
                    suggestionsList.innerHTML = '';
                });
                suggestionsList.appendChild(listItem);
            });
        }
    }

    // Handle the search button click
    searchButton.addEventListener('click', function () {
        const query = searchField.value.toLowerCase();
        const results = names.filter(name => name.toLowerCase().includes(query));
        displayResults(query, results);
    });

    // Display the search results
    function displayResults(query, results) {
        searchResults.innerHTML = `<h2>Search Results for "${query}"</h2>`;
        if (results.length === 0) {
            searchResults.innerHTML += `<p>No results found.</p>`;
        } else {
            const resultsList = document.createElement('ul');
            results.forEach(result => {
                const resultItem = document.createElement('li');
                resultItem.textContent = result;
                resultsList.appendChild(resultItem);
            });
            searchResults.appendChild(resultsList);
        }
    }
});
