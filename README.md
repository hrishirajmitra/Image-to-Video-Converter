# Image to Video Converter

Welcome to the **Image to Video Converter**! This is a web-based application that allows users to seamlessly create videos from images by uploading their files, choosing time transitions, and selecting preexisting audio files. The project is built with HTML, CSS, and JavaScript for the front end, a Flask backend, and PostgreSQL for the database.

---

## Features

- **Image Upload:** Upload multiple images in various formats (e.g., JPEG, PNG).
- **Custom Time Transitions:** Specify the duration for each image to display in the video.
- **Audio Integration:** Choose preexisting audio files to add background music to your video.
- **Drag-and-Drop Uploads:** Easily drag and drop images for quick uploading.
- **Video Resolution:** Select the resolution of the video.
- **Transition Effects:** Apply transition effects like fade-in and fade-out between images.
- **Preview:** Get a preview of your video before downloading.
- **Responsive Design:** Fully responsive user interface for optimal usage on all devices.

---

## Technology Stack

### Frontend:
- **HTML5:** For the structure of the web pages.
- **CSS3:** For styling and layout.
- **JavaScript:** For dynamic user interactions and animations.

### Backend:
- **Flask:** Lightweight Python web framework used for handling requests and generating video files.
- **PostgreSQL:** Database for storing user data, upload history, and video configurations.

### Additional Tools:
- **FFmpeg:** Used for video and audio processing.

---

## Installation and Setup

Follow these steps to set up the project locally:

1. **Set Up the Virtual Environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Server:**
   ```bash
   python3 server.py
   ```
   The application will be available at `http://127.0.0.1:5000`.

---

## Usage

1. Navigate to the homepage.
2. Upload images by clicking the "Upload Images" button or dragging and dropping files.
3. Set the desired time transition for each image.
4. Choose an audio file from the available options.
5. Customize the video resolution, aspect ratio, and transition effects as needed.
6. Click "Create Video" to generate your video.
7. Preview the video and download it once satisfied.

---

## Future Enhancements

- Option to add text overlays on images.
- Integration with cloud storage services.
