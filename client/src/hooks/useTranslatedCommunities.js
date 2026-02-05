import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { batchTranslate } from '../api/translationApi';

/**
 * Component wrapper that translates community groups dynamically
 */
export const useTranslatedCommunities = (originalGroups) => {
  const { language } = useLanguage();
  const [translatedGroups, setTranslatedGroups] = useState(originalGroups);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const translateGroups = async () => {
      if (language === 'en' || !originalGroups || originalGroups.length === 0) {
        setTranslatedGroups(originalGroups);
        return;
      }

      setIsTranslating(true);

      try {
        // Prepare items for batch translation
        const itemsToTranslate = [];
        originalGroups.forEach(group => {
          itemsToTranslate.push(
            { text: group.name, id: `${group._id}-name` },
            { text: group.topic, id: `${group._id}-topic` }
          );
          if (group.description) {
            itemsToTranslate.push({ text: group.description, id: `${group._id}-desc` });
          }
        });

        // Batch translate all texts
        const translated = await batchTranslate(itemsToTranslate, language);

        // Map translated texts back to groups
        const updatedGroups = originalGroups.map((group, index) => {
          const nameIndex = index * 2 + (index * (group.description ? 1 : 0));
          const topicIndex = nameIndex + 1;
          const descIndex = group.description ? topicIndex + 1 : undefined;

          return {
            ...group,
            name: translated[nameIndex] || group.name,
            topic: translated[topicIndex] || group.topic,
            description: descIndex !== undefined ? (translated[descIndex] || group.description) : group.description
          };
        });

        setTranslatedGroups(updatedGroups);
      } catch (error) {
        console.error('Failed to translate communities:', error);
        setTranslatedGroups(originalGroups); // Fallback to original
      } finally {
        setIsTranslating(false);
      }
    };

    translateGroups();
  }, [originalGroups, language]);

  return { groups: translatedGroups, isTranslating };
};
