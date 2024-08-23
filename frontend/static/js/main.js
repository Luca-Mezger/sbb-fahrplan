// frontend/static/js/main.js

document.addEventListener('DOMContentLoaded', function () {
    const searchField = document.getElementById('search-field');
    const searchButton = document.getElementById('search-button');
    const suggestionsList = document.getElementById('suggestions');
    const searchResults = document.getElementById('search-results');

    let names = [];
    let filteredNames = [];

    // fetch list of names from backend
    fetch('/api/names')
        .then(response => response.json())
        .then(data => {
            names = data;
        });

    // filter for names (search)
    searchField.addEventListener('input', function () {
        const query = searchField.value.toLowerCase();
        filteredNames = names.filter(name => name.toLowerCase().includes(query));
        displaySuggestions();
    });

    // display dropdown
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

    // search button
    searchButton.addEventListener('click', function () {
        const query = searchField.value.toLowerCase();
        const results = names.filter(name => name.toLowerCase().includes(query));
        displayResults(query, results);
    });

    // display search results
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
