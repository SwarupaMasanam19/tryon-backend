from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allows frontend requests from different origins

@app.route("/")
def home():
    return "Flask is running!"

@app.route("/tryon", methods=["POST"])
def tryon():
    if "user_image" not in request.files or "cloth_image" not in request.files:
        return jsonify({"error": "Missing files!"}), 400
    return jsonify({"result": "Try-On Successful!"}), 200


if __name__ == "__main__":
    app.run(debug=True)
