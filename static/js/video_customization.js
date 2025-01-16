document.addEventListener('DOMContentLoaded', function () {
    const uploadArea = document.getElementById('uploadArea');
    const imageList = document.getElementById('imageList');
    const logoutButtonId = document.getElementById('logoutBtn');
    // Get reference to the search button
    const searchButton = document.querySelector('.search-button');
    const musicList = document.getElementById('Musiclist');

    // Counter for generating unique IDs

    fetch('/protected', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('user_id: ', data.logged_in_as);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    function renderImages(image_url, transition_value, duration_value, encoded_image, filename_display, file) {
        if (file != null) {
            var formData = new FormData();
            formData.append('imageFile', file);
            formData.append('uploaded', false);
        }
        const wrapper = document.createElement('div');
        wrapper.classList.add('wrapper');

        const imgContainer = document.createElement('div');
        imgContainer.classList.add('image-container');

        const img = document.createElement('img');
        img.src = (image_url === null) ? URL.createObjectURL(file) : "data:image/jpeg;base64," + encoded_image;

        const deleteImageSource = (image_url === null) ? img.src : image_url;

        const deleteIcon = document.createElement('span');
        deleteIcon.classList.add('close');
        deleteIcon.addEventListener('click', function () {
            wrapper.remove();
            totalImages--;
            deleteImage(deleteImageSource);
        });

        const transitionDropdown = document.createElement('select');
        transitionDropdown.classList.add('transition-dropdown');
        transitionDropdown.innerHTML = `
                <option value="">Select Transition</option>
                <option value="CircleOpen">CircleOpen</option>
                <option value="Fade">Fade</option>
                <option value="WipeLeft">WipeLeft</option>
                <option value="WipeRight">WipeRight</option>
                <option value="WipeUp">WipeUp</option>
                <option value="WipeDown">WipeDown</option>
                <option value="SlideLeft">SlideLeft</option>
                <option value="SlideRight">SlideRight</option>
                <option value="SlideUp">SlideUp</option>
                <option value="SlideDown">SlideDown</option>
                <option value="Radial">Radial</option>
                <option value="SmoothLeft">SmoothLeft</option>
                <option value="SmoothRight">SmoothRight</option>
                <option value="SmoothUp">SmoothUp</option>
                <option value="SmoothDown">SmoothDown</option>
                <option value="CircleCrop">CircleCrop</option>
                <option value="Rectangle">Rectangle</option>
                <option value="Distance">Distance</option>
                <option value="FadeBlack">FadeBlack</option>
                <option value="FadeWhite">FadeWhite</option>
            `;

        const durationInput = document.createElement('input');
        durationInput.type = 'number';
        durationInput.classList.add('duration-input');
        durationInput.placeholder = 'Image Duration (in seconds)';

        imgContainer.appendChild(img);
        imgContainer.appendChild(deleteIcon);

        const fileNameDiv = document.createElement('div');
        fileNameDiv.classList.add('filename-div');
        fileNameDiv.textContent = (file !== null) ? file.name : filename_display;
        imgContainer.appendChild(fileNameDiv);

        const optionsWrapper = document.createElement('div');
        optionsWrapper.classList.add('options-wrapper');
        optionsWrapper.appendChild(transitionDropdown);
        optionsWrapper.appendChild(durationInput);
        imgContainer.appendChild(optionsWrapper);

        wrapper.appendChild(imgContainer);
        imageList.appendChild(wrapper);

        const uploadButtonParent = document.createElement('div');
        uploadButtonParent.classList.add('image-list-upload-button-parent');
        const uploadButton = document.createElement('button');
        const errorDiv = document.createElement('div');
        errorDiv.classList.add('error-text');
        errorDiv.textContent = 'Please select image transition and duration (integer)';
        uploadButton.classList.add('image-list-upload-button');
        uploadButton.textContent = 'Upload';

        if (file !== null) {
            transitionDropdown.addEventListener('change', function () {
                if (formData.has('transition')) {
                    formData.set('transition', transitionDropdown.value);
                } else {
                    formData.append('transition', transitionDropdown.value);
                }
                if (transitionDropdown.value == '') {
                    formData.delete('transition');
                }
            });

            durationInput.addEventListener('change', function () {
                const durationValue = durationInput.value;
                // Check if duration contains a point "."
                if (durationValue.includes('.')) {
                    showError(errorDiv.textContent);
                    return;
                }

                if (formData.has('duration')) {
                    formData.set('duration', durationValue);
                } else {
                    formData.append('duration', durationValue);
                }
                if (durationValue == '') {
                    formData.delete('duration');
                }
            });
        }
        if (uploadButtonParent.contains(errorDiv)) {
            uploadButtonParent.removeChild(errorDiv);
        }
        if (file != null) {
            uploadButtonParent.appendChild(uploadButton);
            imgContainer.appendChild(uploadButtonParent);
            uploadButton.addEventListener('click', function () {
                if (formData.has('transition') && formData.has('duration') && formData.get('uploaded') === 'false' && !durationInput.value.includes('.')) {
                    formData.set('uploaded', true);
                    fetch('/upload_images', {
                        method: 'POST',
                        body: formData
                    })
                        .then(response => response.json())
                        .then(data => {
                            img.src = data['image_url'];
                            uploadButtonParent.removeChild(uploadButton);
                            imgContainer.removeChild(uploadButtonParent);
                        })
                        .catch(error => {
                            console.error('Error uploading the image: ', error);
                        });
                    transitionDropdown.innerHTML = "<option value=''>" + formData.get('transition') + "</option>";
                    transitionDropdown.disabled = true;
                    durationInput.innerHTML = formData.get('duration') + " seconds";
                    durationInput.disabled = true;
                    if (uploadButtonParent.contains(errorDiv)) {
                        uploadButtonParent.removeChild(errorDiv);
                    }
                } else {
                    showError(errorDiv.textContent);
                }
            });
        } else {
            transitionDropdown.disabled = true;
            transitionDropdown.value = transition_value;
            durationInput.disabled = true;
            durationInput.value = duration_value;
        }

        function showError(message) {
            errorDiv.textContent = message;
            if (!uploadButtonParent.contains(errorDiv)) {
                uploadButtonParent.appendChild(errorDiv);
            }
        }
    }

    function getAllImages() {
        fetch('/get_images', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => {
                const image_datas = data['image_data'];
                for (const image_data of image_datas) {
                    renderImages(image_data[0], image_data[1], image_data[2], image_data[3], image_data[4], null);
                }
            })
            .catch(error => {
                console.error('Error fetching user ID:', error);
            });
    }

    getAllImages();

    // Add event listener to the search button
    searchButton.addEventListener('click', function () {
        const imageList = document.getElementById('imageList');
        const images = imageList.getElementsByTagName('div');
        for (var i = 0; i < images.length; i++) {
            images[i].style.display = 'none';
        }
        const searchInput = document.querySelector('.input');
        const inputValue = searchInput.value;
        fetch('/search_images', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input_value: inputValue })
        })
            .then(response => response.json())
            .then(data => {
                const image_datas = data['image_data'];
                for (const image_data of image_datas) {
                    renderImages(image_data[0], image_data[1], image_data[2], image_data[3], image_data[4], null);
                }
            })
            .catch(error => {
                console.error('Error fetching user ID:', error);
            });

    });

    function fetchUserIdAndDisplayGreeting() {
        fetch('/api/GetUserId', { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const userId = data.user_id;
                    const userGreeting = document.getElementById('userGreeting');
                    userGreeting.textContent = `Hello, ${userId}`;
                } else {
                    console.error('Failed to fetch user ID:', data.message);
                }
            })
            .catch(error => {
                console.error('Error fetching user ID:', error);
            });
    }

    fetchUserIdAndDisplayGreeting();

    let totalImages = 0;

    uploadArea.addEventListener('dragover', function (event) {
        event.preventDefault();
    });

    uploadArea.addEventListener('drop', function (event) {
        event.preventDefault();
        const files = event.dataTransfer.files;
        handleFiles(files);
    });

    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', function (event) {
        event.preventDefault();
        const files = fileInput.files;
        handleFiles(files);
    });

    function handleFiles(files) {
        const supportedFormats = ['jpg', 'jpeg', 'png', 'gif'];
        const validFiles = Array.from(files).filter(file => {
            const extension = file.name.split('.').pop().toLowerCase();
            return supportedFormats.includes(extension);
        });

        if (validFiles.length !== files.length) {
            alert('Only JPG, JPEG, PNG, and GIF formats are allowed.');
        }

        totalImages += validFiles.length;
        for (const file of validFiles) {
            renderImages(null, null, null, null, null, file);
        }
        fileInput.value = null;
    }

    function fetchMusicOptions() {
        fetch('/api/GetMusicOptions', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const musicOptions = data.music_options;
                renderMusicOptions(musicOptions);
            })
            .catch(error => {
                console.error('Error fetching music options:', error);
            });
    }

    let musicItemIdCounter = 0;

    function renderMusic(is_previous_file, duration, musicFile, musicId, options) {
        const musicItem = document.createElement('div');
        const musicItemId = `music-item-${musicItemIdCounter}-${musicId}`; // Generate unique ID
        musicItem.id = musicItemId;

        musicItem.classList.add('music-item');

        const musicInfo = document.createElement('div');
        musicInfo.classList.add('music-info');

        const removeButton = document.createElement('button');
        removeButton.classList.add('remove-button');
        removeButton.textContent = '✕';
        removeButton.addEventListener('click', function () {
            const musicItemId = musicItem.id;
            fetch(`/api/removeMusicItem?id=${musicItemId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
                .then(response => response.json())
                .then(data => console.log('Response from server:', data))
                .catch(error => console.error('Error:', error));

            musicItem.remove();
        });

        const durationInput = document.createElement('input');
        durationInput.type = 'number';
        durationInput.classList.add('duration-input');
        durationInput.placeholder = 'Duration (in seconds)';
        if (duration !== null) {
            durationInput.value = duration;
            durationInput.disabled = true;
        }

        const musicSelect = document.createElement('select');
        musicSelect.classList.add('music-dropdown');
        const defaultOption = document.createElement('option');
        defaultOption.textContent = musicFile;
        musicSelect.appendChild(defaultOption);
        if (options !== null) {
            options.forEach(item => {
                const optionElement = document.createElement('option');
                optionElement.textContent = item;
                musicSelect.appendChild(optionElement);
            });
        }
        if (is_previous_file === true) {
            musicSelect.disabled = true;
        }
        const uploadButtonParent = document.createElement('div');
        uploadButtonParent.classList.add('image-list-upload-button-parent');
        const uploadButton = document.createElement('button');
        uploadButton.classList.add('image-list-upload-button');
        let uploadOccurred = false;
        if (is_previous_file === false) {
            uploadButton.classList.add('upload-button');
            uploadButton.textContent = 'Upload';

            uploadButton.addEventListener('click', function () {
                if (uploadOccurred) {
                    return; // Exit if upload has already occurred
                }

                const selectedMusic = musicSelect.options[musicSelect.selectedIndex].textContent;
                const duration = durationInput.value;

                if (selectedMusic.trim() === 'Choose a music' || duration.trim() === '') {
                    showError("Choose music and duration");
                } else if (duration.includes('.')) {
                    showError("Only integer values");
                } else {
                    clearError(); // Clear any existing error message

                    musicSelect.disabled = true;
                    durationInput.disabled = true;
                    musicInfo.removeChild(uploadButtonParent);
                    uploadOccurred = true;
                    const data = {
                        id: musicItemId,
                        selectedMusic: selectedMusic,
                        duration: duration
                    };
                    fetch('/api/uploadMusicInfo', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    })
                        .then(response => response.json())
                        .then(data => console.log('Response from server:', data))
                        .catch(error => console.error('Error:', error));
                }
            });
        }

        function showError(message) {
            let errorText = musicItem.querySelector('.error-text');
            if (!errorText) {
                errorText = document.createElement('div');
                errorText.classList.add('error-text');
                musicItem.appendChild(errorText);
            }
            errorText.textContent = message;
            errorText.style.color = 'red';
        }

        function clearError() {
            const errorText = musicItem.querySelector('.error-text');
            if (errorText) {
                errorText.remove();
            }
        }

        musicInfo.appendChild(musicSelect);
        musicInfo.appendChild(durationInput);
        if (is_previous_file === false) {
            uploadButtonParent.appendChild(uploadButton);
            musicInfo.appendChild(uploadButtonParent);
        }
        musicItem.appendChild(musicInfo);
        musicItem.appendChild(removeButton);
        musicList.appendChild(musicItem);
    }

    function fetchMusic() {
        fetch('/get_music_data', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const music_data = data['music_data'];
                for (let i = 0; i < music_data.length; i++) {
                    const music = music_data[i];
                    const timestamp = music[1];
                    const duration = music[2];
                    const filename = music[3];
                    renderMusic(true, duration, filename, timestamp, null);
                }
            })
            .catch(error => {
                console.error('Error fetching music data:', error);
            });
    }
    fetchMusic();
    // Function to render music options
    function renderMusicOptions(options, durations) {
        if (!Number.isInteger(durations)) {
            durations = null;
        }
        const timestamp = new Date().getTime(); // Get current timestamp
        renderMusic(false, durations, 'Choose a music', timestamp, options)
    }
    // Fetch music options from Flask backend
    function fetchMusicOptions() {
        fetch('/api/GetMusicOptions', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const musicOptions = data.music_options;
                renderMusicOptions(musicOptions);
            })
            .catch(error => {
                console.error('Error fetching music options:', error);
            });
    }


    // Call fetchMusicOptions when the AddMusic button is clicked
    const addMusicButton = document.getElementById('AddMusic');
    addMusicButton.addEventListener('click', function () {
        fetchMusicOptions();
    });

    const videoPreview = document.getElementById('videoPreview');
    const playBtn = document.getElementById('playBtn');
    const rewindBtn = document.getElementById('rewindBtn');

    playBtn.addEventListener('click', function () {
        if (videoPreview.paused) {
            videoPreview.play();
        } else {
            videoPreview.pause();
        }
    });

    rewindBtn.addEventListener('click', function () {
        videoPreview.currentTime -= 5;
    });
    videoPreview.src = "/output.mp4";

    logoutButtonId.addEventListener('click', function (event) {
        event.preventDefault();
        fetch('/LogoutUser', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                if (response.ok) {
                    window.location.href = 'index';
                } else {
                    throw new Error('Network response was not ok.');
                }
            })
            .catch(error => console.error(error));
    });

    function deleteImage(image_source) {
        fetch(`/api/deleteImage/${image_source}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {

            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
            });
    }
    document.getElementById("create-video").addEventListener("click", function() {
        document.getElementById("createdvideo").style.display = "block";
        document.getElementById('loading-animation').style.display = 'block';
        // Send selected values to Flask route
        let resolution = document.getElementById("resolution").value;
        let fps = document.getElementById("fps").value;
        let outputFormat = document.getElementById("outputFormat").value;
        // Assuming you have a function named 'sendToFlask' to send data to Flask
        makevideo(resolution, fps, outputFormat);
    });
    
    // Function to send data to Flask route

    let videoUrl = '';
    let downloadOutputFormat = '';
    function makevideo(resolution, fps, outputFormat) {
        console.log(outputFormat,resolution,fps);
        fetch('/video_route', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                resolution: resolution,
                fps: fps,
                outputFormat: outputFormat
            })
        })
        .then(response => response.json())  
        .then(data => {
            fetch('/output.mp4', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    outputFormat: outputFormat
                })
            })
            .then(response => response.blob()) // Get response as Blob
            .then(blob => {
                // Create a blob URL from the response
                videoUrl = URL.createObjectURL(blob);
    
                // Set the video source
                videoPreview.src = videoUrl;
                videoPreview.load(); // Load the video
                document.getElementById('loading-animation').style.display = 'none';
            })
            .catch(error => {
                console.error('Error fetching video:', error);
            });
        })
        .catch(error => console.error('Error:', error));
        downloadOutputFormat = outputFormat;
    }
    const downloadButton = document.getElementById('downloadBtn');
    downloadButton.addEventListener('click', function() {
        // Create an anchor element
        var a = document.createElement('a');
        a.href = videoUrl;
        a.download = 'output.' + downloadOutputFormat; // Set the filename
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
    
});
