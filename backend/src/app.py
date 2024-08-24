from flask import Flask, render_template, jsonify, request
from data.data import Data

app = Flask(__name__,
            template_folder='../../frontend/templates', 
            static_folder='../../frontend/static')       

data = Data()

@app.route("/")
def home():
    return render_template('index.html')

@app.route("/bhfs")
def bhfs():
    bhfs_list = data.get_bhfs()
    return jsonify(bhfs_list)  #return as json

@app.route("/agency")
def agency():
    agency_list = data.get_agency()
    return jsonify(agency_list)  

'''
@app.route('/search')
def search():
    return "Search results for bhf"
'''

    
@app.route("/agency")
def agency():
    agency_list = data.get_agency()
    return agency_list

@app.route("/bhfs/<date>/<id>")
def dateId():
    dateId_list = data.get_dateId()
    return dateId_list

if __name__ == "__main__":
    app.run(debug=True)
