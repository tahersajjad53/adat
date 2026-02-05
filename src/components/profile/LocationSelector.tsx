import React, { useState } from 'react';
import { Check, ChevronsUpDown, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CITIES, COUNTRY_FLAGS, getCitiesByCountry, type City } from '@/data/cities';

interface LocationSelectorProps {
  value?: City;
  onChange: (city: City | null, coords?: { latitude: number; longitude: number }) => void;
  className?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ value, onChange, className }) => {
  const [open, setOpen] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const citiesByCountry = getCitiesByCountry();

  const handleGPSLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGpsLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Find nearest city or use custom location
        const nearestCity = CITIES.find(city => 
          Math.abs(city.latitude - latitude) < 0.5 && 
          Math.abs(city.longitude - longitude) < 0.5
        );
        
        if (nearestCity) {
          onChange(nearestCity);
        } else {
          // Use GPS coordinates with a custom city entry
          onChange(null, { latitude, longitude });
        }
        
        setGpsLoading(false);
      },
      (error) => {
        console.error('GPS error:', error);
        alert('Unable to get your location. Please select a city manually.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className={cn('space-y-3', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-11 bg-background"
          >
            {value ? (
              <span className="flex items-center gap-2">
                <span>{COUNTRY_FLAGS[value.countryCode]}</span>
                <span>{value.name}, {value.country}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">Select your city...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover z-50" align="start">
          <Command>
            <CommandInput placeholder="Search cities..." />
            <CommandList>
              <CommandEmpty>No city found.</CommandEmpty>
              {Object.entries(citiesByCountry).map(([country, cities]) => (
                <CommandGroup key={country} heading={`${COUNTRY_FLAGS[cities[0].countryCode]} ${country}`}>
                  {cities.map((city) => (
                    <CommandItem
                      key={city.id}
                      value={`${city.name} ${city.country}`}
                      onSelect={() => {
                        onChange(city);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value?.id === city.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {city.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        variant="secondary"
        onClick={handleGPSLocation}
        disabled={gpsLoading}
        className="w-full"
      >
        {gpsLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Getting location...
          </>
        ) : (
          <>
            <MapPin className="mr-2 h-4 w-4" />
            Use my current location
          </>
        )}
      </Button>
    </div>
  );
};

export default LocationSelector;
