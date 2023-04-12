import os
import requests
import csv
import re
from bs4 import BeautifulSoup
from datetime import datetime
from tqdm import tqdm
import concurrent.futures
import ahocorasick
import time

visited_articles_file = r"scripts\nrk\global\visited_articles_country.csv"
locations_filter_file = r"scripts\nrk\global\country_filter.csv"
locations_output_file = r"scripts\nrk\global\countries_output.csv"


def read_visited_articles():
    visited_articles = set()
    if os.path.exists(visited_articles_file):
        with open(visited_articles_file, "r", encoding="utf-8") as csvfile:
            reader = csv.reader(csvfile)
            next(reader) 
            for row in reader:
                visited_articles.add(row[0])
    return visited_articles


def build_automaton(locations_data):
    A = ahocorasick.Automaton()
    for location, data in locations_data.items():
        A.add_word(location, data)
    A.make_automaton()
    return A


def scrape_article(url, visited_articles, automaton):
    matches = []
    time_published = ""
    if url not in visited_articles:
        response = requests.get(url)
        soup = BeautifulSoup(response.content, "html.parser")
        text = soup.get_text()

        for _, data in automaton.iter(text):
            time.sleep(1.5)
            matches.append(data)

        visited_articles.add(url)
        with open(visited_articles_file, "a+", newline="", encoding="utf-8") as csvfile_visited:
            writer_visited = csv.writer(csvfile_visited)
            writer_visited.writerow([url, datetime.now()])

        # Extract the publication date/time from the article page
        time_published_element = soup.find("time", class_="datetime-absolute datePublished")
        if time_published_element:
            time_published = datetime.strptime(time_published_element["datetime"], "%Y-%m-%dT%H:%M:%S%z").strftime(
                "%H:%M-%m/%d-%Y")
        else:
            time_published = "Unknown"

    return url, matches, time_published



def main():
    visited_articles = read_visited_articles()

    with open(locations_filter_file, "r", encoding="utf-8") as csvfile:
        locations_data = {row["Name"]: row for row in csv.DictReader(csvfile)}

    automaton = build_automaton(locations_data)

    response = requests.get("https://www.nrk.no")
    soup = BeautifulSoup(response.content, "html.parser")
    links = soup.find_all("a")
    article_urls = [link["href"] for link in links if link.get("href") and link["href"].startswith("https://www.nrk.no/")]

    with concurrent.futures.ThreadPoolExecutor() as executor:
        results = list(tqdm(executor.map(scrape_article, article_urls, [visited_articles] * len(article_urls), [automaton] * len(article_urls)), total=len(article_urls)))

    if not os.path.exists(locations_output_file):
        with open(locations_output_file, "w", newline="", encoding="utf-8") as csvfile_output:
            writer_output = csv.writer(csvfile_output)
            writer_output.writerow(["Name", "Latitude", "Longitude", "Population", "Time_Date", "URL"])

    with open(locations_output_file, "a", newline="", encoding="utf-8") as csvfile_output:
        writer_output = csv.writer(csvfile_output)
        for url, matches, time_published in results:
            if matches:
                for data in matches:
                    writer_output.writerow(
                        [data['Name'], data['Latitude'], data['Longitude'], data['Population'], time_published, url])


if __name__ == "__main__":
    main()



