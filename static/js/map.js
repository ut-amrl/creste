document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.querySelector('.map-container');
    const mapImage = document.querySelector('.map-image');
    const videoContainer = document.getElementById('videoContent');
    const previewPopup = document.getElementById('previewPopup');

    // We'll store the marker elements in an array for easy reference
    let markerButtons = [];

    function updateMarkerPositions() {
        // Recompute the scale each time, based on the displayed image size
        const scaleX = mapImage.clientWidth / mapImage.naturalWidth;
        const scaleY = mapImage.clientHeight / mapImage.naturalHeight;

        // For each marker, reposition according to scale
        document.querySelectorAll('.map-button').forEach(btn => {
            const origX = parseFloat(btn.dataset.origX);
            const origY = parseFloat(btn.dataset.origY);

            const scaledX = origX * scaleX;
            const scaledY = origY * scaleY;

            btn.style.left = `${scaledX}px`;
            btn.style.top = `${scaledY}px`;
        });
    }

    function processMarkers() {
        // 1) Fetch the markers file
        fetch('./static/data/markers.txt')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load markers file');
                }
                return response.text();
            })
            .then(text => {
                const lines = text.split('\n');
                lines.forEach((line, index) => {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed.startsWith('#')) return;

                    // e.g. x,y,videoURL,shortDescription,successOrFailure
                    const parts = trimmed.split(',').map(p => p.trim());
                    if (parts.length < 5) return;

                    const origX = parseInt(parts[0], 10);
                    const origY = parseInt(parts[1], 10);
                    const videoURL = parts[2];
                    const shortDescription = parts[3];
                    const successOrFailure = parts[4].toLowerCase(); // "success" or "failure"

                    // 2) Create the marker button
                    const btn = document.createElement('div');
                    btn.classList.add('map-button');

                    // Store original coords & data in dataset
                    btn.dataset.origX = origX;
                    btn.dataset.origY = origY;
                    btn.dataset.videoUrl = videoURL;
                    btn.dataset.description = shortDescription;
                    btn.dataset.status = successOrFailure;
                    // Store index in dataset
                    btn.dataset.markerIndex = index;

                    // Display the index on the circle
                    btn.style.display = 'flex';
                    btn.style.alignItems = 'center';
                    btn.style.justifyContent = 'center';
                    btn.style.color = '#fff';
                    btn.style.fontWeight = 'bold';
                    btn.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';

                    btn.textContent = (index + 1).toString(); // Marker number

                    // 3) Color the marker by success/failure
                    if (successOrFailure === 'success') {
                        btn.style.background = 'rgba(0, 255, 0, 0.8)'; // green
                    } else if (successOrFailure === 'failure') {
                        btn.style.background = 'rgba(255, 0, 0, 0.8)'; // red
                    } else {
                        // default or unknown status
                        btn.style.background = 'rgba(0,0,255,0.8)';
                    }

                    // 4) Hover events → small preview video
                    btn.addEventListener('mouseenter', (e) => {
                        previewPopup.innerHTML = '';
                        previewPopup.style.display = 'block';

                        const container = document.createElement('div');
                        container.style.position = 'relative';
                        previewPopup.appendChild(container);

                        const previewVideo = document.createElement('video');
                        previewVideo.src = videoURL;
                        previewVideo.autoplay = true;
                        previewVideo.muted = true;
                        previewVideo.loop = true;
                        previewVideo.playsInline = true;
                        previewVideo.style.width = '200px';
                        container.appendChild(previewVideo);

                        // Overlay text
                        const overlayText = document.createElement('div');
                        overlayText.innerText = shortDescription;
                        overlayText.style.position = 'absolute';
                        overlayText.style.top = '5px';
                        overlayText.style.left = '5px';
                        overlayText.style.color = '#fff';
                        overlayText.style.fontWeight = 'bold';
                        overlayText.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
                        container.appendChild(overlayText);
                    });

                    btn.addEventListener('mousemove', (e) => {
                        const offsetX = 15;
                        const offsetY = 15;
                        let leftPos = e.clientX + offsetX;
                        let topPos = e.clientY + offsetY;

                        const popupRect = previewPopup.getBoundingClientRect();
                        const windowWidth = window.innerWidth;
                        const windowHeight = window.innerHeight;

                        if (leftPos + popupRect.width > windowWidth) {
                            leftPos = e.clientX - popupRect.width - offsetX;
                        }
                        if (topPos + popupRect.height > windowHeight) {
                            topPos = e.clientY - popupRect.height - offsetY;
                        }

                        previewPopup.style.left = `${leftPos}px`;
                        previewPopup.style.top = `${topPos}px`;
                    });

                    btn.addEventListener('mouseleave', () => {
                        previewPopup.style.display = 'none';
                        previewPopup.innerHTML = '';
                    });

                    // 5) Click → big video in right container
                    btn.addEventListener('click', () => {
                        showVideoInContainer(videoURL, index);
                    });

                    // 6) Append marker to map
                    mapContainer.appendChild(btn);
                    markerButtons.push(btn);
                });

                // 7) Position all markers once after creation
                updateMarkerPositions();

                // 8) Randomly preselect one marker’s video
                if (markerButtons.length > 0) {
                    const randomIndex = Math.floor(Math.random() * markerButtons.length);
                    const randomMarker = markerButtons[randomIndex];
                    const randomVideoUrl = randomMarker.dataset.videoUrl;
                    showVideoInContainer(randomVideoUrl, randomIndex, true);
                }
            })
            .catch(err => {
                console.error('Error loading markers:', err);
            });
    }

    // Function to show the video in the right container, with overlay text showing the marker index
    function showVideoInContainer(videoURL, markerIndex, isInitialLoad = false) {
        videoContainer.innerHTML = '';

        const expandedContainer = document.createElement('div');
        expandedContainer.style.position = 'relative';
        expandedContainer.style.width = '100%';
        expandedContainer.style.height = 'auto';
        videoContainer.appendChild(expandedContainer);

        const videoEl = document.createElement('video');
        videoEl.src = videoURL;
        videoEl.controls = true;
        videoEl.loop = true;
        videoEl.autoplay = true;
        videoEl.playsInline = true;
        videoEl.style.width = '100%';
        videoEl.style.height = 'auto';
        expandedContainer.appendChild(videoEl);

        if (isInitialLoad) {
            videoEl.muted = true; // Ensure autoplay works
        }
        expandedContainer.appendChild(videoEl);

        // Overlay text with the marker number
        const markerNumberOverlay = document.createElement('div');
        markerNumberOverlay.innerText = `Location #${markerIndex + 1}`;
        markerNumberOverlay.style.fontSize = '1.0rem';
        markerNumberOverlay.style.position = 'absolute';
        markerNumberOverlay.style.top = '10px';
        markerNumberOverlay.style.left = '10px';
        markerNumberOverlay.style.color = '#fff';
        markerNumberOverlay.style.fontWeight = 'bold';
        markerNumberOverlay.style.textShadow = '1px 1px 3px rgba(0,0,0,0.8)';
        expandedContainer.appendChild(markerNumberOverlay);

        setTimeout(() => {
            videoEl.play().catch(err => console.log("Autoplay prevented: ", err));
        }, 500);
    }

    // Reposition markers on window resize
    window.addEventListener('resize', () => {
        updateMarkerPositions();
    });

    if (mapImage.complete) {
        processMarkers();
    } else {
        mapImage.addEventListener('load', processMarkers);
    }
});
