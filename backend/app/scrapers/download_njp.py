import requests
import logging

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

def download_njp_page():
    """Download NJP jobs page and save as HTML"""
    
    url = 'https://www.njp.gov.pk/jobs/live'
    
    logger.info(f"📥 Downloading from: {url}")
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Save HTML
        with open('debug_njp_page.html', 'w', encoding='utf-8') as f:
            f.write(response.text)
        
        logger.info(f"✅ Successfully saved HTML to debug_njp_page.html")
        logger.info(f"   File size: {len(response.text)} bytes")
        logger.info(f"   Status code: {response.status_code}")
        
        return True
        
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Error downloading page: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"❌ Unexpected error: {str(e)}")
        return False

if __name__ == "__main__":
    success = download_njp_page()
    
    if success:
        print("\n✅ Download complete! Now run: python debug_page2.py")
    else:
        print("\n❌ Download failed. Try manual download:")
        print("   1. Open: https://www.njp.gov.pk/jobs/live")
        print("   2. Right-click → Save As")
        print("   3. Save as: debug_njp_page.html")
        print("   4. Location: e:\\Citizen_Portal\\backend\\app\\scrapers\\")