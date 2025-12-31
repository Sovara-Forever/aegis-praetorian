#!/usr/bin/env python3
"""
normalizer.py - DealerInspire JSON Normalizer
Converts scraped JSON from various dealer sites into normalized vehicle records
"""

import json
import re
from typing import Dict, List, Optional
from pathlib import Path


class DealerInspireNormalizer:
    """Normalize DealerInspire scraped JSON data"""
    
    @staticmethod
    def extract_price(price_str: str) -> Optional[float]:
        """Extract numeric price from string like '$25,791' or '$24,056'"""
        if not price_str:
            return None
        # Remove $ and commas, extract numbers
        cleaned = re.sub(r'[^\d.]', '', price_str)
        try:
            return float(cleaned) if cleaned else None
        except ValueError:
            return None
    
    @staticmethod
    def extract_year_make_model(record: Dict) -> Dict[str, str]:
        """Extract year, make, model from various field combinations"""
        result = {'year': None, 'make': None, 'model': None, 'trim': None}
        
        # Pattern 1: Cherry Hill VW format
        if 'title-top' in record and 'title-bottom' in record:
            # title-top: "New 2026"
            # title-bottom: "Volkswagen Jetta S"
            top = record.get('title-top', '')
            bottom = record.get('title-bottom', '')
            
            year_match = re.search(r'(\d{4})', top)
            if year_match:
                result['year'] = int(year_match.group(1))
            
            # Parse "Volkswagen Jetta S" -> make: Volkswagen, model: Jetta, trim: S
            parts = bottom.strip().split()
            if len(parts) >= 2:
                result['make'] = parts[0]
                result['model'] = parts[1]
                if len(parts) > 2:
                    result['trim'] = ' '.join(parts[2:])
        
        # Pattern 2: Midstate Chevy format
        elif 'vehicle-title--year' in record:
            result['year'] = int(record.get('vehicle-title--year', 0))
            
            # "Chevrolet Trax"
            make_model = record.get('vehicle-title--make-model', '')
            parts = make_model.strip().split()
            if len(parts) >= 2:
                result['make'] = parts[0]
                result['model'] = ' '.join(parts[1:])
            
            result['trim'] = record.get('vehicle-title--trim', '')
        
        return result
    
    @staticmethod
    def extract_vin_stock(record: Dict) -> Dict[str, str]:
        """Extract VIN and stock number"""
        result = {'vin': None, 'stock': None}
        
        # Pattern 1: Cherry Hill VW
        if 'vin-row' in record:
            # "VIN: 3VW5W7BU7TM025117"
            vin_text = record.get('vin-row', '')
            vin_match = re.search(r'VIN:\s*([A-Z0-9]+)', vin_text, re.IGNORECASE)
            if vin_match:
                result['vin'] = vin_match.group(1)
        
        if 'stock-row' in record:
            # "Stock: V55165"
            stock_text = record.get('stock-row', '')
            stock_match = re.search(r'Stock:\s*([A-Z0-9]+)', stock_text, re.IGNORECASE)
            if stock_match:
                result['stock'] = stock_match.group(1)
        
        # Pattern 2: Midstate Chevy
        if 'vehicle-identifiers--value' in record:
            result['vin'] = record.get('vehicle-identifiers--value', '')
        
        if 'vehicle-identifiers--value_2' in record:
            result['stock'] = record.get('vehicle-identifiers--value_2', '')
        
        return result
    
    @staticmethod
    def extract_pricing(record: Dict) -> Dict[str, float]:
        """Extract MSRP, dealer price, and savings"""
        result = {'msrp': None, 'dealer_price': None, 'savings': None}
        
        # Pattern 1: Cherry Hill VW
        if 'price' in record and 'strong_2' in record:
            result['msrp'] = DealerInspireNormalizer.extract_price(record.get('price'))
            result['dealer_price'] = DealerInspireNormalizer.extract_price(record.get('strong_2'))
        
        # Pattern 2: Midstate Chevy
        if 'vehicle-pricing-highlight-amount_2' in record:
            result['dealer_price'] = DealerInspireNormalizer.extract_price(
                record.get('vehicle-pricing-highlight-amount_2')
            )
        
        if 'vehicle-pricing-highlight-amount' in record:
            result['savings'] = DealerInspireNormalizer.extract_price(
                record.get('vehicle-pricing-highlight-amount')
            )
        
        # Calculate MSRP if missing
        if result['dealer_price'] and result['savings'] and not result['msrp']:
            result['msrp'] = result['dealer_price'] + result['savings']
        
        return result
    
    @staticmethod
    def extract_images_urls(record: Dict) -> Dict[str, str]:
        """Extract image and detail URLs"""
        result = {'image_url': None, 'detail_url': None}
        
        # Image URL
        if 'hit-link' in record:
            result['image_url'] = record.get('hit-link')
        elif 'hero-carousel--image' in record:
            result['image_url'] = record.get('hero-carousel--image')
        
        # Detail URL
        if '_container_link' in record:
            result['detail_url'] = record.get('_container_link')
        elif 'vehicle-dropdown--label_3_link' in record:
            result['detail_url'] = record.get('vehicle-dropdown--label_3_link')
        
        return result
    
    @staticmethod
    def extract_features(record: Dict) -> List[str]:
        """Extract vehicle features from icon fields"""
        features = []
        
        # Look for feature icons
        for key, value in record.items():
            if 'vehicle-highlights--icon' in key and value:
                # Extract feature name from icon URL
                # e.g., "bluetooth-sm.svg" -> "Bluetooth"
                match = re.search(r'/([a-z-]+)-sm\.svg', value)
                if match:
                    feature_name = match.group(1).replace('-', ' ').title()
                    features.append(feature_name)
        
        return features
    
    @staticmethod
    def normalize_record(record: Dict, dealer_name: str = None) -> Dict:
        """Normalize a single vehicle record"""
        normalized = {}
        
        # Extract all components
        ymm = DealerInspireNormalizer.extract_year_make_model(record)
        vin_stock = DealerInspireNormalizer.extract_vin_stock(record)
        pricing = DealerInspireNormalizer.extract_pricing(record)
        urls = DealerInspireNormalizer.extract_images_urls(record)
        features = DealerInspireNormalizer.extract_features(record)
        
        # Combine into normalized structure
        normalized.update(ymm)
        normalized.update(vin_stock)
        normalized.update(pricing)
        normalized.update(urls)
        
        # Additional fields
        normalized['features_json'] = json.dumps(features) if features else None
        normalized['dealer_name'] = dealer_name
        
        # Condition
        if 'vehicle-title--condition' in record:
            normalized['condition'] = record.get('vehicle-title--condition', 'New')
        elif 'title-top' in record:
            normalized['condition'] = 'New' if 'New' in record.get('title-top', '') else 'Used'
        else:
            normalized['condition'] = 'New'
        
        # Status
        if 'vehicle-status--label' in record:
            normalized['status'] = record.get('vehicle-status--label', 'In Stock')
        else:
            normalized['status'] = 'In Stock'
        
        return normalized
    
    @staticmethod
    def normalize_file(json_path: Path, dealer_name: str = None) -> List[Dict]:
        """Normalize an entire JSON file"""
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Auto-detect dealer name from filename if not provided
        if not dealer_name:
            filename = json_path.stem
            if 'cherryhillvw' in filename.lower():
                dealer_name = 'Cherry Hill Volkswagen'
            elif 'midstatechevy' in filename.lower():
                dealer_name = 'Midstate Chevrolet'
            else:
                dealer_name = 'Unknown Dealer'
        
        normalized_records = []
        for record in data:
            try:
                normalized = DealerInspireNormalizer.normalize_record(record, dealer_name)
                # Only include if we have minimum required fields
                if normalized.get('vin') and normalized.get('year') and normalized.get('make'):
                    normalized_records.append(normalized)
            except Exception as e:
                print(f"⚠️  Error normalizing record: {e}")
                continue
        
        return normalized_records


