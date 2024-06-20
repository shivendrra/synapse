from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

import os
current_directory = os.path.dirname(os.path.abspath(__file__))
os.chdir(current_directory)

from dotenv import load_dotenv
load_dotenv()
api_key = os.getenv('yt_key')
youtube = build('youtube', 'v3', developerKey=api_key)

import json

def convert_to_json(out_dict):
  with open("./output_urls.json", "w") as outfile:
    json.dump(out_dict, outfile)
    print("written in the json file")

def build_json(video_title, video_url, thumbnail):
  main_prop = {}
  for i in range(len(video_url)):
    if i < len(video_title) and i < len(thumbnail):
      idx = f"output{i}"
      main_prop[idx] = {"title": video_title[i], "url": video_url[i], "thumbnail": thumbnail[i]}
    else:
      print("Some lists are shorter than others")
      continue
  return main_prop

def fetch_url(search_string):
  try:
    search_res = youtube.search().list(q=search_string, type='video', part='id,snippet', maxResults=50).execute()
    video_url = []
    video_title = []
    thumbnail = []
    for search_result in search_res.get('items', []):
      if search_result['id']['kind'] == 'youtube#video':
        video_url.append(f"https://www.youtube.com/watch?v={search_result['id']['videoId']}")
        video_title.append(search_result['snippet']['title'])
        thumbnail.append(search_result['snippet']['thumbnails']['high']['url'])
      else:
        print("there's some error in fetching the results")
      main_prop = build_json(video_title, video_url, thumbnail)
    
    convert_to_json(main_prop)

  except HttpError as err:
    print(f"An error occured while fetching results: {err}")

search_string = input(str("enter the string for searching: "))
fetch_url(search_string=search_string)