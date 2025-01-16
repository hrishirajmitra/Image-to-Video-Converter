import ffmpeg
import os
import shutil
import base64
from PIL import Image, ImageOps
from sql_connect import fetch_images, fetch_audio_for_video

def get_resolution(resolution_string):
    if resolution_string=='144p':
        return '256,144'
    elif resolution_string=='240p':
        return '426,240'
    elif resolution_string=='360p':
        return '640,360'
    elif resolution_string=='480p':
        return '854,480'
    elif resolution_string=='720p':
        return '1280,720'
    elif resolution_string=='1080p':
        return '1920,1080'
    else:
        return '1920,1080'

def find_dimensions(image, resolution):
    width, height = image.size
    w, h= map(int, resolution.split(','))
    if width/height > w/h:
        new_height = int(w*height/width)
        new_width = w
        border_height = h-new_height
        border_width = 0
        
    else:
        new_width = int(h*width/height)
        new_height = h
        border_width = w-new_width
        border_height = 0
        
    return new_width, new_height, border_width, border_height

def create_movie(username, resolution, fps, file_format):
    resolution = get_resolution(resolution)
    try:
        if os.path.exists('output.' + file_format):
            os.remove('output.' + file_format)
        if os.path.exists('movie.' + file_format):
            os.remove('movie.' + file_format)
        input_files = []
        transitions= []
        durations= []
        files= fetch_images(username)
        filepath= os.path.join('static', 'usernames', username)

        if not os.path.exists(filepath):
            os.makedirs(filepath)

        fetched_images= fetch_images(username)
        for image in fetched_images:
            id, image, transition, duration, name= image[2], image[1], image[3], image[4]+1, image[5]
            if len(durations)==0:
                durations.append(duration)
            else:
                durations.append(duration+durations[-1])
            transition= transition.lower()
            if transition in ['circleopen', 'fade', 'wipeleft', 'wiperight', 'wipeup', 'wipedown', 'slideleft', 'slideright', 'slideup', 'slidedown', 'radial', 'smoothleft', 'smoothright', 'smoothup', 'smoothdown', 'circlecrop', 'rectangle', 'distance', 'fadeblack', 'fadewhite']:
                transitions= [transition]+transitions
            else:
                transitions= ['fade']+transitions
            if not name.endswith(('.jpg', '.jpeg', '.png', '.gif')):
                continue
            id= int(id)
            duration = int(duration)
            filename= name
            encoded_image = base64.b64encode(image).decode('utf-8')
            with open(os.path.join(filepath, filename), "wb") as file:
                file.write(base64.b64decode(encoded_image))

            image = Image.open(os.path.join(filepath, filename))
            width, height, border_width, border_height= find_dimensions(image, resolution)
            image= image.resize((width, height))
            image= ImageOps.expand(image, (border_width//2, border_height//2, border_width-(border_width//2), border_height-(border_height//2)), fill='black')
            image.save(os.path.join(filepath, "new_"+filename))

            if not os.path.exists(os.path.join('static', 'mini_videos')):
                os.makedirs(os.path.join('static', 'mini_videos'))
            output_path = os.path.join('static', 'mini_videos', f'{name}.mp4')
            (
                ffmpeg
                .input(os.path.join(filepath, "new_"+filename), loop=1, t=duration)
                .filter('scale', resolution)
                .filter('setsar', '1')
                .output(output_path, r=fps, format='mp4')
                .global_args('-y') 
                .run()
            )
            input_files.append(output_path)
        
        streams = [ffmpeg.input(input_file) for input_file in input_files]
        transitions= transitions[1:]
        for i in range(len(streams)-1):
            x = ffmpeg.filter([streams[i], streams[i+1]], 'xfade', transition=transitions[i], duration= 1, offset= durations[i]-(0.5*(i+1))) 
            output_stream = x.output('movie'+ str(i) + '.' + file_format)
            ffmpeg.run(output_stream, overwrite_output=True)
            streams[i+1] = ffmpeg.input('movie'+ str(i) + '.' + file_format)
            
        output_stream = streams[-1].output('movie.' + file_format)
        ffmpeg.run(output_stream, overwrite_output=True)

        shutil.rmtree(os.path.join('static', 'usernames'))
        for file in input_files:
            os.remove(file)
        shutil.rmtree(os.path.join('static', 'mini_videos'))
        for i in range(len(streams)-1):
            if os.path.exists('movie'+ str(i) + '.' + file_format):
                os.remove('movie'+ str(i) + '.' + file_format)

        return True
    
    except Exception as e:
        print(e)
        return False

def cut_audio(audio_file, duration):
    try:
        # Ensure the cut_media directory exists
        if not os.path.exists('cut_media'):
            os.makedirs('cut_media')

        audio_file = os.path.join('media', audio_file)
        output_file = os.path.join('cut_media', 'cut_'+audio_file)

        stream = ffmpeg.input(audio_file)
        stream = ffmpeg.output(stream, os.path.join('cut_media', 'cut_' + os.path.basename(audio_file)), t=duration)
        ffmpeg.run(stream, overwrite_output=True)

        return True
    except:
        return False

def combine_audio_files(username):
    try:
        audio_list= fetch_audio_for_video(username)
        # Ensure the combined_audio directory exists
        if not os.path.exists('combined_audio'):
            os.makedirs('combined_audio')

        # Create a list of all the audio files
        audio_files = [audio[0] for audio in audio_list]

        # Create a list of all the durations
        durations = [audio[1] for audio in audio_list]

        # Initialize an empty list to store the audio streams
        audio_streams = []

        for i in range(len(audio_files)):
            cut_audio(audio_files[i], durations[i])
            # Input the cut audio file
            audio_stream = ffmpeg.input(os.path.join('cut_media', "cut_"+audio_files[i]))
            # Add the audio stream to the list of audio streams
            audio_streams.append(audio_stream)

        # Concatenate the audio streams into a single audio stream
        combined_audio = ffmpeg.concat(*audio_streams, v=0, a=1)

        # Output the combined audio to a file
        output_stream = ffmpeg.output(combined_audio, 'combined_audio/mega_audio.mp3')
        ffmpeg.run(output_stream, overwrite_output=True)

        return True
    except:
        return False
    
def add_audio_to_video(video_file, username):
    try:
        extension= video_file.split('.')[-1]
        combine_audio_files(username)
        audio_file= os.path.join('combined_audio', 'mega_audio.mp3')
        # Input the video file
        video_stream = ffmpeg.input(video_file)

        # Input the audio file and loop it if necessary
        audio_stream = ffmpeg.input(audio_file, stream_loop=-1)

        # Combine the video and audio streams and cut the audio if it's longer than the video
        combined_stream = ffmpeg.output(video_stream, audio_stream, 'output.'+extension, shortest=None)

        # Run the ffmpeg command
        ffmpeg.run(combined_stream, overwrite_output=True)
        if os.path.exists('cut_media'):
            shutil.rmtree('cut_media')
        if os.path.exists('combined_audio'):
            shutil.rmtree('combined_audio')
        if os.path.exists(video_file):
            os.remove(video_file)

        return True
    except:
        return False
    
# create_movie('firearc7', '1080p', 30, 'mp4')