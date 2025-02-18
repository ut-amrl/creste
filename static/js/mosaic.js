document.addEventListener('DOMContentLoaded', () => {
    const rows = document.querySelectorAll('.video-row');
    let globalDelay = 0;  // Accumulate delays across all videos

    rows.forEach((row, rowIndex) => {
        const videos = Array.from(row.querySelectorAll('video'));

        // Reverse order for odd rows (right-to-left)
        if (rowIndex % 2 !== 0) {
            videos.reverse();
        }

        videos.forEach((video, videoIndex) => {
            // Completely hide video until it's loaded
            video.style.display = 'none';

            // Ensure correct size and visibility once metadata is loaded
            video.addEventListener('loadedmetadata', () => {
                video.style.display = 'block';
            });

            // Once video data is fully loaded, apply staggered delay for visibility
            video.addEventListener('loadeddata', () => {
                setTimeout(() => {
                    video.style.opacity = 1;
                    video.style.visibility = 'visible';
                    video.play().catch(err => console.warn('Video playback failed:', err));
                }, globalDelay);
            });

            // If the video is already ready, skip waiting for events
            if (video.readyState >= 2) {
                video.style.display = 'block';
                setTimeout(() => {
                    video.style.opacity = 1;
                    video.style.visibility = 'visible';
                    video.play().catch(err => console.warn('Video playback failed:', err));
                }, globalDelay);
            }

            // Increment delay between videos
            globalDelay += 50;  // 1 second delay between each video
        });
    });
});
