import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import logging
from typing import List, Dict
from urllib.parse import urljoin

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


class PMYPWebsiteScraper:
    """Scrape scholarship data from PMYP website"""
    
    def __init__(self, output_file: str = 'pmyp_scholarships.json'):
        self.output_file = output_file
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def parse_scholarship_cards(self, html_content: str, base_url: str) -> List[Dict]:
        """Parse scholarship cards from HTML"""
        
        soup = BeautifulSoup(html_content, 'html.parser')
        scholarships = []
        
        # Find all job_card divs (the actual card container)
        card_wrappers = soup.find_all('div', class_='job_card')
        logger.info(f"🔍 Found {len(card_wrappers)} job_card elements")
        
        for idx, card in enumerate(card_wrappers):
            try:
                scholarship = self._extract_from_card(card, base_url, idx)
                
                if scholarship and scholarship.get('title'):
                    scholarships.append(scholarship)
                    logger.info(f"✅ Card {idx}: {scholarship['title'][:60]}")
                else:
                    logger.debug(f"⚠️  Card {idx}: Incomplete data")
                    
            except Exception as e:
                logger.error(f"❌ Error parsing card {idx}: {str(e)}")
                continue
        
        logger.info(f"\n📊 Total scholarships extracted: {len(scholarships)}\n")
        return scholarships
    
    def _extract_from_card(self, card, base_url: str, idx: int = 0) -> Dict:
        """Extract scholarship data from card element"""
        
        scholarship = {}
        
        # 1. TITLE: Extract from <div class="--designation">
        logger.debug(f"Card {idx}: Extracting title...")
        designation_div = card.find('div', class_='--designation')
        
        if designation_div:
            title_text = designation_div.get_text(strip=True)
            if title_text and len(title_text) > 3:
                scholarship['title'] = title_text
                logger.debug(f"  ✓ Title: {title_text[:60]}")
        
        # 2. LOCATION: Extract from <div class="--location">
        location_div = card.find('div', class_='--location')
        if location_div:
            location_text = location_div.get_text(strip=True)
            if location_text:
                scholarship['location'] = location_text
                logger.debug(f"  ✓ Location: {location_text}")
        
        # 3. DESCRIPTION: Extract from <div class="--jd">
        logger.debug(f"Card {idx}: Extracting description...")
        jd_div = card.find('div', class_='--jd')
        
        if jd_div:
            # Get all text and remove "Description:" prefix
            full_text = jd_div.get_text(strip=True)
            desc_text = full_text.replace('Description:', '').strip()
            
            if desc_text and len(desc_text) > 10:
                scholarship['description'] = desc_text[:2000]  # Limit to 2000 chars
                logger.debug(f"  ✓ Description: {desc_text[:60]}")
        
        # 4. DATES: Extract from <span> tags
        # First span is date posted, second span is deadline/closing date
        logger.debug(f"Card {idx}: Extracting dates...")
        span_tags = card.find_all('span')
        
        if len(span_tags) >= 1:
            posted_date = span_tags[0].get_text(strip=True)
            if posted_date:
                scholarship['posted_date'] = posted_date
                logger.debug(f"  ✓ Posted Date: {posted_date}")
        
        if len(span_tags) >= 2:
            closing_date = span_tags[1].get_text(strip=True)
            if closing_date:
                scholarship['closing_date'] = closing_date
                logger.debug(f"  ✓ Closing Date: {closing_date}")
        
        # 5. ICON: Extract from <img> tag
        logger.debug(f"Card {idx}: Extracting icon...")
        img_elem = card.find('img')
        
        if img_elem and img_elem.get('src'):
            icon_url = img_elem.get('src')
            scholarship['icon'] = urljoin(base_url, icon_url)
            logger.debug(f"  ✓ Icon: {icon_url}")
        
        # 6. LINK: Extract from <a class="btn"> tag
        logger.debug(f"Card {idx}: Extracting link...")
        link_elem = card.find('a', class_='btn')
        
        if link_elem and link_elem.get('href'):
            link_url = link_elem.get('href')
            scholarship['link'] = link_url
            logger.debug(f"  ✓ Link: {link_url}")
        
        # Add metadata
        scholarship['source'] = 'PMYP Website'
        scholarship['country'] = 'Pakistan'
        scholarship['currency'] = 'PKR'
        scholarship['scraped_at'] = datetime.now().isoformat()
        
        return scholarship
    
    def parse_from_html_file(self, html_file: str) -> List[Dict]:
        """Parse scholarships from local HTML file"""
        try:
            logger.info(f"📂 Reading HTML file: {html_file}")
            with open(html_file, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            logger.info(f"✅ File read successfully. Size: {len(html_content)} bytes")
            return self.parse_scholarship_cards(html_content, 'https://www.pmsyouthprogram.gov.pk')
        except Exception as e:
            logger.error(f"❌ Error reading HTML file: {str(e)}")
            return []
    
    def enrich_scholarship(self, scholarship: Dict, index: int) -> Dict:
        """Enrich scholarship with ID"""
        
        enriched = {
            'id': index,
            'title': scholarship.get('title'),
            'description': scholarship.get('description'),
            'location': scholarship.get('location'),
            'posted_date': scholarship.get('posted_date'),
            'closing_date': scholarship.get('closing_date'),
            'link': scholarship.get('link'),
            'icon': scholarship.get('icon'),
            'country': scholarship.get('country'),
            'currency': scholarship.get('currency'),
            'source': scholarship.get('source'),
            'scraped_at': scholarship.get('scraped_at')
        }
        
        return {k: v for k, v in enriched.items() if v is not None}
    
    def save_to_json(self, scholarships: List[Dict]) -> bool:
        """Save scholarships to JSON file"""
        try:
            output = {
                'metadata': {
                    'total_scholarships': len(scholarships),
                    'last_updated': datetime.now().isoformat(),
                    'source': 'PMYP Website',
                    'status': 'scraped'
                },
                'scholarships': scholarships
            }
            
            with open(self.output_file, 'w', encoding='utf-8') as f:
                json.dump(output, f, indent=2, ensure_ascii=False)
            
            logger.info(f"✅ Saved {len(scholarships)} scholarships to {self.output_file}")
            return True
        except Exception as e:
            logger.error(f"❌ Error saving JSON: {str(e)}")
            return False
    
    def scrape_from_file(self, html_file: str) -> Dict:
        """Scrape from local HTML file"""
        
        logger.info("🚀 Starting file scraper...\n")
        
        scholarships = self.parse_from_html_file(html_file)
        
        if not scholarships:
            logger.warning("⚠️  No scholarships found in HTML file")
            return {'status': 'no_data', 'count': 0}
        
        enriched_scholarships = [self.enrich_scholarship(s, i) for i, s in enumerate(scholarships, 1)]
        
        if self.save_to_json(enriched_scholarships):
            return {
                'status': 'success',
                'count': len(enriched_scholarships),
                'file': self.output_file
            }
        else:
            return {'status': 'failed'}


if __name__ == "__main__":
    scraper = PMYPWebsiteScraper('pmyp_scholarships.json')
    result = scraper.scrape_from_file('debug_pmyp_page.html')
    
    print(f"\n{'='*70}")
    print(f"📊 FINAL RESULT: {json.dumps(result, indent=2)}")
    print(f"{'='*70}")
    
    # Display sample results
    if result['status'] == 'success':
        with open('pmyp_scholarships.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            print(f"\n✅ Saved {len(data['scholarships'])} scholarships!\n")
            
            for i, scholarship in enumerate(data['scholarships'][:3], 1):
                print(f"\n{i}. TITLE: {scholarship.get('title')}")
                print(f"   Location: {scholarship.get('location')}")
                print(f"   Posted: {scholarship.get('posted_date')}")
                print(f"   Closing: {scholarship.get('closing_date')}")
                print(f"   Description: {scholarship.get('description', 'N/A')[:100]}...")
                print(f"   Link: {scholarship.get('link')}")