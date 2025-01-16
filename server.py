from flask import *
import os
from sql_connect import *
from movie_maker import *
from flask_jwt_extended import *
from datetime import *
import psycopg2
from psycopg2 import *
import base64
import time
from werkzeug.utils import secure_filename
from movie_maker import create_movie

app = Flask(__name__)
app.config["JWT_TOKEN_LOCATION"] = ["headers", "cookies", "json", "query_string"]
app.config["JWT_COOKIE_SECURE"] = False
app.config['JWT_SECRET_KEY'] = 'jhg87trgy3figovuewy'
app.config['JWT_TOKEN_EXPIRES'] = timedelta(days=30)
jwt = JWTManager(app)

app.config['UPLOAD_FOLDER'] = './static/files' 
upload_dir = app.config['UPLOAD_FOLDER']
if not os.path.exists(upload_dir):
    os.makedirs(upload_dir)

offset = 0
global_user_id = None  # Initialize the global variable

@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    global global_user_id  # Reference the global variable
    global_user_id = None
    while global_user_id == None:
        global_user_id = get_jwt_identity()  # Set the global variable to the identity
        print('holyfuck')
    return jsonify(logged_in_as=global_user_id), 200

create_music_table()
@app.route('/', methods=['GET'])
def start():
    return redirect(url_for('index'))

def delete_files(path):
    if not os.path.exists('./' + path):
        os.mkdir('./' + path)
    all_files = os.listdir(f'./{path}')
    for file in all_files:
        os.remove(f'./{path}/{file}')

def get_image_data(input_value):
    all_images = fetch_images(global_user_id)
    images = [image[1] for image in all_images]
    encoded_images = []
    for image in images:
        encoded_image = base64.b64encode(image).decode('utf-8')
        encoded_images.append(encoded_image)
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    files = os.listdir(upload_dir)
    photo_ids = [image[2] for image in all_images]
    display_images = []
    transitions = [image[3] for image in all_images]
    durations = [image[4] for image in all_images]
    filename = [image[5] for image in all_images]
    image_data = []
    for idx in range(len(photo_ids)):
        display_images.append(filename[idx].split('_', 3)[3])
        if input_value in display_images[idx]:
            image_data.append([filename[idx], transitions[idx], durations[idx], encoded_images[idx], display_images[idx]])
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename[idx])
            if not os.path.exists(file_path):
                with open(file_path, 'w') as file:
                    file.write('New file for rendering purposes\n')
    return image_data

@app.route('/search_images', methods = ['POST'])
def search_images():
    data = request.json
    search_input = data.get('input_value')
    if global_user_id == None:
        return jsonify(success = False, message = 'User not logged in')
    image_data = get_image_data(search_input)
    return jsonify({'message': 'Got images successfully', 'image_data': image_data})

@app.route('/get_images', methods=['GET'])
def get_images():
    if global_user_id == None:
        return jsonify(success = False, message = 'User not logged in')
    image_data = get_image_data('')
    return jsonify({'message': 'Got images successfully', 'image_data': image_data})

@app.route('/api/GetUserId', methods=['GET'])
@jwt_required()
def get_user_id():
    id=global_user_id
    return jsonify({'success': True, 'user_id': id})

@app.route('/index', methods=['GET'])
def index():
    access_token = request.cookies.get('access_token_cookie')
    if access_token:
        try:
            decoded_token = decode_token(access_token)
            user_id = decoded_token.get('sub')
            return redirect(url_for('video_customization'))
        except:
            print('Error in decoding the token')
    return render_template('index.html')

@app.route('/admin', methods=['GET'])
def admin():
    return render_template('admin.html')

@app.route('/video_customization', methods=['GET'])
@jwt_required()
def video_customization():
    images = fetch_images(global_user_id)
    encoded_images = []
    for image in images:
        encoded_image = base64.b64encode(image[1]).decode('utf-8')
        encoded_images.append(encoded_image)

    if not encoded_images:
        return render_template('video_customization.html', message="No images found for the user.")

    return render_template('video_customization.html', images=encoded_images)

@app.route('/LogoutUser', methods=['GET'])
def LogoutUser():
    response = make_response(redirect(url_for('index')))
    response.set_cookie('access_token_cookie', '', expires=0)
    if os.path.exists(os.path.join("static", "files")):
        shutil.rmtree(os.path.join("static", "files"))
    return response

@app.route('/api/LoginUser', methods=['POST'])
def loginUser():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if username == 'admin' and password == 'lolisoda':
        return redirect(url_for('admin'))
    else:
        if check_file(username, password):
            access_token = create_access_token(identity=username)
            response = make_response(redirect(url_for('video_customization')))
            response.set_cookie('access_token_cookie', value=access_token, max_age=2592000, httponly=True)
            return response
        return redirect(url_for('index'))

