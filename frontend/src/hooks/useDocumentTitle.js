import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Front Desk PMS` : 'Front Desk PMS';
  }, [title]);
}
