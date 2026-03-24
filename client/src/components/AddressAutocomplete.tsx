import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2, Navigation, X } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDTD3x22N_Zlnt_CyYT-KCsW3z-ambkKEQ';

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  darkMode?: boolean; // Pour le formulaire de réservation public (fond sombre)
  clearable?: boolean;
}

// Charger le script Google Maps une seule fois
let googleMapsLoaded = false;
let googleMapsLoading = false;
const loadCallbacks: Array<() => void> = [];

export function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve) => {
    if (googleMapsLoaded) { resolve(); return; }
    loadCallbacks.push(resolve);
    if (googleMapsLoading) return;
    googleMapsLoading = true;
    const existing = document.querySelector('script[data-google-maps]');
    if (existing) { googleMapsLoading = false; return; }
    const script = document.createElement('script');
    script.setAttribute('data-google-maps', 'true');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&language=fr&region=FR`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleMapsLoaded = true;
      loadCallbacks.forEach(cb => cb());
      loadCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Saisir une adresse...',
  className = '',
  inputClassName = '',
  id,
  name,
  required,
  disabled,
  label,
  darkMode = false,
  clearable = false,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [mapsReady, setMapsReady] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);

  useEffect(() => {
    loadGoogleMaps().then(() => {
      setMapsReady(true);
      autocompleteServiceRef.current = new (window as any).google.maps.places.AutocompleteService();
      const div = document.createElement('div');
      placesServiceRef.current = new (window as any).google.maps.places.PlacesService(div);
    });
  }, []);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchAddresses = useCallback(async (q: string) => {
    if (q.length < 2 || !mapsReady || !autocompleteServiceRef.current) {
      setSuggestions([]); setShowDropdown(false); return;
    }
    setIsLoading(true);
    autocompleteServiceRef.current.getPlacePredictions(
      {
        input: q,
        language: 'fr',
        componentRestrictions: { country: ['fr', 'mc', 'be', 'ch', 'lu'] },
      },
      (predictions: PlacePrediction[] | null, status: string) => {
        setIsLoading(false);
        if (status === 'OK' && predictions) {
          setSuggestions(predictions);
          setShowDropdown(true);
          setSelectedIndex(-1);
        } else {
          setSuggestions([]); setShowDropdown(false);
        }
      }
    );
  }, [mapsReady]);

  const getPlaceDetails = useCallback((placeId: string, description: string) => {
    if (!placesServiceRef.current) { onChange(description); return; }
    placesServiceRef.current.getDetails(
      { placeId, fields: ['geometry', 'formatted_address'] },
      (place: any, status: string) => {
        if (status === 'OK' && place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const addr = place.formatted_address || description;
          setQuery(addr);
          onChange(addr, lat, lng);
        } else {
          setQuery(description);
          onChange(description);
        }
      }
    );
  }, [onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAddresses(val), 300);
  };

  const handleSelect = (prediction: PlacePrediction) => {
    setQuery(prediction.description);
    setSuggestions([]); setShowDropdown(false); setSelectedIndex(-1);
    getPlaceDetails(prediction.place_id, prediction.description);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(prev => Math.max(prev - 1, -1)); }
    else if (e.key === 'Enter' && selectedIndex >= 0) { e.preventDefault(); handleSelect(suggestions[selectedIndex]); }
    else if (e.key === 'Escape') { setShowDropdown(false); }
  };

  const handleClear = () => { setQuery(''); onChange(''); setSuggestions([]); setShowDropdown(false); };

  const baseInput = darkMode
    ? 'w-full pl-9 pr-8 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] transition-all text-sm'
    : 'w-full pl-9 pr-8 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label htmlFor={id} className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-foreground'}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${darkMode ? 'text-gray-500' : 'text-muted-foreground'}`} />
        <input
          id={id}
          name={name}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
          className={`${baseInput} ${inputClassName}`}
        />
        {isLoading && (
          <Loader2 className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin ${darkMode ? 'text-gray-500' : 'text-muted-foreground'}`} />
        )}
        {clearable && query && !isLoading && (
          <button type="button" onClick={handleClear} className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 ${darkMode ? 'text-gray-500 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className={`absolute z-[9999] w-full mt-1 rounded-md shadow-xl overflow-hidden ${darkMode ? 'bg-[#1a1a2e] border border-white/10' : 'bg-popover border border-border'}`}>
          {suggestions.map((pred, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={pred.place_id}
                type="button"
                className={`w-full flex items-start gap-2 px-3 py-2.5 text-left transition-colors ${
                  darkMode
                    ? `hover:bg-white/10 ${isSelected ? 'bg-white/10' : ''}`
                    : `hover:bg-accent hover:text-accent-foreground ${isSelected ? 'bg-accent text-accent-foreground' : ''}`
                }`}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(pred); }}
              >
                <Navigation className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${darkMode ? 'text-[#C9A84C]' : 'text-primary'}`} />
                <div className="min-w-0">
                  <div className={`text-sm font-medium truncate ${darkMode ? 'text-white' : ''}`}>{pred.structured_formatting.main_text}</div>
                  <div className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>{pred.structured_formatting.secondary_text}</div>
                </div>
              </button>
            );
          })}
          <div className={`px-3 py-1.5 flex items-center justify-end border-t ${darkMode ? 'border-white/10 bg-black/30' : 'border-border bg-muted/30'}`}>
            <img src="https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png" alt="Powered by Google" className="h-3.5 opacity-60" />
          </div>
        </div>
      )}
    </div>
  );
}

// Calcul de distance et durée via Google Distance Matrix
export async function calculateRouteGoogle(
  origin: string,
  destination: string
): Promise<{ distanceKm: number; durationMin: number; distanceText: string; durationText: string } | null> {
  return new Promise((resolve) => {
    loadGoogleMaps().then(() => {
      const service = new (window as any).google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        { origins: [origin], destinations: [destination], travelMode: 'DRIVING', language: 'fr', region: 'FR' },
        (response: any, status: string) => {
          if (status === 'OK' && response?.rows[0]?.elements[0]?.status === 'OK') {
            const el = response.rows[0].elements[0];
            resolve({
              distanceKm: Math.round(el.distance.value / 100) / 10,
              durationMin: Math.round(el.duration.value / 60),
              distanceText: el.distance.text,
              durationText: el.duration.text,
            });
          } else { resolve(null); }
        }
      );
    });
  });
}
