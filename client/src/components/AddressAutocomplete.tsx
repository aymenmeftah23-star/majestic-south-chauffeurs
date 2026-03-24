import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  name?: string;
  /** Style variant: 'admin' for dashboard, 'dark' for client portal */
  variant?: 'admin' | 'dark';
}

interface Prediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDTD3x22N_Zlnt_CyYT-KCsW3z-ambkKEQ';

// Charger le script Google Maps une seule fois
let googleMapsLoaded = false;
let googleMapsLoading = false;
const loadCallbacks: (() => void)[] = [];

function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve) => {
    if (googleMapsLoaded && window.google?.maps?.places) {
      resolve();
      return;
    }
    loadCallbacks.push(resolve);
    if (googleMapsLoading) return;
    googleMapsLoading = true;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&language=fr&region=FR`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleMapsLoaded = true;
      googleMapsLoading = false;
      loadCallbacks.forEach(cb => cb());
      loadCallbacks.length = 0;
    };
    script.onerror = () => {
      googleMapsLoading = false;
      // Fallback: marquer comme charge pour utiliser Nominatim
      loadCallbacks.forEach(cb => cb());
      loadCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

/**
 * Composant d'autocompletion d'adresses
 * Utilise Google Maps Places API avec fallback Nominatim (OpenStreetMap)
 */
export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Saisissez une adresse...",
  className = "",
  required = false,
  name,
  variant = 'admin',
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [useGoogle, setUseGoogle] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);

  // Charger Google Maps au montage
  useEffect(() => {
    loadGoogleMaps().then(() => {
      if (window.google?.maps?.places) {
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
        setUseGoogle(true);
      }
    });
  }, []);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recherche Google Places
  const searchGoogle = useCallback((query: string): Promise<Prediction[]> => {
    return new Promise((resolve) => {
      if (!autocompleteServiceRef.current) {
        resolve([]);
        return;
      }
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'fr' },
          types: ['geocode', 'establishment'],
          language: 'fr',
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            resolve(predictions.map(p => ({
              description: p.description,
              place_id: p.place_id,
              structured_formatting: p.structured_formatting ? {
                main_text: p.structured_formatting.main_text,
                secondary_text: p.structured_formatting.secondary_text,
              } : undefined,
            })));
          } else {
            resolve([]);
          }
        }
      );
    });
  }, []);

  // Recherche Nominatim (fallback)
  const searchNominatim = useCallback(async (query: string, signal: AbortSignal): Promise<Prediction[]> => {
    const params = new URLSearchParams({
      q: query, format: 'json', addressdetails: '1', limit: '6',
      countrycodes: 'fr', 'accept-language': 'fr',
    });
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      signal, headers: { 'User-Agent': 'MajesticSouthChauffeurs/1.0' },
    });
    if (!res.ok) throw new Error('Nominatim error');
    const data = await res.json();
    return data.map((item: any) => {
      const addr = item.address || {};
      const main = addr.house_number && addr.road
        ? `${addr.house_number} ${addr.road}`
        : item.display_name.split(',')[0].trim();
      const city = addr.city || addr.town || addr.village || '';
      const secondary = [addr.postcode, city].filter(Boolean).join(' ');
      return {
        description: item.display_name,
        place_id: `nominatim-${item.place_id}`,
        structured_formatting: { main_text: main, secondary_text: secondary },
      };
    });
  }, []);

  const abortRef = useRef<AbortController>(undefined);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (val.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const delay = useGoogle ? 250 : 400;
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        let results: Prediction[];
        if (useGoogle) {
          results = await searchGoogle(val);
        } else {
          const controller = new AbortController();
          abortRef.current = controller;
          results = await searchNominatim(val, controller.signal);
        }
        setSuggestions(results);
        setShowDropdown(results.length > 0);
        setHighlightedIndex(-1);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setSuggestions([]);
          setShowDropdown(false);
        }
      } finally {
        setIsLoading(false);
      }
    }, delay);
  };

  const handleSelect = (suggestion: Prediction) => {
    onChange(suggestion.description);
    setShowDropdown(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  // Styles selon le variant
  const isDark = variant === 'dark';
  const inputStyles = isDark
    ? "w-full pl-10 pr-10 py-3 rounded-xl bg-[#1a1a1a] border border-amber-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-amber-600 transition-colors"
    : "flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  const dropdownStyles = isDark
    ? "absolute z-50 w-full mt-1 bg-[#1a1a1a] border border-amber-900/30 rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto"
    : "absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg overflow-hidden max-h-72 overflow-y-auto";

  const itemStyles = (highlighted: boolean) => isDark
    ? `px-4 py-3 cursor-pointer transition-colors ${highlighted ? 'bg-amber-900/30' : 'hover:bg-white/5'}`
    : `px-3 py-2.5 cursor-pointer transition-colors ${highlighted ? 'bg-accent' : 'hover:bg-accent/50'}`;

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-amber-600' : 'text-muted-foreground'} pointer-events-none`} />
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
          placeholder={placeholder}
          required={required}
          className={`${inputStyles} ${className}`}
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin ${isDark ? 'text-amber-600' : 'text-muted-foreground'}`} />
        )}
        {!isLoading && value && (
          <button
            type="button"
            onClick={handleClear}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-white' : 'text-muted-foreground hover:text-foreground'} transition-colors`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div ref={dropdownRef} className={dropdownStyles}>
          {suggestions.map((s, i) => {
            const isHighlighted = i === highlightedIndex;
            const main = s.structured_formatting?.main_text || s.description.split(',')[0];
            const secondary = s.structured_formatting?.secondary_text || '';
            return (
              <div
                key={`${s.place_id}-${i}`}
                className={itemStyles(isHighlighted)}
                onClick={() => handleSelect(s)}
                onMouseEnter={() => setHighlightedIndex(i)}
              >
                <div className="flex items-start gap-2.5">
                  <MapPin className={`h-4 w-4 mt-0.5 shrink-0 ${isDark ? 'text-amber-500' : 'text-primary'}`} />
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-foreground'}`}>
                      {main}
                    </div>
                    {secondary && (
                      <div className={`text-xs truncate mt-0.5 ${isDark ? 'text-gray-500' : 'text-muted-foreground'}`}>
                        {secondary}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div className={`px-3 py-1.5 text-[10px] text-center ${isDark ? 'text-gray-600 border-t border-amber-900/20' : 'text-muted-foreground border-t'}`}>
            {useGoogle ? (
              <span className="flex items-center justify-center gap-1">
                Powered by <img src="https://developers.google.com/static/maps/documentation/images/google_on_white.png" alt="Google" className="h-3 inline" style={isDark ? {filter: 'invert(0.6)'} : {}} />
              </span>
            ) : 'Powered by OpenStreetMap'}
          </div>
        </div>
      )}
    </div>
  );
}