@app.route('/static/files/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/upload_images', methods = ['POST'])
def upload_images():
    global offset
    offset += 10
    username = global_user_id
    file = request.files['imageFile']
    image = file.read()
    image_id = int(time.time()) + offset
    transition = request.form.get('transition')
    duration = request.form.get('duration')
    filename = secure_filename(str(image_id) + '_' + str(transition) + '_' + str(duration) + '_' + file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    with open(file_path, 'wb') as f:
        f.write(image)

    add_image(username, image, image_id, transition, duration, filename)
    image_url = f"./static/files/{filename}"
    return jsonify({'message': 'Image uploaded successfully', 'image_url': image_url})

@app.route('/api/deleteImage/<path:image_source>', methods=['DELETE'])
def deleteImage(image_source):
    image_source = image_source.split('/')[-1]
    photo_id = image_source.split('_')[0]
    delete_image(photo_id)
    folder_path = './static/files'
    all_images = os.listdir(folder_path)
    for image in all_images:
        if image == image_source:
            image_path = os.path.join(folder_path, image)
            os.remove(image_path)
    message = "Image deleted successfully. Photo ID: "+str(photo_id)
    return jsonify({'success': True, 'message': message})
    
def verifyEmail(email):
    flag = 0
    for char in email:
        if char == '@':
            flag = 1
        if flag == 1 and char == '.':
            flag = 2
    return True if (flag == 2) else False

def checkPassword(password):
    number = capital = special = False
    for char in password:
        if '0' <= char <= '9':
            number = True
        elif 'A' <= char <= 'Z':
            capital = True
        elif not ('a' <= char <= 'z'):
            special = True
    return number, capital, special

def addToDataBase(username, email, name, password):
    add_user(username, email, name, password)

@app.route('/api/RegisterUser', methods=['POST'])
def registerUser():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    name = data.get('name')
    password = data.get('password')

    usernameUnique = usernameLength = False
    emailLength = emailVerify = False
    nameLength = False
    passwordLength = passwordNumber = passwordCapital = passwordSpecial = False
    noSpace = False

    if is_username_unique(username):
        usernameUnique = True

    if len(username) <= 20:
        usernameLength = True

    if len(email) <= 40:
        emailLength = True

    if verifyEmail(email):
        emailVerify = True

    if len(name) <= 20:
        nameLength = True

    if 8 <= len(password) <= 20:
        passwordLength = True

    passwordNumber, passwordCapital, passwordSpecial = checkPassword(password)
    for char in username:
        if char == ' ':
            noSpace = True
    for char in email:
        if char == ' ':
            noSpace = True
    for char in name:
        if char == ' ':
            noSpace = True
    for char in password:
        if char == ' ':
            noSpace = True

    success = usernameUnique & usernameLength & emailLength & emailVerify & nameLength & passwordLength & passwordNumber & passwordCapital & passwordSpecial & (not noSpace)
    if success:
        addToDataBase(username, email, name, password)
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'usernameUnique': usernameUnique, 'usernameLength': usernameLength,
                        'emailLength': emailLength, 'emailVerify': emailVerify, 'nameLength': nameLength,
                        'passwordLength': passwordLength, 'passwordNumber': passwordNumber,
                        'passwordCapital': passwordCapital,
                        'passwordSpecial': passwordSpecial, 'noSpace': noSpace})

@app.route('/api/GetTable', methods=['GET'])
def getTable():
    table = fetch_users()
    return jsonify({'success': True, 'table': table})

@app.route('/api/GetMusicOptions', methods=['GET'])
def getMusicOptions():
    music_options =fetch_music() 
    return jsonify({'success': True, 'music_options': music_options})

@app.route('/api/uploadMusicInfo', methods=['POST'])
def upload_music_info():
    data = request.json
    id=data.get('id')
    id=id.split("-")[-1]
    
    # You can process the received data further as needed
    add_audio(global_user_id,id,data.get('duration'),data.get('selectedMusic'))
    return jsonify({'message': 'Data received successfully'})

@app.route('/api/removeMusicItem', methods=['POST'])
def remove_music_item():
    id= request.args.get('id').split("-")[-1]
    # Perform any other necessary actions here
    delete_audio(id)
    return {'message': 'Music item removed successfully'}, 200

@app.route('/get_music_data', methods=['GET'])
def get_music_data():
    try:
        # Assuming global_user_id is defined somewhere in your Flask app
        music_data = fetch_audio(global_user_id)  # Call the fetch_audio function with the global_user_id
        return jsonify({'music_data': music_data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/video_route', methods=['POST'])
def video_route():
    data = request.json
    resolution = data.get('resolution')
    fps = data.get('fps')
    output_format = data.get('outputFormat')
    create_movie(global_user_id, resolution, fps, output_format)
    movie_name = './movie.' + output_format
    add_audio_to_video(movie_name, global_user_id)
    output_name = './output.' + output_format
    print('output_name = ', output_name)
    while not os.path.exists(output_name):
        time.sleep(2)
        print('sleeping')
    return jsonify({'message': 'Data received successfully'})

@app.route('/output.mp4', methods = ['POST'])
def video():
    data = request.json
    output_format = data.get('outputFormat')
    output_video = 'output.' + output_format
    directory = '.'
    return send_from_directory(directory, output_video)

if __name__ == '__main__':
    app.run(debug=True)
