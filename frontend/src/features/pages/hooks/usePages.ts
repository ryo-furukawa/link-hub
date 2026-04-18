import { useState } from 'react';

export function usePages() {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  return { selectedPageId, setSelectedPageId };
}
