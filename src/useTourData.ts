import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Doc, Id } from '../convex/_generated/dataModel';

// The full TourConfig, including steps. This is constructed from Doc<'tours'> and Doc<'steps'>[]
export interface TourConfig extends Doc<'tours'> {
    steps: Doc<'steps'>[];
}

export function useTourData(tourId: string, apiKey?: string) {
    const [data, setData] = useState<TourConfig | null>(null);
    const [isValidApiKeyStatus, setIsValidApiKeyStatus] = useState<boolean | null>(null);

    const isKeyValid = useQuery(api.apiKeys.validate, apiKey ? { key: apiKey } : 'skip');

    // Use as unknown as Id<'tours'> because tourId is a string from data-tour-id,
    // but Convex's Id<'tours'> is a branded string type.
    const tourIdAsId = tourId as unknown as Id<'tours'>;
    const realTour = useQuery(api.tours.get, { tourId: tourIdAsId });
    const realSteps = useQuery(api.steps.list, { tourId: tourIdAsId });

    useEffect(() => {
        if (isKeyValid !== undefined) {
            setIsValidApiKeyStatus(isKeyValid);
        }

        if (isKeyValid !== true) {
            if (isKeyValid === false) console.error('WalkmanJS: Invalid API Key');
            setData(null);
            return;
        }

        if (realTour && realSteps) {
            // Check if targeting is explicitly null or undefined, and if so,
            // construct the fullConfig without targeting, otherwise spread it.
            const fullConfig: TourConfig = {
                ...realTour,
                steps: realSteps,
            };

            // Only call shouldShowTour if targeting is defined on realTour, otherwise assume no targeting needed
            if (!fullConfig.targeting || shouldShowTour(fullConfig.targeting, window.location.href)) {
                setData(fullConfig);
            } else {
                console.log('WalkmanJS: Targeting rules not met for this URL.');
                setData(null);
            }
        }
    }, [isKeyValid, realTour, realSteps]);

    // This function can be defined here or moved outside if it doesn't depend on hook state.
    // It uses Doc<'tours'>['targeting'] type directly from the generated schema.
    const shouldShowTour = (targeting: Doc<'tours'>['targeting'], currentUrl: string) => {
        if (!targeting?.urlPattern) return true;

        switch (targeting.urlMatchType) {
            case 'exact':
                return currentUrl === targeting.urlPattern;
            case 'contains':
                return currentUrl.includes(targeting.urlPattern);
            case 'regex':
                try {
                    const regex = new RegExp(targeting.urlPattern);
                    return regex.test(currentUrl);
                } catch (e) {
                    console.error('WalkmanJS: Invalid regex pattern provided:', targeting.urlPattern, e);
                    return false;
                }
            default:
                return false;
        }
    };

    return { tourData: data, isValidApiKey: isValidApiKeyStatus };
}