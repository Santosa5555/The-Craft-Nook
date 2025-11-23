'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <div ref={searchRef} className="relative">
      {!isOpen ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="text-background hover:text-primary backdrop-blur-sm transition-all hover:bg-white/10"
          aria-label="Open search"
        >
          <Search className="h-5 w-5 drop-shadow-md" />
        </Button>
      ) : (
        <form
          onSubmit={handleSearch}
          className={cn(
            'flex items-center gap-2 transition-all duration-300',
            'bg-background/95 border-primary/30 rounded-lg border shadow-lg backdrop-blur-md'
          )}
        >
          <div className="relative flex items-center">
            <Search className="text-muted-foreground pointer-events-none absolute left-3 h-4 w-4" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search handcrafted goods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-foreground placeholder:text-muted-foreground w-64 border-0 bg-transparent pr-9 pl-9 focus-visible:ring-0 md:w-80"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setSearchQuery('')}
                className="text-muted-foreground hover:text-foreground absolute right-1 h-7 w-7"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
