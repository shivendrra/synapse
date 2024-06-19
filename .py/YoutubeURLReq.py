import json
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# API key
API_KEY = 'AIzaSyBhbYzOh_B3snsiBlCEwI4DdUZbKJVHass'

# get the string to be searched
search_string = input("Enter the search string: ")

# YouTube API client
youtube = build('youtube', 'v3', developerKey=API_KEY)

try:
    # Calling the search.list method to retrieve search results
    search_response = youtube.search().list(
        q=search_string, type='video',
        part='id,snippet', maxResults=50
    ).execute()

    # recieving the video links from the search results
    video_url = []
    videoTitle = []
    thumbnails = []
    main_prop = {}
    for search_result in search_response.get('items', []):
        if search_result['id']['kind'] == 'youtube#video':
            video_link = f"https://www.youtube.com/watch?v={search_result['id']['videoId']}"
            video_title = search_result['snippet']['title']
            thumbnail_url = search_result['snippet']['thumbnails']['high']['url']
            videoTitle.append(video_title)
            video_url.append(video_link)
            thumbnails.append(thumbnail_url)
        else:
          print("there is some error in getting the output")
    
        for i in range(len(video_url)):
          if i < len(videoTitle) and i < len(thumbnails):
            vidID = f"output{i}"
            main_prop[vidID] = {"title": videoTitle[i], "url": video_url[i], "thumbnail": thumbnails[i]}
          else:
            print("Some lists are shorter than others")
    
    # Printing the video links
    if video_url:
      with open("./files/URLfile.json", "w") as outfile:
        json.dump(main_prop, outfile)
        print('written in the JSON file')
    else:
        print(f"No videos found related to '{search_string}'")

except HttpError as err:
    print(f"An error occurred: {err}")