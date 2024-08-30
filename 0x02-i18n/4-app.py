#!/usr/bin/env python3
"""
A Flask application with Babel, locale selection via URL parameter, and translations.
"""

from flask import Flask, render_template, request
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

@babel.localeselector
def get_locale() -> str:
    """
    Determine the best match for supported languages or use locale from URL parameters.
    Returns:
        str: The best matching language.
    """
    # Check if 'locale' parameter is in the URL and if it's a supported language
    locale = request.args.get('locale')
    if locale in app.config['LANGUAGES']:
        return locale
    return request.accept_languages.best_match(app.config['LANGUAGES'])

@app.route('/')
def index() -> str:
    """
    Route for the index page.
    Returns:
        str: Rendered HTML page.
    """
    return render_template('4-index.html', home_title=_("home_title"), home_header=_("home_header"))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
