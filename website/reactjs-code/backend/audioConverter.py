import sys
import json

# Access command-line arguments
video_urls = sys.argv[1:]
audio_urls = {}

# Process video URLs
for url in video_urls:
    print(f'Processing video URL: {url}')
    # Add your video processing logic here
    from moviepy.editor import VideoFileClip

    def convert_video_to_audio(input_path, output_path):
      video = VideoFileClip(input_path)
      audio = video.audio
      audio.write_audiofile(output_path)
      audio.close()
    
    audio_path = convert_video_to_audio(url)
    audio_urls[url] = audio_path

audio_urls_json = json.dumps(audio_urls)