from bs4 import BeautifulSoup
import json

# Read HTML file
with open('debug_njp_page.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

soup = BeautifulSoup(html_content, 'html.parser')

print("=" * 80)
print("🔍 NJP WEBSITE - DETAILED CARD ANALYSIS")
print("=" * 80)

# Find job cards using correct Tailwind class
job_cards = soup.find_all('div', class_='job-card')
print(f"\n📌 Found {len(job_cards)} job-card elements")

if job_cards:
    first_card = job_cards[0]
    
    print("\n" + "=" * 80)
    print("📋 FIRST JOB CARD HTML:")
    print("=" * 80)
    print(first_card.prettify()[:4000])
    
    print("\n" + "=" * 80)
    print("🏷️  TAGS IN FIRST CARD:")
    print("=" * 80)
    tags_count = {}
    for tag in first_card.find_all(True):
        tag_name = tag.name
        tags_count[tag_name] = tags_count.get(tag_name, 0) + 1
    
    for tag, count in sorted(tags_count.items(), key=lambda x: x[1], reverse=True):
        print(f"   {tag}: {count}")
    
    # Extract data
    print("\n" + "=" * 80)
    print("📊 EXTRACTED DATA FROM FIRST CARD:")
    print("=" * 80)
    
    # All h tags
    h_tags = first_card.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
    print(f"\n   Heading tags ({len(h_tags)}):")
    for i, h in enumerate(h_tags[:10]):
        text = h.get_text(strip=True)[:100]
        tag_name = h.name
        classes = ' '.join(h.get('class', []))[:60]
        print(f"      {tag_name}: {text}")
        if classes:
            print(f"         class: {classes}")
    
    # All p tags
    p_tags = first_card.find_all('p')
    print(f"\n   P tags ({len(p_tags)}):")
    for i, p in enumerate(p_tags[:10]):
        text = p.get_text(strip=True)[:100]
        classes = ' '.join(p.get('class', []))[:60]
        print(f"      p: {text}")
        if classes:
            print(f"         class: {classes}")
    
    # All span tags
    span_tags = first_card.find_all('span')
    print(f"\n   Span tags ({len(span_tags)}):")
    for i, span in enumerate(span_tags[:10]):
        text = span.get_text(strip=True)[:80]
        classes = ' '.join(span.get('class', []))[:60]
        if text:
            print(f"      span: {text}")
            if classes:
                print(f"         class: {classes}")
    
    # All a tags
    a_tags = first_card.find_all('a')
    print(f"\n   A tags ({len(a_tags)}):")
    for i, a in enumerate(a_tags[:10]):
        text = a.get_text(strip=True)[:60]
        href = a.get('href', 'no href')[:80]
        classes = ' '.join(a.get('class', []))[:60]
        print(f"      a: {text}")
        print(f"         href: {href}")
        if classes:
            print(f"         class: {classes}")
    
    # All div tags with classes
    div_tags = first_card.find_all('div', class_=True)
    print(f"\n   Div tags with classes ({len(div_tags)}):")
    for i, div in enumerate(div_tags[:15]):
        text = div.get_text(strip=True)[:80]
        classes = ' '.join(div.get('class', []))[:80]
        print(f"      {i}. {classes}")
        if text and len(text) > 5:
            print(f"         text: {text}")
    
    # All img tags
    img_tags = first_card.find_all('img')
    print(f"\n   Img tags ({len(img_tags)}):")
    for i, img in enumerate(img_tags[:10]):
        src = img.get('src', 'no src')[:80]
        alt = img.get('alt', 'no alt')[:60]
        print(f"      img[{i}]: src={src}")
        print(f"         alt: {alt}")

else:
    print("\n❌ No job-card divs found!")
    print("\nTrying to find any divs with 'job' in class name...")
    
    all_divs = soup.find_all('div', class_=True)
    for div in all_divs[:20]:
        classes = ' '.join(div.get('class', []))
        if 'job' in classes.lower():
            text = div.get_text(strip=True)[:60]
            print(f"   Found: {classes}")
            print(f"   Text: {text}\n")

print("\n" + "=" * 80)