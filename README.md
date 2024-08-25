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


