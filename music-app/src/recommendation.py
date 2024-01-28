from flask import Flask, jsonify, request, abort
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import csr_matrix, hstack
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from spotipy.exceptions import SpotifyException
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

mongo_uri = os.environ.get("MONGO_URI")
client_id = os.environ.get("SPOTIFY_CLIENT_ID")
client_secret = os.environ.get("SPOTIFY_CLIENT_SECRET")

client = MongoClient(
    mongo_uri
)
db = client["MUSICAPP"]  # Replace with your database name
collection = db["tracks2"]
data = list(collection.find())

# Convert to DataFrame
music_df = pd.DataFrame(data)
music_df = music_df.drop(columns=["_id"])


musical_features = [
    "acousticness",
    "danceability",
    "energy",
    "instrumentalness",
    "liveness",
    "loudness",
    "speechiness",
    "tempo",
    "valence",
    "duration_ms",
    "popularity",
]
non_scaled_musical = ["key", "mode", "time_signature"]

tfidf = TfidfVectorizer(stop_words="english")
genre_encoded_csr = tfidf.fit_transform(music_df["track_genre"])

scaler = MinMaxScaler()
music_df[musical_features] = scaler.fit_transform(music_df[musical_features])

feature_weights = {
    "acousticness": 1.0,
    "danceability": 1.0,
    "energy": 1.0,
    "instrumentalness": 1.0,
    "liveness": 1.0,
    "loudness": 1.0,
    "speechiness": 1.0,
    "tempo": 1.0,
    "valence": 1.0,
    "duration_ms": 1.0,
    "popularity": 3.0,
}

os.environ["SPOTIPY_CLIENT_ID"] = client_id
os.environ["SPOTIPY_CLIENT_SECRET"] = client_secret
os.environ["SPOTIPY_REDIRECT_URI"] = "http://localhost:8888/callback"
sp = spotipy.Spotify(client_credentials_manager=SpotifyClientCredentials())


def apply_weights(music_df, feature_names, weights):
    weighted_df = music_df.copy()
    for feature in feature_names:
        weighted_df[feature] *= weights[feature]
    return weighted_df


def add_to_df(track_id):
    # Fetch and prepare track data
    global music_df, genre_encoded_csr
    track_dict = prepare_track(track_id)
    if track_dict is None:
        print(f"Failed to fetch data for track ID '{track_id}'")
        return music_df

    # Convert to DataFrame
    track_dict_df = pd.DataFrame([track_dict])

    # Scale musical features
    features_to_scale = track_dict_df[musical_features]
    scaled_features = scaler.transform(features_to_scale)
    track_dict_df[musical_features] = scaled_features
    music_df = pd.concat([music_df, track_dict_df], ignore_index=True)

    genre_encoded_csr = tfidf.transform(music_df["track_genre"])

    # Add to MongoDB
    try:
        collection.insert_one(track_dict)
        print(f"Track ID '{track_id}' added to MongoDB")
    except Exception as e:
        print(f"Error adding track ID '{track_id}' to MongoDB: {e}")

    return music_df


def get_genre(track_id):
    track_data = sp.track(track_id)
    artist_ids = []

    for artist in track_data["artists"]:
        artist_ids.append(artist["id"])

    artists_data = sp.artists(artist_ids)

    genres = []

    for artist in artists_data["artists"]:
        genres += artist["genres"]

    return genres[0]


def prepare_track(track_id):
    try:
        track_features = sp.audio_features(track_id)[0]
        for key in ["type", "uri", "track_href", "analysis_url"]:
            del track_features[key]
        track = sp.track(track_id)
        track_features["track_id"] = track_features["id"]
        del track_features["id"]
        track_features["track_name"] = track["name"]
        track_features["artists"] = track["artists"][0]["name"]
        track_features["popularity"] = track["popularity"]
        track_features["explicit"] = int(track["explicit"])
        track_features["track_genre"] = get_genre(track_id)

        # track_features["track_genre"] =
        return track_features
    except Exception as e:
        print(f"Error preparing track data for ID '{track_id}': {e}")
    return None


def recommend_music(track_id, num_recommendations=10, display_features=None):
    track_exists = (music_df["track_id"] == track_id).any()
    if not track_exists:
        music_df_local = add_to_df(track_id)
    else:
        music_df_local = music_df

    filtered_df = music_df_local[music_df_local["track_id"] == track_id]

    if filtered_df.empty:
        print(f"No tracks found with the id'{track_id}")
        return music_df_local

    music_df_weighted = apply_weights(music_df_local, musical_features, feature_weights)
    target_song_index = filtered_df.index[0]
    numeric_features = music_df_weighted[musical_features + non_scaled_musical].values
    numeric_features_csr = csr_matrix(numeric_features)
    combined_features = hstack([numeric_features_csr, genre_encoded_csr])
    target_song_features = combined_features[target_song_index]
    cosine_similarities = cosine_similarity(target_song_features, combined_features)[0]
    similar_song_indices = cosine_similarities.argsort()[-num_recommendations - 1 : -1][
        ::-1
    ]
    similar_song_indices = [i for i in similar_song_indices if i != target_song_index]
    index = ["track_name", "artists", "track_genre", "track_id"]

    def get_image_url(track_id):
        track = sp.track(track_id)
        return track["album"]["images"][0]["url"]

    def get_preview_url(track_id):
        track = sp.track(track_id)
        return track["preview_url"]

    if display_features:
        recommended_songs = music_df_local.iloc[similar_song_indices][
            index + musical_features + non_scaled_musical
        ]
    else:
        recommended_songs = music_df_local.iloc[similar_song_indices][index]
    recommended_songs["image_url"] = recommended_songs["track_id"].apply(get_image_url)
    recommended_songs["preview_url"] = recommended_songs["track_id"].apply(
        get_preview_url
    )
    return recommended_songs


app = Flask(__name__)
CORS(app)


@app.route("/recommend", methods=["GET"])
def recommend():
    track_id = request.args.get("track_id")
    if not track_id:
        abort(400, description="Please provide a relavent track_id")

    try:
        recommended_songs = recommend_music(track_id=track_id)

        # Print the recommendations to the console
        print("Recommended Songs:")
        # print(recommended_songs)

        return jsonify(recommended_songs.to_dict(orient="records"))
    except Exception as e:
        abort(500, description=str(e))


if __name__ == "__main__":
    app.run(debug=True)