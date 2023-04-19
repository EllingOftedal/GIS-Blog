import os
import requests
import csv
import re
from bs4 import BeautifulSoup
from datetime import datetime
from tqdm import tqdm
import concurrent.futures

visited_articles_file = "scripts/nrk/inland/results/visited_articles_innland.csv"
locations_filter_file = "scripts/nrk/inland/innland_filter_unique.csv"
locations_output_file = "scripts/nrk/inland/results/innland_output.csv"

def read_visited_articles():
    visited_articles = set()
    header_exists = False
    if os.path.exists(visited_articles_file):
        with open(visited_articles_file, "r", encoding="utf-8") as csvfile:
            reader = csv.reader(csvfile)
            try:
                header_exists = next(reader) == ["url", "datetime"]
                for row in reader:
                    visited_articles.add(row[0])
            except StopIteration:
                pass
    if not header_exists:
        with open(visited_articles_file, "w", newline="", encoding="utf-8") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(["url", "datetime"])
    return visited_articles



def build_location_regex(locations_data):
    location_regexes = []
    for location in locations_data.keys():
        escaped_location = re.escape(location)
        regex = re.compile(r"(?<![^\W_])({})(?![^\W_])".format(escaped_location))
        location_regexes.append(regex)
    return location_regexes


def scrape_article(url, visited_articles, locations_data, location_regexes):
    excluded_classes = ["skin-border", "widget-title", "nrk-bottommenu-info"]
    matches = []
    time_published = ""
    if url not in visited_articles:
        response = requests.get(url)
        soup = BeautifulSoup(response.content, "html.parser")

        text = ""
        for tag in soup.find_all(True):
            if tag.name == "p":
                text += " " + tag.get_text()
            elif tag.name == "h1":
                text += " " + tag.get_text()

        for excluded_class in excluded_classes:
            if soup.find(class_=excluded_class):
                return url, [], ""

        for regex in location_regexes:
            match = regex.search(text)
            if match:
                location_name = match.group(1)
                if location_name in locations_data:
                    matches.append(locations_data[location_name])

        time_published_element = soup.find("time", class_="datetime-absolute datePublished")
        if time_published_element:
            time_published = datetime.strptime(time_published_element["datetime"], "%Y-%m-%dT%H:%M:%S%z").strftime(
                "%H:%M-%m/%d-%Y")
        else:
            time_published = "Unknown"

        visited_articles.add(url)
        with open(visited_articles_file, "a+", newline="", encoding="utf-8") as csvfile_visited:
            writer_visited = csv.writer(csvfile_visited)
            writer_visited.writerow([url, datetime.now()])

    return url, matches, time_published




def main():
    visited_articles = read_visited_articles()

    with open(locations_filter_file, "r", encoding="utf-8") as csvfile:
        locations_data = {row["name"]: row for row in csv.DictReader(csvfile)}

    location_regexes = build_location_regex(locations_data)

    response = requests.get("https://www.nrk.no")
    soup = BeautifulSoup(response.content, "html.parser")
    links = soup.find_all("a")
    article_urls = [link["href"] for link in links if link.get("href") and link["href"].startswith("https://www.nrk.no/")]

    with concurrent.futures.ThreadPoolExecutor() as executor:
        results = list(tqdm(executor.map(scrape_article, article_urls, [visited_articles] * len(article_urls), [locations_data] * len(article_urls), [location_regexes] * len(article_urls)), total=len(article_urls)))

    if not os.path.exists(locations_output_file):
        with open(locations_output_file, "w", newline="", encoding="utf-8") as csvfile_output:
            writer_output = csv.writer(csvfile_output)
            writer_output.writerow(["name", "latitude", "longitude", "type", "published", "gathered", "url"])

    with open(locations_output_file, "a", newline="", encoding="utf-8") as csvfile_output:
        writer_output = csv.writer(csvfile_output)
        for url, matches, time_published in results:
            if matches:
                for data in matches:
                    writer_output.writerow([data['name'], data['latitude'], data['longitude'], data['type'], time_published, datetime.now(), url])


if __name__ == "__main__":
    main()