def test_normalizer():
    """Test the normalizer with sample files"""
    uploads_dir = Path(__file__).parent.parent / "uploads"
    
    # Test Cherry Hill VW
    cherry_hill_file = uploads_dir / "simplescraper-www-cherryhillvw-com-2025-12-31T12-05-01.json"
    if cherry_hill_file.exists():
        print(f"\n📄 Processing: {cherry_hill_file.name}")
        records = DealerInspireNormalizer.normalize_file(cherry_hill_file)
        print(f"✓ Normalized {len(records)} vehicles")
        if records:
            print(f"   Sample: {records[0]['year']} {records[0]['make']} {records[0]['model']} - ${records[0]['dealer_price']}")
    
    # Test Midstate Chevy
    midstate_file = uploads_dir / "simplescraper-www-midstatechevy-com-2025-12-31T12-10-37.json"
    if midstate_file.exists():
        print(f"\n📄 Processing: {midstate_file.name}")
        records = DealerInspireNormalizer.normalize_file(midstate_file)
        print(f"✓ Normalized {len(records)} vehicles")
        if records:
            print(f"   Sample: {records[0]['year']} {records[0]['make']} {records[0]['model']} - ${records[0]['dealer_price']}")


if __name__ == "__main__":
    print("🔧 Testing DealerInspire Normalizer...")
    test_normalizer()
