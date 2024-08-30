#!/usr/bin/env python3
"""
A Flask application with Babel, forced locale via URL parameter, user login simulation, translations, and timezone support.
"""

from flask import Flask, render_template, request, g
from flask_babel import Babel, _, format_datetime
import pytz
from pytz.exceptions import UnknownTimeZoneError

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
    Determine the best match for supported languages in the following order:
    1. Locale from URL parameters
    2. Locale from user settings
    3. Locale from request header
    4. Default locale
    Returns:
        str: The best matching language.
    """
    # 1. Locale from URL parameters
    locale = request.args.get('locale')
    if locale in app.config['LANGUAGES']:
        return locale
    
    # 2. Locale from user settings
    if g.user and g.user.get('locale') in app.config['LANGUAGES']:
        return g.user['locale']
    
    # 3. Locale from request header
    return request.accept_languages.best_match(app.config['LANGUAGES'])

@babel.timezoneselector
def get_timezone() -> str:
    """
    Determine the best match for timezones in the following order:
    1. Timezone from URL parameters
    2. Timezone from user settings
    3. Default to UTC
    Returns:
        str: The best matching timezone.
    """
    # 1. Timezone from URL parameters
    timezone = request.args.get('timezone')
    if timezone:
        try:
            return pytz.timezone(timezone).zone
        except UnknownTimeZoneError:
            pass
    
    # 2. Timezone from user settings
    if g.user:
        user_timezone = g.user.get('timezone')
        if user_timezone:
            try:
                return pytz.timezone(user_timezone).zone
            except UnknownTimeZoneError:
                pass
    
    # 3. Default to UTC
    return app.config['BABEL_DEFAULT_TIMEZONE']

@app.route('/')
def index() -> str:
    """
    Route for the index page.
    Returns:
        str: Rendered HTML page.
    """
    current_time = format_datetime()
    return render_template('7-index.html', home_title=_("home_title"), home_header=_("home_header"), current_time=current_time)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
