from flask import Flask, request
from data.data import Data

# flask name module
data = Data()
app = Flask(__name__)

@app.route("/")
def home():
    return "SBB-Fahrplan"


@app.route("/bhfs")
def bhfs():
    bhfs_list = data.get_bhfs()
    return bhfs_list

if __name__ == "__main__":
   # data = Data()
    app.run(debug= True)