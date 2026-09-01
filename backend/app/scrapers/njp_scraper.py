import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import logging
from typing import List, Dict
from urllib.parse import urljoin

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


class NJPWebsiteScraper:
    """Scrape job data from National Job Portal (NJP) website"""
    
    def __init__(self, output_file: str = 'njp_jobs.json'):
        self.output_file = output_file
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def parse_job_cards(self, html_content: str, base_url: str) -> List[Dict]:
        """Parse job cards from HTML"""
        
        soup = BeautifulSoup(html_content, 'html.parser')
        jobs = []
        
        # Find all job cards using Tailwind class
        card_wrappers = soup.find_all('div', class_='job-card')
        logger.info(f"🔍 Found {len(card_wrappers)} job-card elements")
        
        for idx, card in enumerate(card_wrappers):
            try:
                job = self._extract_from_card(card, base_url, idx)
                
                if job and job.get('title'):
                    jobs.append(job)
                    logger.info(f"✅ Card {idx}: {job['title'][:60]}")
                else:
                    logger.debug(f"⚠️  Card {idx}: Incomplete data")
                    
            except Exception as e:
                logger.error(f"❌ Error parsing card {idx}: {str(e)}")
                continue
        
        logger.info(f"\n📊 Total jobs extracted: {len(jobs)}\n")
        return jobs
    
    def _extract_from_card(self, card, base_url: str, idx: int = 0) -> Dict:
        """Extract job data from card element"""
        
        job = {}
        
        # 1. TITLE: Extract from <h2> tag
        logger.debug(f"Card {idx}: Extracting title...")
        h2_elem = card.find('h2')
        
        if h2_elem:
            title_text = h2_elem.get_text(strip=True)
            if title_text and len(title_text) > 3:
                job['title'] = title_text
                logger.debug(f"  ✓ Title: {title_text[:60]}")
        
        # 2. ORGANIZATION/COMPANY: Extract from <p> tag (by Organization)
        logger.debug(f"Card {idx}: Extracting organization...")
        p_elem = card.find('p')
        
        if p_elem:
            org_text = p_elem.get_text(strip=True)
            # Remove "by " prefix if exists
            org_text = org_text.replace('by ', '').strip()
            if org_text:
                job['organization'] = org_text
                logger.debug(f"  ✓ Organization: {org_text}")
        
        # 3. EXTRACT JOB DETAILS from spans
        logger.debug(f"Card {idx}: Extracting job details...")
        span_tags = card.find_all('span')
        
        job_type = None
        grade = None
        vacancy = None
        closing_date = None
        experience = None
        
        for span in span_tags:
            span_text = span.get_text(strip=True)
            
            # Job type (Contract, Permanent, etc.)
            if span_text in ['Contract', 'Permanent', 'Temporary']:
                job_type = span_text
            
            # Grade/Level (e.g., E-II, E-III)
            elif span_text.startswith('E-'):
                grade = span_text
            
            # Vacancies (number + "vacancy")
            elif 'vacancy' in span_text.lower():
                vacancy_match = span_text.split()[0]
                if vacancy_match.isdigit():
                    vacancy = int(vacancy_match)
            
            # Closing date (Expired On / Deadline)
            elif 'expired on' in span_text.lower() or 'deadline' in span_text.lower():
                closing_date = span_text
            
            # Experience
            elif 'experience:' in span_text.lower():
                # Get text after "Experience:"
                parts = span_text.split('Experience:')
                if len(parts) > 1:
                    experience = parts[1].strip()
        
        if job_type:
            job['job_type'] = job_type
            logger.debug(f"  ✓ Job Type: {job_type}")
        
        if grade:
            job['grade'] = grade
            logger.debug(f"  ✓ Grade: {grade}")
        
        if vacancy:
            job['vacancies'] = vacancy
            logger.debug(f"  ✓ Vacancies: {vacancy}")
        
        if closing_date:
            job['closing_date'] = closing_date
            logger.debug(f"  ✓ Closing Date: {closing_date}")
        
        if experience:
            job['experience'] = experience
            logger.debug(f"  ✓ Experience: {experience}")
        
        # 4. APPLY LINK: Extract from first <a> tag with href
        logger.debug(f"Card {idx}: Extracting link...")
        a_tags = card.find_all('a')
        
        for a in a_tags:
            href = a.get('href', '')
            if href and '/jobs/' in href:
                job['job_link'] = urljoin(base_url, href)
                logger.debug(f"  ✓ Job Link: {href}")
                break
        
        # 5. APPLY BUTTON LINK
        apply_link = None
        for a in a_tags:
            a_text = a.get_text(strip=True)
            href = a.get('href', '')
            if 'apply' in a_text.lower() and href:
                apply_link = urljoin(base_url, href)
                logger.debug(f"  ✓ Apply Link: {href}")
                break
        
        if apply_link:
            job['apply_link'] = apply_link
        
        # Add metadata
        job['source'] = 'National Job Portal (NJP)'
        job['country'] = 'Pakistan'
        job['website'] = 'https://www.njp.gov.pk'
        job['scraped_at'] = datetime.now().isoformat()
        
        return job
    
    def parse_from_html_file(self, html_file: str) -> List[Dict]:
        """Parse jobs from local HTML file"""
        try:
            logger.info(f"📂 Reading HTML file: {html_file}")
            with open(html_file, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            logger.info(f"✅ File read successfully. Size: {len(html_content)} bytes")
            return self.parse_job_cards(html_content, 'https://www.njp.gov.pk')
        except Exception as e:
            logger.error(f"❌ Error reading HTML file: {str(e)}")
            return []
    
    def enrich_job(self, job: Dict, index: int) -> Dict:
        """Enrich job with ID"""
        
        enriched = {
            'id': index,
            'title': job.get('title'),
            'organization': job.get('organization'),
            'job_type': job.get('job_type'),
            'grade': job.get('grade'),
            'vacancies': job.get('vacancies'),
            'experience': job.get('experience'),
            'closing_date': job.get('closing_date'),
            'job_link': job.get('job_link'),
            'apply_link': job.get('apply_link'),
            'country': job.get('country'),
            'source': job.get('source'),
            'website': job.get('website'),
            'scraped_at': job.get('scraped_at')
        }
        
        return {k: v for k, v in enriched.items() if v is not None}
    
    def save_to_json(self, jobs: List[Dict]) -> bool:
        """Save jobs to JSON file"""
        try:
            output = {
                'metadata': {
                    'total_jobs': len(jobs),
                    'last_updated': datetime.now().isoformat(),
                    'source': 'National Job Portal (NJP)',
                    'status': 'scraped'
                },
                'jobs': jobs
            }
            
            with open(self.output_file, 'w', encoding='utf-8') as f:
                json.dump(output, f, indent=2, ensure_ascii=False)
            
            logger.info(f"✅ Saved {len(jobs)} jobs to {self.output_file}")
            return True
        except Exception as e:
            logger.error(f"❌ Error saving JSON: {str(e)}")
            return False
    
    def scrape_from_file(self, html_file: str) -> Dict:
        """Scrape from local HTML file"""
        
        logger.info("🚀 Starting NJP file scraper...\n")
        
        jobs = self.parse_from_html_file(html_file)
        
        if not jobs:
            logger.warning("⚠️  No jobs found in HTML file")
            return {'status': 'no_data', 'count': 0}
        
        enriched_jobs = [self.enrich_job(j, i) for i, j in enumerate(jobs, 1)]
        
        if self.save_to_json(enriched_jobs):
            return {
                'status': 'success',
                'count': len(enriched_jobs),
                'file': self.output_file
            }
        else:
            return {'status': 'failed'}


if __name__ == "__main__":
    scraper = NJPWebsiteScraper('njp_jobs.json')
    result = scraper.scrape_from_file('debug_njp_page.html')
    
    print(f"\n{'='*70}")
    print(f"📊 FINAL RESULT: {json.dumps(result, indent=2)}")
    print(f"{'='*70}")
    
    # Display sample results
    if result['status'] == 'success':
        with open('njp_jobs.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            print(f"\n✅ Saved {len(data['jobs'])} jobs!\n")
            
            for i, job in enumerate(data['jobs'][:3], 1):
                print(f"\n{i}. TITLE: {job.get('title')}")
                print(f"   Organization: {job.get('organization')}")
                print(f"   Job Type: {job.get('job_type')}")
                print(f"   Grade: {job.get('grade')}")
                print(f"   Vacancies: {job.get('vacancies')}")
                print(f"   Experience: {job.get('experience')}")
                print(f"   Closing: {job.get('closing_date')}")
                print(f"   Link: {job.get('job_link')}")