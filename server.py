from flask import Flask, redirect, request, session, jsonify
import jinja2
from forms import LoginForm, RegisterForm
from model import connect_to_db, db
import crud


from flask_cors import CORS

import random

import requests

app = Flask(__name__)
app.secret_key = 'dev'
app.jinja_env.undefined = jinja2.StrictUndefined # for debugging purposes

CORS(app, supports_credentials=True, origins=["http://localhost:3000"])  # Enable CORS for all routes
# setting origins ensures that the backend connects to the port 3000 that the React server is hosted on, change if using a different
# port for the React side


@app.route("/")
def homepage():
    return redirect('/login')

@app.route('/main', methods=["GET"])
def mainmenu():
    if 'username' in session:
        username = session['username']
        return jsonify({"success": True, "username": username}), 200
    else:
        return jsonify({"success": False, "message": "User not logged in"}), 401



@app.route("/login", methods=["POST"])
def login():
    """Log user into site."""
    data = request.get_json()
    form = LoginForm(data=data)

    if form.validate():
        username = form.username.data
        password = form.password.data

        # Check to see if a registered user exists with this username
        user = crud.get_user_by_username(username)
        if user and user.password == password:
            session["user_id"] = user.id
            session['username'] = user.username
            return jsonify({"success": True, "message": "Successfully logged in."}), 200
        
        return jsonify({"success": False, "message": "Either username or password was incorrect, please try again."}), 401

    # If form validation fails
    return jsonify({"success": False, "message": "Invalid input.", "errors": form.errors}), 400


@app.route("/register", methods=["POST"])
def register():
    """Registers new user into site."""
    data = request.get_json()
    form = RegisterForm(data=data)

    if form.validate_on_submit():
        name = form.name.data
        username = form.username.data
        password = form.password.data

        # Check to see if a registered user exists with this username

        if crud.get_user_by_username(username):
            return jsonify({"success": False, "message": "This username is already in use, please use another."}), 400

        user = crud.create_user(username, password)
        db.session.add(user)
        db.session.commit()
        return jsonify({"success": True, "message": "Your account was successfully created and you can now login."}), 201
    
    return jsonify({"success": False, "message": "Invalid input.", "errors": form.errors}), 400

@app.route("/logout", methods=["POST"])
def logout():
    """Log user out."""

    del session["username"]
    del session["user_id"]
    return jsonify({"success": True, "message": "User logged out."}), 200

@app.route("/pc", methods=["GET"])
def pc():

    if 'user_id' in session:
        user_id = session['user_id']
        pokemon_type = request.args.get('type')  # Get the type from query parameters
        if pokemon_type:
            pokemons = crud.get_owned_pokemon_by_typename(user_id=user_id, typename=pokemon_type)  # Pass user_id to the function
        else:
            pokemons = crud.get_owned_pokemon_by_user_id(user_id) # Fetch all Pokémon if no type is specified
        pokemon_data = [{
            "id": pokemon.id,
            "sprite": pokemon.sprite,
        } for pokemon in pokemons]

        return jsonify(pokemon_data)

@app.route("/pokemon/random")
def random_poke():
    """ Grabs a random pokemon to display when the find random pokemon button is pressed """

    total_pokemon = len(crud.get_pokemon())

    RanNum = random.randrange(1, total_pokemon)
    pokemon = crud.get_pokemon_by_id(RanNum)

    req = requests.get(f"https://pokeapi.co/api/v2/pokemon/{RanNum}").json()['forms'][0]['url']

    RanNum = random.randrange(1, 10)

    if RanNum > 1:
        pic = requests.get(req).json()['sprites']['front_default']
        shiny = 'no'
    else:
        pic = requests.get(req).json()['sprites']["front_shiny"]
        shiny = 'yes'

    """ pokemon represents the random pokemon, and pic will be a sprite of it """
    return jsonify({
        "pokemon": {
            "id": pokemon.id,
            "name": pokemon.name,
        },
        "pic": pic,
        "shiny": shiny
    })

# capture pokemon view
""" When caught, application will grab 4 moves the pokemon can know, base to hm/tm, likely from poke_moves,
    table where it keeps track of what pokemon has access to moves in moves table. Get id of pokemon from its name,
    use it to filter for moves linked to it in poke_moves, randomly grab 4, and assign to owned_poke

    Creates a owned_poke with pokemon's id and a user, and connect the 4 moves selected
    to it
"""
@app.route("/pokemon/capture/<poke_id>/<shiny>", methods=["POST"])
def capture(poke_id, shiny):

    RanNum = random.randrange(1, 10)

    if RanNum > 5:

        moves = crud.get_pokemon_move_by_poke_id(poke_id)

        pokemon = crud.get_pokemon_by_id(poke_id)
        next_url = requests.get(f"https://pokeapi.co/api/v2/pokemon/{pokemon.id}").json()['forms'][0]['url']
        if shiny == "yes":
            sprite = requests.get(next_url).json()['sprites']['front_shiny']
        else:
            sprite = requests.get(next_url).json()['sprites']['front_default']
        user_id = session["user_id"]

        pokeball = requests.get(f"https://pokeapi.co/api/v2/item/4/").json()['sprites']['default']
        print(pokeball)

        random.shuffle(moves)

        num = 0
        poke_moves = []

        for move in moves:
            if num == 4:
                break
            poke_moves.append(move)
            num += 1
        # will have Move instances of the 4 random moves(id, name, power, accuracy, pp)
        owned_poke_moves = []
        for move in poke_moves:
            owned_poke_moves.append(crud.get_move_by_id(move.move_id))

        owned_poke = crud.create_own_poke(
            poke_id,
            user_id,
            sprite,
            owned_poke_moves[0].id,
            owned_poke_moves[1].id,
            owned_poke_moves[2].id,
            owned_poke_moves[3].id,
            pokemon.name,
            crud.get_poke_type_by_id(pokemon.poketype1).poketype,
            crud.get_poke_type_by_id(pokemon.poketype2).poketype if pokemon.poketype2 else None
        )
        db.session.add(owned_poke)
        db.session.commit()

        return jsonify({
            "catch": True,
            "message": f"Caught {pokemon.name}",
            "pokeball_url": pokeball
        })

    else:
        pokemon = crud.get_pokemon_by_id(poke_id)
        return jsonify({
            "catch": False,
            "pokemon_name": pokemon.name
        })

