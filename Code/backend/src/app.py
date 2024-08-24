# Import necessary modules from Flask
from flask import Flask, render_template, jsonify
# Import Data class from data module
from data.data import Data

# Create a Flask application instance
app = Flask(__name__,
            template_folder='../../frontend/templates', 
            static_folder='../../frontend/static')     

# Instance Data class
data = Data()

# Define a route for the home page 
@app.route("/")
def home():
    return render_template('index.html') 

# Define a route to get a list of train stations
@app.route("/bhfs")
def bhfs():
    bhfs_list = data.get_bhfs() 
    return jsonify(bhfs_list)   

# Define a route to get a list of agencies
@app.route("/agency")
def agency():
    agency_list = data.get_agency() 
    return jsonify(agency_list) 

# Define a route to get a list of new path to db
@app.route("/new_db/14-08-2024")
def new():
    db_new = data.get_old_date()
    return "03-01-2024"

# Define a route to get a list of old path to db
@app.route("/old_db/03-01-2024")
def old():
    db_old = data.get_old_date()
    return "03-01-2024"

# Define a route to get time differences for a specific train station on a given date
@app.route("/bhfs/<date>/<id>")
def dateId(date, id):
    dateId_list = data.get_time_diffs_bhf(id, date) 
    return dateId_list

# Run the Flask application in debug mode
if __name__ == "__main__":
    app.run(debug=True)
