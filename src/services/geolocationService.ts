/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export class GeolocationService {
  private watchId: number | null = null;
  private callbacks: Array<(location: Location) => void> = [];
  private errorCallbacks: Array<(error: LocationError) => void> = [];

  /**
   * Request a single location update
   */
  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({
          code: 0,
          message: 'Geolocation is not supported by this browser',
        });
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          reject({
            code: error.code,
            message: this.getErrorMessage(error.code),
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Start watching location updates in real-time
   */
  watchLocation(
    onLocation: (location: Location) => void,
    onError?: (error: LocationError) => void
  ): void {
    if (!navigator.geolocation) {
      const error = {
        code: 0,
        message: 'Geolocation is not supported by this browser',
      };
      onError?.(error);
      return;
    }

    // Add callbacks to list
    this.callbacks.push(onLocation);
    if (onError) {
      this.errorCallbacks.push(onError);
    }

    // Only start watching if not already watching
    if (this.watchId === null) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          this.callbacks.forEach((cb) => cb(location));
        },
        (error) => {
          const errorObj = {
            code: error.code,
            message: this.getErrorMessage(error.code),
          };
          this.errorCallbacks.forEach((cb) => cb(errorObj));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        }
      );
    }
  }

  /**
   * Stop watching location updates
   */
  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.callbacks = [];
      this.errorCallbacks = [];
    }
  }

  /**
   * Clear all callbacks
   */
  clearCallbacks(): void {
    this.callbacks = [];
    this.errorCallbacks = [];
  }

  /**
   * Calculate distance between two coordinates in kilometers
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Get human-readable error message
   */
  private getErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return 'Permission denied. Please enable location access in your browser settings.';
      case 2:
        return 'Location information is unavailable.';
      case 3:
        return 'Location request timed out.';
      default:
        return 'An unknown error occurred while retrieving location.';
    }
  }
}

export const geolocationService = new GeolocationService();