@app.route("/pc/<poke_id>", methods=["GET"])
def details(poke_id):
    # need sprite from own_poke, used pokemon_id to query pokemon for its type and name
    # used move_id to query all info on each move
    owned_poke = crud.get_owned_pokemon_by_id(poke_id)
    pokemon = crud.get_pokemon_by_id(owned_poke.pokemon_id)
    move_1 = crud.get_move_by_id(owned_poke.move_1_id)
    move_2 = crud.get_move_by_id(owned_poke.move_2_id)
    move_3 = crud.get_move_by_id(owned_poke.move_3_id)
    move_4 = crud.get_move_by_id(owned_poke.move_4_id)

    poketype1 = crud.get_poke_type_by_id(pokemon.poketype1).poketype
    poketype2 = crud.get_poke_type_by_id(pokemon.poketype2).poketype.capitalize() if pokemon.poketype2 else None

    return jsonify({
        "owned_poke": {
            "id": owned_poke.id,
            "name": owned_poke.name.capitalize(),
            "sprite": owned_poke.sprite,
            "pokemon_id": owned_poke.pokemon_id,
            "move_1_id": owned_poke.move_1_id,
            "move_2_id": owned_poke.move_2_id,
            "move_3_id": owned_poke.move_3_id,
            "move_4_id": owned_poke.move_4_id,
        },
        "pokemon": {
            "id": pokemon.id,
            "name": pokemon.name,
        },
        "move_1": {
            "id": move_1.id,
            "name": move_1.name,
            "pp": move_1.pp,
            "power": move_1.power,
            "accuracy": move_1.accuracy,
        },
        "move_2": {
            "id": move_2.id,
            "name": move_2.name,
            "pp": move_2.pp,
            "power": move_2.power,
            "accuracy": move_2.accuracy,
        },
        "move_3": {
            "id": move_3.id,
            "name": move_3.name,
            "pp": move_3.pp,
            "power": move_3.power,
            "accuracy": move_3.accuracy,
        },
        "move_4": {
            "id": move_4.id,
            "name": move_4.name,
            "pp": move_4.pp,
            "power": move_4.power,
            "accuracy": move_4.accuracy,
        },
        "poketype1": poketype1.capitalize(),
        "poketype2": poketype2,
    })

@app.route("/api/delete/<poke_id>", methods=["DELETE"])
def delete_poke(poke_id):
    owned_poke = crud.get_owned_pokemon_by_id(poke_id)

    if owned_poke:
        db.session.delete(owned_poke)
        db.session.commit()
        return jsonify({"success": True, "message": f"{owned_poke.name.capitalize()} was released back into the wild"})
    else:
        return jsonify({"success": False, "message": "Release error"}), 400
    
@app.route("/api/update_name/<int:poke_id>", methods=["POST"])
def update_name(poke_id):

    new_name = request.json.get("new_name")

    owned_poke = crud.get_owned_pokemon_by_id(poke_id)

    if owned_poke:
        owned_poke.name = new_name
        
        db.session.commit()
        return jsonify ({
            "success": True,
            "message": "Renaming was a success",
            "new_name": owned_poke.name
        })
    else:
        return jsonify ({
            "success": False,
            "message": "Renaming error"
        }), 400
    
@app.route("/guess")
def guess():

    """ Grabs a random pokemon to display for guessing game, and grey its out so only outline is shown"""

    total_pokemon = len(crud.get_pokemon())

    RanNum = random.randrange(1, total_pokemon)
    pokemon = crud.get_pokemon_by_id(RanNum)
    guesses = 3

    req = requests.get(f"https://pokeapi.co/api/v2/pokemon/{RanNum}").json()['forms'][0]['url']

    # grabs normal sprite of pokemon
    pic = requests.get(req).json()['sprites']['front_default']

    """ pokemon represents the random pokemon, and pic will be a sprite of it """
    return jsonify({
        'success': True,
        'pokemon': {
            'name': pokemon.name,
            'id': pokemon.id
        },
        'pic': pic,
        'guesses': guesses
    })

@app.route("/api/guess/<name>", methods=["POST"])
def make_guess(name):

    """ Checks guess against name to see if user guessed the pokemon right """

    guess = request.json.get("guess").lower()
    guesses = int(request.json.get("guesses"))
    if guesses > 1:
        if guess == name:
            return jsonify ({
                "correct": True,
                "pokemon_name": name.capitalize()
            })
        else:
            return jsonify ({
                "correct": False,
                'guesses': guesses - 1
            })
    else :
        return jsonify ({
                "correct": False,
                "pokemon_name": name.capitalize(),
                "message": "No more guesses left. Better luck next time!"
            })

        

if __name__ == "__main__":
#    app.env = "development"
    connect_to_db(app, echo=False)
    app.run(debug = True, port = 8000, host = "localhost")