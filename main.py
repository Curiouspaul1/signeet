import os

from flask import (
    Flask, render_template, request,
    session, redirect, url_for, flash
)
from dotenv import load_dotenv
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from cachelib.file import FileSystemCache
from sqlalchemy_json import mutable_json_type
from sqlalchemy.dialects.postgresql import JSON

load_dotenv()


app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('APP_SECRET')
app.config['SESSION_TYPE'] = 'cachelib'
app.config['SESSION_SERIALIZATION_FORMAT'] = 'json'
app.config['SESSION_CACHELIB'] = FileSystemCache(
    threshold=500, cache_dir="/sessions"
)
app.config['SESSION_COOKIE_HTTPONLY'] = False

app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///main.db"

Session(app)
db = SQLAlchemy(app)


class Signatures(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=True)
    style_id = db.Column(db.String)
    left = db.Column(db.String)
    top = db.Column(db.String)
    color = db.Column(db.String)
    text = db.Column(db.String)
    font = db.Column(db.String)
    fsize = db.Column(db.String)


@app.get('/')
def index():
    past_signs = Signatures.query.all()
    return render_template('index.html', signatures=past_signs)


@app.post('/save-tee')
def save():
    if 'signature' in session:
        flash('You already signed 👀')
        return redirect(url_for('index'))

    data = request.get_json(force=True)
    print(data)
    newSig = Signatures(**data)
    db.session.add(newSig)

    try:
        db.session.commit()
    except Exception as e:
        print(e)
    finally:
        db.session.close()

    session['signature'] = True
    return {
        'msg': 'saved successfully'
    }, 200


@app.get('/remove')
def undo():
    if 'signature' in session:
        del session['signature']
    return {
        'msg': 'undone successfully'
    }, 200


if __name__ == "__main__":
    app.run()
