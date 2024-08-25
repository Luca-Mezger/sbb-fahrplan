# SBB Fahrplan by TrackHackers
SBB Fahrplan Challenge BernHäckt 2024   
by Rebeca, Benjamin, Luca

## Architektur

![image](Code/img/sbb-fahrbahn.svg)
Kommentar?

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

## Datenmodell 
Folgende Tabellen werden verwendet

- Bahnhof
- Agentur
- Ankünfte mit Zeitunterschied
- TBC

## Datenfluss

TBD

## Features

TBD
