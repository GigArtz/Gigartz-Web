import React, { useEffect, useRef, useCallback } from "react";

interface PlaceSelectEvent extends Event {
  placePrediction?: {
    toPlace: () => {
      fetchFields: (options: { fields: string[] }) => Promise<void>;
      toJSON: () => google.maps.places.PlaceResult;
    };
  };
}

interface VenueInputProps {
  apiKey: string;
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void;
  className?: string;
  value?: string;
}

const VenueInput: React.FC<VenueInputProps> = ({
  apiKey,
  onPlaceSelected,
  className = "",
  value = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const placeAutocompleteRef =
    useRef<google.maps.places.PlaceAutocompleteElement | null>(null);
  const isInitializedRef = useRef(false);
  const currentValueRef = useRef<string>("");
  const onPlaceSelectedRef = useRef(onPlaceSelected);

  // Keep the callback ref updated
  useEffect(() => {
    onPlaceSelectedRef.current = onPlaceSelected;
  }, [onPlaceSelected]);

  const initializePlaceAutocomplete = useCallback(async () => {
    console.log(
      "initializePlaceAutocomplete called, current element exists:",
      !!placeAutocompleteRef.current
    );

    if (
      containerRef.current &&
      !placeAutocompleteRef.current &&
      window.google?.maps?.places
    ) {
      console.log("Creating new PlaceAutocompleteElement");
      const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement(
        {}
      );
      placeAutocomplete.className = className;

      placeAutocompleteRef.current = placeAutocomplete;
      console.log("PlaceAutocompleteElement created and stored in ref");

      // Clear container first to prevent duplicates
      containerRef.current.innerHTML = "";

      // We keep a ref to the selected place for internal use, but do not render
      // any visible UI for it (per requirement to keep the variable but hide it).
      const selectedPlaceRef = {
        current: null as null | google.maps.places.PlaceResult,
      };

      placeAutocomplete.addEventListener(
        "gmp-select",
        async (event: PlaceSelectEvent) => {
          const placePrediction = event.placePrediction;
          console.log(
            "gmp-select event triggered with placePrediction:",
            placePrediction
          );

          if (placePrediction) {
            try {
              const place = placePrediction.toPlace();
              await place.fetchFields({
                fields: ["displayName", "formattedAddress", "location"],
              });

              console.log("Fetched place:", place);
              // Store selected place in the ref (keeps the variable available)
              selectedPlaceRef.current = place.toJSON();

              // Convert to PlaceResult format for the callback
              const placeResult: google.maps.places.PlaceResult =
                place.toJSON();

              // Update our internal value ref
              const newValue =
                placeResult.formatted_address || placeResult.name || "";
              currentValueRef.current = newValue;

              onPlaceSelectedRef.current(placeResult);
            } catch (error) {
              console.error("Error fetching place fields:", error);
            }
          } else {
            console.warn("placePrediction is undefined in gmp-select event");
          }
        }
      );

      containerRef.current.appendChild(placeAutocomplete);
      console.log("PlaceAutocompleteElement appended to DOM");
      isInitializedRef.current = true;
    }
  }, [className]); // Only depend on className

  useEffect(() => {
    const loadGoogleMapsScript = async () => {
      if (!document.querySelector(`script[src*="maps.googleapis.com"]`)) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        script.onload = initializePlaceAutocomplete;
      } else {
        initializePlaceAutocomplete();
      }
    };

    if (!isInitializedRef.current) {
      loadGoogleMapsScript();
    }

    const currentContainer = containerRef.current;

    return () => {
      if (currentContainer && isInitializedRef.current) {
        currentContainer.innerHTML = "";
        placeAutocompleteRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, [apiKey, initializePlaceAutocomplete]);

  // Separate effect to handle value updates without reinitializing
  useEffect(() => {
    if (placeAutocompleteRef.current && value && isInitializedRef.current) {
      console.log("Setting initial value:", value);
      // @ts-expect-error: value property might not be in TypeScript definitions
      placeAutocompleteRef.current.value = value;
    }
  }, [value]);

  return <div ref={containerRef}></div>;
};

export default VenueInput;
