import os
import requests
import csv
from bs4 import BeautifulSoup
from datetime import datetime
from tqdm import tqdm
import concurrent.futures

visited_articles_file = "scripts/nrk/global/results/visited_articles_country.csv"
locations_filter_file = r"scripts/nrk/global/country_filter.csv"
locations_output_file = "scripts/nrk/global/results/countries_output.csv"


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


def scrape_article(url, visited_articles, locations_data):
    matches = []
    time_published = ""
    if url not in visited_articles:
        response = requests.get(url)
        soup = BeautifulSoup(response.content, "html.parser")
        text = soup.get_text()

        for location, data in locations_data.items():
            if location in text:
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
        locations_data = {row["name"]: row for row in csv.DictReader(csvfile)}

    response = requests.get("https://www.nrk.no")
    soup = BeautifulSoup(response.content, "html.parser")
    links = soup.find_all("a")
    article_urls = [link["href"] for link in links if link.get("href") and link["href"].startswith("https://www.nrk.no/")]

    with concurrent.futures.ThreadPoolExecutor() as executor:
        results = list(tqdm(executor.map(scrape_article, article_urls, [visited_articles] * len(article_urls), [locations_data] * len(article_urls)), total=len(article_urls)))

    header_exists = False
    if os.path.exists(locations_output_file):
        with open(locations_output_file, "r", newline="", encoding="utf-8") as csvfile_output:
            reader = csv.reader(csvfile_output)
            try:
                header_exists = next(reader) == ["name", "latitude", "longitude", "population", "time_Date", "gathered_Date", "url"]
            except StopIteration:
                pass
    if not header_exists:
        with open(locations_output_file, "w", newline="", encoding="utf-8") as csvfile_output:
            writer_output = csv.writer(csvfile_output)
            writer_output.writerow(["name", "latitude", "longitude", "population", "time_Date", "gathered_Date", "url"])

    with open(locations_output_file, "a", newline="", encoding="utf-8") as csvfile_output:
        writer_output = csv.writer(csvfile_output)
        for url, matches, time_published in results:
            if matches:
                for data in matches:
                    writer_output.writerow(
                        [data['name'], data['latitude'], data['longitude'], data['population'], time_published, datetime.now(), url])


if __name__ == "__main__":
    main()


