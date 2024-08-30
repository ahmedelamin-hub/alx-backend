#!/usr/bin/env python3
"""
A Flask application with Babel, forced locale via URL parameter, user login simulation, and translations.
"""

from flask import Flask, render_template, request, g
from flask_babel import Babel, _

class Config:
    """
    Config class for Flask app.
    """
    LANGUAGES = ["en", "fr"]
    BABEL_DEFAULT_LOCALE = "en"
    BABEL_DEFAULT_TIMEZONE = "UTC"

app = Flask(__name__)
app.config.from_object(Config)

babel = Babel(app)

# Mock user database
users = {
    1: {"name": "Balou", "locale": "fr", "timezone": "Europe/Paris"},
    2: {"name": "Beyonce", "locale": "en", "timezone": "US/Central"},
    3: {"name": "Spock", "locale": "kg", "timezone": "Vulcan"},
    4: {"name": "Teletubby", "locale": None, "timezone": "Europe/London"},
}

def get_user() -> dict:
    """
    Get a user by the ID provided in the 'login_as' URL parameter.
    Returns:
        dict: The user dictionary or None if the user doesn't exist.
    """
    user_id = request.args.get('login_as')
    if user_id and user_id.isdigit():
        return users.get(int(user_id))
    return None

@app.before_request
def before_request() -> None:
    """
    Executed before all requests.
    Sets the user in the global context if found.
    """
    g.user = get_user()

@babel.localeselector
def get_locale() -> str:
    """
    Determine the best match for supported languages or use locale from URL parameters.
    Returns:
        str: The best matching language.
    """
    locale = request.args.get('locale')
    if locale in app.config['LANGUAGES']:
        return locale
    if g.user and g.user.get('locale') in app.config['LANGUAGES']:
        return g.user['locale']
    return request.accept_languages.best_match(app.config['LANGUAGES'])

@app.route('/')
def index() -> str:
    """
    Route for the index page.
    Returns:
        str: Rendered HTML page.
    """
    return render_template('5-index.html', home_title=_("home_title"), home_header=_("home_header"))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

