import csv
from collections import Counter

def summarize_csv(input_csv_file, output_csv_file, column_name):
    # Open and read csv, counting 'Name'
    name_counter = Counter()
    with open(input_csv_file, 'r') as infile:
        reader = csv.DictReader(infile)
        for row in reader:
            name = row[column_name]
            name_counter[name] += 1

    # Write the summarized data to the output CSV file
    with open(output_csv_file, 'w', newline='') as outfile:
        writer = csv.writer(outfile)
        writer.writerow([column_name, 'count'])

        for name, count in name_counter.most_common():
            writer.writerow([name, count])

# Use the function for the two different CSV files
summarize_csv('scripts/nrk/global/results/countries_output.csv', 'scripts/nrk/global/results/countries_summarized.csv', 'name')
summarize_csv('scripts/nrk/inland/results/innland_output.csv', 'scripts/nrk/inland/results/innland_summarized.csv', 'name')
