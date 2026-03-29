import { useMemo, useState } from 'react';
import type { Page, Section, Source } from '../types/pages';
import { generateId } from '../lib/id';
import { formatDateTime } from '../lib/date';

type AddPageInput = {
  title: string;
  description: string;
  tags: string[];
};

type AddSourceInput = {
  type: 'link' | 'text';
  label: string;
  content: string;
};

export function usePages(initialPages: Page[]) {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  const selectedPage = useMemo(
    () => pages.find((page) => page.id === selectedPageId) ?? null,
    [pages, selectedPageId]
  );

  const updatePages = (updater: (pages: Page[]) => Page[]) => {
    setPages((prev) => updater(prev));
  };

  const addPage = ({ title, description, tags }: AddPageInput) => {
    const newPage: Page = {
      id: generateId(),
      title,
      description,
      tags,
      updatedAt: formatDateTime(),
      unclassifiedSources: [],
      sections: [],
    };
    setPages((prev) => [newPage, ...prev]);
  };

  const addSection = (pageId: string, title: string) => {
    const newSection: Section = { id: generateId(), title, sources: [] };
    updatePages((prev) =>
      prev.map((page) => (page.id === pageId ? { ...page, sections: [...page.sections, newSection] } : page))
    );
  };

  const editSection = (pageId: string, sectionId: string, title: string) => {
    updatePages((prev) =>
      prev.map((page) =>
        page.id === pageId
          ? {
              ...page,
              sections: page.sections.map((section) => (section.id === sectionId ? { ...section, title } : section)),
            }
          : page
      )
    );
  };

  const deleteSection = (pageId: string, sectionId: string) => {
    updatePages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId) return page;
        const section = page.sections.find((s) => s.id === sectionId);
        if (!section) return page;
        return {
          ...page,
          unclassifiedSources: [...page.unclassifiedSources, ...section.sources],
          sections: page.sections.filter((s) => s.id !== sectionId),
        };
      })
    );
  };

  const addSource = (pageId: string, sectionId: string | null, input: AddSourceInput) => {
    const source: Source = {
      id: generateId(),
      type: input.type,
      label: input.label,
      ...(input.type === 'link' ? { url: input.content } : { content: input.content }),
    };

    updatePages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId) return page;
        if (sectionId) {
          return {
            ...page,
            sections: page.sections.map((section) =>
              section.id === sectionId ? { ...section, sources: [...section.sources, source] } : section
            ),
            updatedAt: formatDateTime(),
          };
        }
        return {
          ...page,
          unclassifiedSources: [...page.unclassifiedSources, source],
          updatedAt: formatDateTime(),
        };
      })
    );
  };

  const deleteSource = (pageId: string, sectionId: string | null, sourceId: string) => {
    updatePages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId) return page;
        if (sectionId) {
          return {
            ...page,
            sections: page.sections.map((section) =>
              section.id === sectionId ? { ...section, sources: section.sources.filter((src) => src.id !== sourceId) } : section
            ),
          };
        }
        return { ...page, unclassifiedSources: page.unclassifiedSources.filter((src) => src.id !== sourceId) };
      })
    );
  };

  const moveSource = (pageId: string, sourceId: string, fromSectionId: string | null, targetSectionId: string) => {
    updatePages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId) return page;
        let sourceToMove: Source | undefined;
        if (fromSectionId) {
          sourceToMove = page.sections.find((s) => s.id === fromSectionId)?.sources.find((src) => src.id === sourceId);
        } else {
          sourceToMove = page.unclassifiedSources.find((src) => src.id === sourceId);
        }
        if (!sourceToMove) return page;

        let newUnclassified = fromSectionId
          ? page.unclassifiedSources
          : page.unclassifiedSources.filter((src) => src.id !== sourceId);
        let newSections = page.sections.map((section) =>
          section.id === fromSectionId
            ? { ...section, sources: section.sources.filter((src) => src.id !== sourceId) }
            : section
        );

        if (targetSectionId === 'unclassified') {
          newUnclassified = [...newUnclassified, sourceToMove];
        } else {
          newSections = newSections.map((section) =>
            section.id === targetSectionId ? { ...section, sources: [...section.sources, sourceToMove!] } : section
          );
        }

        return { ...page, unclassifiedSources: newUnclassified, sections: newSections, updatedAt: formatDateTime() };
      })
    );
  };

  return {
    pages,
    selectedPage,
    selectedPageId,
    setSelectedPageId,
    addPage,
    addSection,
    editSection,
    deleteSection,
    addSource,
    deleteSource,
    moveSource,
  };
}
