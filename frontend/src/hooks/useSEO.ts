import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  ogType?: string;
  ogImage?: string;
}

export const useSEO = ({ title, description, ogType = 'website', ogImage = '/logo.svg' }: SEOProps) => {
  useEffect(() => {
    // Set document title
    document.title = `${title} | LearnSphere`;

    // Set meta description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }

    // Set Open Graph Tags
    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description || 'LearnSphere online learning management system.' },
      { property: 'og:type', content: ogType },
      { property: 'og:image', content: ogImage },
    ];

    ogTags.forEach(({ property, content }) => {
      let ogTag = document.querySelector(`meta[property="${property}"]`);
      if (!ogTag) {
        ogTag = document.createElement('meta');
        ogTag.setAttribute('property', property);
        document.head.appendChild(ogTag);
      }
      ogTag.setAttribute('content', content);
    });
  }, [title, description, ogType, ogImage]);
};
