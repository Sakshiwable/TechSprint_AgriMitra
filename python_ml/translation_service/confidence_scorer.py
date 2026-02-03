from typing import Dict

class ConfidenceScorer:
    """Calculate confidence scores for translations"""
    
    @staticmethod
    def jaccard_similarity(text1: str, text2: str) -> float:
        """
        Calculate Jaccard similarity between two texts
        
        Args:
            text1: First text
            text2: Second text
        
        Returns:
            Similarity score between 0 and 1
        """
        set1 = set(text1.lower().split())
        set2 = set(text2.lower().split())
        
        if not set1 and not set2:
            return 1.0
        if not set1 or not set2:
            return 0.0
        
        intersection = set1.intersection(set2)
        union = set1.union(set2)
        
        return len(intersection) / len(union) if union else 0.0
    
    @staticmethod
    def length_ratio_score(original: str, translated: str) -> float:
        """
        Calculate score based on length ratio
        Expected ratio varies by language pair
        
        Args:
            original: Original text
            translated: Translated text
        
        Returns:
            Score between 0 and 1
        """
        if not original or not translated:
            return 0.0
        
        ratio = len(translated) / len(original)
        
        # Ideal ratio is between 0.7 and 1.5 for most language pairs
        if 0.7 <= ratio <= 1.5:
            return 1.0
        elif ratio < 0.7:
            # Too short - possibly untranslated
            return max(0.0, ratio / 0.7)
        else:
            # Too long - might be verbose
            return max(0.0, 1.5 / ratio)
    
    @staticmethod
    def calculate_confidence(
        original: str, 
        translated: str, 
        back_translated: str = None
    ) -> float:
        """
        Calculate overall confidence score
        
        Args:
            original: Original text
            translated: Translated text
            back_translated: Optional back-translation for verification
        
        Returns:
            Confidence score between 0 and 1
        """
        scores = []
        
        # Length ratio score (weight: 0.3)
        length_score = ConfidenceScorer.length_ratio_score(original, translated)
        scores.append(length_score * 0.3)
        
        # Back-translation score (weight: 0.5) if available
        if back_translated:
            back_score = ConfidenceScorer.jaccard_similarity(original, back_translated)
            scores.append(back_score * 0.5)
        else:
            # If no back-translation, use placeholder score
            scores.append(0.4)
        
        # Basic sanity checks (weight: 0.2)
        sanity_score = 1.0
        if not translated or translated == original:
            sanity_score = 0.3
        elif len(translated) < 2:
            sanity_score = 0.5
        scores.append(sanity_score * 0.2)
        
        return min(1.0, sum(scores))
    
    @staticmethod
    def batch_confidence(
        originals: list, 
        translations: list, 
        back_translations: list = None
    ) -> Dict[int, float]:
        """
        Calculate confidence for batch translations
        
        Args:
            originals: List of original texts
            translations: List of translated texts
            back_translations: Optional list of back-translations
        
        Returns:
            Dictionary mapping index to confidence score
        """
        results = {}
        
        for i, (orig, trans) in enumerate(zip(originals, translations)):
            back_trans = back_translations[i] if back_translations else None
            results[i] = ConfidenceScorer.calculate_confidence(orig, trans, back_trans)
        
        return results
