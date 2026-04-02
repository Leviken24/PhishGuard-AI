import re
from urllib.parse import urlparse

# Common known brands to check for mismatches
BRANDS = ["paypal", "google", "apple", "microsoft", "amazon", "facebook", "netflix", "bankofamerica", "chase", "wellsfargo"]
SHORTENERS = ["bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly", "is.gd", "buff.ly", "adf.ly"]
SUSPICIOUS_TLDS = [".xyz", ".tk", ".ml", ".ga", ".cf", ".top", ".club"]

def extract_url_features(url: str) -> dict:
    features = {}
    
    # Prefix http if missing for proper parsing, but mark protocol
    parsed = urlparse(url if "://" in url else "http://" + url)
    domain = parsed.netloc.lower()
    
    # 1. Domain age proxy (check for numbers/hyphens in domain)
    features["has_numbers_in_domain"] = bool(re.search(r'\d', domain))
    features["has_hyphens_in_domain"] = "-" in domain
    
    # 2. URL length
    features["url_length"] = len(url)
    
    # 3. Number of subdomains
    # domain split by '.' - usually 2 for main domain (e.g. google.com), >2 could mean subdomains
    domain_parts = domain.split('.')
    features["subdomain_count"] = max(0, len(domain_parts) - 2)
    
    # 4. Presence of IP address instead of domain
    features["is_ip_address"] = bool(re.match(r'^(\d{1,3}\.){3}\d{1,3}$', domain))
    
    # 5. Suspicious TLDs
    features["suspicious_tld"] = any(domain.endswith(tld) for tld in SUSPICIOUS_TLDS)
    
    # 6. URL shortener detection
    features["is_url_shortener"] = any(short in domain for short in SHORTENERS)
    
    # 7. Presence of brand keywords mismatched with domain
    found_brands = [brand for brand in BRANDS if brand in url.lower()]
    domain_brand_match = any(brand in domain for brand in found_brands) if found_brands else True
    features["brand_mismatch"] = len(found_brands) > 0 and not domain_brand_match
    features["brands_found"] = found_brands
    
    # 8. Special character count
    special_chars = re.sub(r'[a-zA-Z0-9\.\:\/]', '', url)
    features["special_char_count"] = len(special_chars)
    
    # 9. HTTPS vs HTTP
    features["protocol"] = parsed.scheme if parsed.scheme else "http"
    features["is_https"] = "https" in features["protocol"]
    
    return features


def extract_email_features(email_text: str) -> dict:
    features = {}
    text_lower = email_text.lower()
    
    # 1. Urgency language detection
    urgency_keywords = ["immediately", "verify now", "account suspended", "urgent", "action required", "within 24 hours", "lose access"]
    features["urgency_keywords"] = [kw for kw in urgency_keywords if kw in text_lower]
    features["has_urgency"] = len(features["urgency_keywords"]) > 0
    
    # 2. Presence of links
    url_pattern = re.compile(r'https?://[^\s<>"]+|www\.[^\s<>"]+')
    links = url_pattern.findall(email_text)
    features["link_count"] = len(links)
    features["extracted_links"] = links
    
    # 3. Sender domain mismatch hints (check if text claims a brand but links point elsewhere)
    found_brands = [brand for brand in BRANDS if brand in text_lower]
    mismatch_hint = False
    if found_brands and links:
        for link in links:
            if not any(brand in link.lower() for brand in found_brands):
                mismatch_hint = True
                break
    features["sender_link_mismatch_hint"] = mismatch_hint
    
    # 4. Request for credentials
    credential_kws = ["login", "password", "credentials", "verify your identity", "click here", "sign in"]
    features["credential_requests"] = [kw for kw in credential_kws if kw in text_lower]
    features["requests_credentials"] = len(features["credential_requests"]) > 0
    
    # 5. Grammar error signals (simple linguistic check proxy)
    # Using some common phishing grammar errors/patterns
    grammar_kws = ["dear customer", "kindly", "verify your account", "update your account"]
    features["generic_greeting_or_grammar_signal"] = any(kw in text_lower for kw in grammar_kws)
    
    # 6. Spoofed brand names
    # E.g. checking for common obfuscations of brands
    spoofed_patterns = [r'paypa1', r'g00gle', r'amaz0n', r'micro-soft', r'faceb00k']
    features["has_spoofed_brands"] = bool(any(re.search(pat, text_lower) for pat in spoofed_patterns))
    
    # 7. Suspicious attachments mentioned
    attachment_kws = ["attached invoice", "receipt", "document handling", "view attachment"]
    features["mentions_suspicious_attachment"] = any(kw in text_lower for kw in attachment_kws)
    
    return features
