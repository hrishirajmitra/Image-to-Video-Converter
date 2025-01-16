import psycopg2
import os

def blob_to_bytea(blob):
    return blob.getquoted().decode('utf-8')[1:-8]

def file_to_bytea(filename):
    with open(filename, 'rb') as f:
        return f.read()
    
def preloaded_audio_to_bytea(filename):
    return file_to_bytea(os.path.join("media", filename))


def connect_to_db():
    conn_params = {
        'host': 'loli-soda-4039.7s5.aws-ap-south-1.cockroachlabs.cloud',
        'port': 26257,
        'user': 'loli_soda',
        'password': 'L_zoXe2BXy8L-ujOkkKLrQ',
        'database': 'users',
        'sslmode': 'verify-full',
        'sslrootcert': 'root.crt' # Replace with the correct path
    }

    conn_str = "host={host} port={port} user={user} password={password} dbname={database} sslmode={sslmode} sslrootcert={sslrootcert}".format(**conn_params)
    conn = psycopg2.connect(conn_str)
    return conn

def add_user(username, email, name, password):
    conn= connect_to_db()
    with conn.cursor() as c:
        c.execute("CREATE TABLE IF NOT EXISTS users (username VARCHAR(21), email VARCHAR(41), name VARCHAR(21), password_hashed VARCHAR(255))")
        c.execute("INSERT INTO users VALUES (%s, %s, %s, %s)", (username, email, name, password))
        conn.commit()

def fetch_users():
    conn= connect_to_db()
    try:
        with conn.cursor() as c:
            c.execute("SELECT username, email, name, password_hashed from users")
            data= c.fetchall()
            return data
    except:
        return []
    
def check_file(username, password):
    users= fetch_users()
    for user in users:
        if username==user[0] and password==user[3]:
            return True
    return False

def is_username_unique(username):
    users= fetch_users()
    for user in users:
        if username==user[0]:
            return False
    return True

def add_image(username, image, imageid, transition, duration, filename):
    conn= connect_to_db()
    with conn.cursor() as c:
        c.execute("CREATE TABLE IF NOT EXISTS images (username VARCHAR(21), image BYTEA, imageid INTEGER, transition VARCHAR(21), duration INTEGER, filename VARCHAR(255))")
        c.execute("INSERT INTO images VALUES (%s, %s, %s, %s, %s, %s)", (username, image, imageid, transition, duration, filename))
        conn.commit()

def fetch_images(username):
    conn= connect_to_db()
    try:
        with conn.cursor() as c:
            c.execute("SELECT * from images WHERE username= %s", (username,))
            data= c.fetchall()
            return data
    except:
        return []
    
def delete_image(imageid):
    conn= connect_to_db()
    with conn.cursor() as c:
        c.execute("DELETE FROM images WHERE imageid= %s", (imageid,))
        conn.commit()

def search_image(filename):
    conn= connect_to_db()
    l= []
    try:
        with conn.cursor() as c:
            filename= filename.split("_", 3)
            filename= filename[3]
            c.execute("SELECT filename from images")
            data= c.fetchall()
            for i in data:
                if i[3] in filename:
                    l.append(i[0])
            return l
    except:
        return l

def create_music_table():
    conn= connect_to_db()
    if not os.path.exists("media"):
        os.makedirs("media")
    with conn.cursor() as c:
        c.execute("CREATE TABLE IF NOT EXISTS music (filename VARCHAR(255), music BYTEA)")
        c.execute("SELECT filename from music")
        check= c.fetchall()
        for filename in os.listdir("media"):
            if filename.endswith(".mp3") and (filename,) not in check:
                c.execute("INSERT INTO music VALUES (%s, %s)", (filename, file_to_bytea(os.path.join("media", filename))))
        c.execute("SELECT filename from music")
        check= c.fetchall()
        for filename in check:
            if filename[0] not in os.listdir("media"):
                c.execute("DELETE FROM music WHERE filename= %s", (filename[0],))
        conn.commit()
        
def fetch_music():
    conn= connect_to_db()
    try:
        with conn.cursor() as c:
            c.execute("SELECT filename from music")
            data= c.fetchall()
            return data
    except:
        return []

def add_audio(username, id, duration, filename):
    conn= connect_to_db()
    with conn.cursor() as c:
        c.execute("CREATE TABLE IF NOT EXISTS audio (username VARCHAR(21), id INTEGER, duration INTEGER, filename VARCHAR(255))")
        c.execute("INSERT INTO audio VALUES (%s, %s, %s, %s)", (username, id, duration, filename))
        conn.commit()

def delete_audio(id):
    conn= connect_to_db()
    with conn.cursor() as c:
        c.execute("DELETE FROM audio WHERE id= %s", (id,))
        conn.commit()

def fetch_audio(username):
    conn= connect_to_db()
    try:
        with conn.cursor() as c:
            c.execute("SELECT * from audio WHERE username= %s", (username,))
            data= c.fetchall()
            return data
    except:
        return []

def fetch_audio_for_video(username):
    conn= connect_to_db()
    try:
        with conn.cursor() as c:
            c.execute("SELECT filename, duration from audio WHERE username= %s", (username,))
            data= c.fetchall()
            return data
    except:
        return []