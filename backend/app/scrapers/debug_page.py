from bs4 import BeautifulSoup
import json

# Read HTML file
with open('debug_pmyp_page.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

soup = BeautifulSoup(html_content, 'html.parser')

print("=" * 80)
print("🔍 HTML STRUCTURE ANALYSIS")
print("=" * 80)

# Check for scholarshipCard
scholarshipCards = soup.find_all('div', class_='scholarshipCard')
print(f"\n📌 scholarshipCard divs: {len(scholarshipCards)}")

# Check for col-md-6
col_md_6 = soup.find_all('div', class_='col-md-6')
print(f"📌 col-md-6 divs: {len(col_md_6)}")

# Check for row divs
rows = soup.find_all('div', class_='row')
print(f"📌 row divs: {len(rows)}")

# Get all unique div classes
all_divs = soup.find_all('div')
unique_classes = set()
for div in all_divs:
    classes = tuple(div.get('class', []))
    if classes:
        unique_classes.add(classes)

print(f"\n📌 Total divs found: {len(all_divs)}")
print(f"📌 Unique div class combinations: {len(unique_classes)}")
print("\n🎯 UNIQUE DIV CLASSES:")
for i, classes in enumerate(sorted(unique_classes)[:30], 1):
    print(f"   {i}. {classes}")

# Check first scholarship card structure
if col_md_6:
    first_card = col_md_6[0]
    print("\n" + "=" * 80)
    print("📋 FIRST CARD STRUCTURE:")
    print("=" * 80)
    print(first_card.prettify()[:2000])
    
    # Find all elements in first card
    print("\n🏷️  TAGS IN FIRST CARD:")
    tags_count = {}
    for tag in first_card.find_all(True):
        tag_name = tag.name
        tags_count[tag_name] = tags_count.get(tag_name, 0) + 1
    
    for tag, count in sorted(tags_count.items(), key=lambda x: x[1], reverse=True):
        print(f"   {tag}: {count}")
    
    # Extract data from first card
    print("\n📊 DATA FROM FIRST CARD:")
    
    # All p tags
    p_tags = first_card.find_all('p')
    print(f"\n   P tags ({len(p_tags)}):")
    for i, p in enumerate(p_tags[:5]):
        text = p.get_text(strip=True)[:60]
        classes = p.get('class', [])
        print(f"      p[{i}] class={classes} | {text}")
    
    # All h tags
    h_tags = first_card.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
    print(f"\n   Heading tags ({len(h_tags)}):")
    for i, h in enumerate(h_tags[:5]):
        text = h.get_text(strip=True)[:60]
        classes = h.get('class', [])
        tag_name = h.name
        print(f"      {tag_name}[{i}] class={classes} | {text}")
    
    # All span tags
    span_tags = first_card.find_all('span')
    print(f"\n   Span tags ({len(span_tags)}):")
    for i, span in enumerate(span_tags[:5]):
        text = span.get_text(strip=True)[:60]
        classes = span.get('class', [])
        print(f"      span[{i}] class={classes} | {text}")
    
    # All img tags
    img_tags = first_card.find_all('img')
    print(f"\n   Img tags ({len(img_tags)}):")
    for i, img in enumerate(img_tags[:3]):
        src = img.get('src', 'no src')[:50]
        alt = img.get('alt', 'no alt')[:30]
        print(f"      img[{i}] src={src} | alt={alt}")
    
    # All a tags
    a_tags = first_card.find_all('a')
    print(f"\n   A tags ({len(a_tags)}):")
    for i, a in enumerate(a_tags[:5]):
        text = a.get_text(strip=True)[:30]
        href = a.get('href', 'no href')[:50]
        classes = a.get('class', [])
        print(f"      a[{i}] class={classes} | text={text} | href={href}")

print("\n" + "=" * 80)