# test_run.py — Executes PMYPScraper and prints the first 2 results
from pmyp_scraper import PMYPScraper

def main():
    print("--- Testing PMYP Scraper ---")
    scraper = PMYPScraper()
    results = scraper.scrape()

    print(f"\nTotal Items Scraped: {len(results)}\n")

    for idx, item in enumerate(results[:2], 1):
        print(f"--- Item {idx} ---")
        print(f"Title:        {item['title']}")
        print(f"Official URL: {item['official_url']}")
        print(f"Deadline:     {item['deadline']}")
        print(f"Description:  {item['description'][:120]}...")
        print("-" * 30)

if __name__ == "__main__":
    main()