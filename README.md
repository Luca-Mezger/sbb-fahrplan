# SBB Fahrplan by TrackHackers
### SBB Fahrplan Challenge BernHäckt 2024   
by Rebeca, Benjamin, Luca

DEMO: https://test.wir-lernen-weiter.ch/

## Architektur

![image](Misc/img/sbb-fahrbahn-architektur.svg)

## Anleitung
### Deployment
Für die Benutzung des Produkts wird nur Python (z.B. 3.10) mit Flask (z.B. 3.0.0) verwendet.
```bash
cd Code/backend/src
flask run --host=0.0.0.0 --port=8000
```
 ### Nutzung
 1. Als Verkehrsunternehmen gewünschter Bahnhof auswählen
 2. Datumsrange auswählen
 3. Zeitrange auswählen (um z.B. nur die letzten Verbindungen am Tag zu checken)
 4. Transportunternehmen auswählen (dann werden nur die eigenen Verbindungen angezeigt)
 5. 2 Vergleichsdatensätzen Auswählen   
    --> Resultate generieren mit dem "Such" Button

![image](Misc/img/screenshot.png)

## Datenmodell 
Folgende Tabellen werden verwendet

![image](Misc/img/TrackHackers_db-modell.svg)

## Prozessfluss

![image](Misc/img/prozessfluss.svg)

## Features
- Here are the key features of the app:

1. **Web Interface:**
   - The app uses Flask to serve a web interface, rendering templates and serving static files
2. **Station and Agency Data Retrieval:**
   - Routes (`/bhfs` and `/agency`) provide JSON lists of train stations and agencies
3. **Database Management:**
   - many SQLite databases (used are two: old and new) to compare data and identify changes over time
4. **Date-Specific Queries:**
   - Routes (`/bhfs/<date>/<id>`) allow querying time differences and identifying delays for specific train stations on specific dates
5. **CSV and Excel Download:**
   - Results as CSV or Excel files
6. **Advanced Search:**
   - Advanced search options, including date range, time range, and filtering by transport company
7. **Dynamic UI Elements:**
   - Interactive elements such as sliders, dropdowns, and real-time suggestions


