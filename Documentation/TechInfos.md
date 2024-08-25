# Technische Information für die Jury

## Aktueller Stand des Sourcecodes
- [Code Repository](https://github.com/Luca-Mezger/sbb-fahrplan)

## Ausgangslage
- **Projektziel**: Entwicklung einer Webanwendung zur Suche von Busverbindungen, die wegen Verspätungen des Zuges nicht effizient operieren. Viele Buslinien sind auf die eintreffenden Züge abgestimmt und vertrauen auf die Lieferung der Passagiere. Unsere Applikation hilf den Verkehrsunternehmen herauszufinden, wo es optimal wäre, eine Anschlussverbindung nach hinten zu verschieben.
- **Ausgangslage**: sqlite Datenbanken

### Fokus
1. Analyse von Fahrplanänderungen
2. Finden von Unterschieden in Ankunfts- und Abfahrtszeiten
3. Anschlussverbindungen finden, die die verspäteten Züge verpassen würden    
   --> graphische Darstellung für die Verkehrsunternehmen

### Technische Grundsatzentscheide
- **Webapp**: Von überall nutzbar
- **Flask**: Backend-Framework für serverseitige Logik (Python)
- **SQLite**: Datenbank für Fahrplandaten (SQL)
- **Front End**: HTML/CSS/JS

## Technischer Aufbau

### Komponenten und Frameworks
- **Flask**: Serverseitige Logik und Routensteuerung
- **SQLite**: Speicherung und Abfragen der Fahrplandaten
- **JavaScript (noUiSlider)**: Datenaufbereitung
- **HTML/CSS**: Strukturierung und Gestaltung des Frontends

### Einsatz
- **Web-Anwendung**: Lokale oder serverseitige Ausführung (https://test.wir-lernen-weiter.ch/)
- **Benutzerinteraktion**: Nutzung durch Transportunternehmen --> Auswahl von Bahnhöfen und Transportunternehmen, Filterung nach Zeitfenstern etc.

## Implementation

### Spezielles
- **Zeitauswahl**: Benutzerfreundlicher Schieberegler für die Zeitauswahl
- **Erweiterte Einstellungen**: Dynamisch einblendbare Filtermöglichkeiten
- **Automatische Vervollständigung**: Eingabefelder für Bahnhöfe und Transportunternehmen

### Besonders Cool
- **Visualisierung von Unterschieden**: Hervorhebung der Unterschiede zwischen altem und neuem Fahrplan
- **Dynamische Datenanzeige**: Echtzeit-Aktualisierung der Ergebnisse basierend auf Suchparametern
- **Modularität**: Alle Datenpunkte frei wählbar

## Abgrenzung/Offene Punkte

### Nicht implementiert und weshalb
- **Internationale Bahnhöfe**: Fokus auf nationale Bahnhöfe, da Datenquellen auf nationale Fahrpläne beschränkt sind
- **Live-Daten**: Keine Echtzeitdaten integriert, da der Schwerpunkt auf der Analyse von Fahrplandaten liegt und 2 Fahrpläne vergleichen muss. Um in der Zukunft Verbesserungspotenzial zu entdecken.
