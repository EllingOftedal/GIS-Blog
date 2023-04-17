import csv
from collections import Counter

def summarize_csv(input_csv_file, output_csv_file, column_name):
    # Open and read csv, counting 'name'
    name_counter = Counter()
    lat_lng_dict = {}
    with open(input_csv_file, 'r') as infile:
        reader = csv.DictReader(infile)
        for row in reader:
            name = row[column_name]
            name_counter[name] += 1
            lat_lng_dict[name] = (row['latitude'], row['longitude'])

    # Write the summarized data to the output CSV file
    with open(output_csv_file, 'w', newline='') as outfile:
        writer = csv.writer(outfile)
        writer.writerow([column_name, 'latitude', 'longitude', 'count'])

        for name, count in name_counter.most_common():
            lat, lng = lat_lng_dict[name]
            writer.writerow([name, lat, lng, count])

# Use the function for the two different CSV files
summarize_csv('scripts/nrk/global/results/countries_output.csv', 'scripts/nrk/global/results/countries_summarized.csv', 'name')
summarize_csv('scripts/nrk/inland/results/innland_output.csv', 'scripts/nrk/inland/results/innland_summarized.csv', 'name')
