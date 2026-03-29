import { Injectable } from '@angular/core';
import { ICONS, ICON_GROUPS, IconKey } from '../constants/icons';

/**
 * Icon Service for Smart Grampanchayat
 * Provides utility methods for working with icons
 */
@Injectable({
  providedIn: 'root'
})
export class IconService {
  
  /**
   * Get an icon by key
   */
  getIcon(key: IconKey): string {
    return ICONS[key];
  }

  /**
   * Get all icons
   */
  getAllIcons() {
    return ICONS;
  }

  /**
   * Get icon groups
   */
  getIconGroups() {
    return ICON_GROUPS;
  }

  /**
   * Get status icons for common states
   */
  getStatusIcon(status: 'success' | 'error' | 'warning' | 'pending' | 'in_progress'): string {
    const statusMap = {
      success: ICONS.SUCCESS,
      error: ICONS.ERROR,
      warning: ICONS.WARNING,
      pending: ICONS.PENDING,
      in_progress: ICONS.IN_PROGRESS
    };
    return statusMap[status];
  }

  /**
   * Get service-specific icons
   */
  getServiceIcon(service: 'certificate' | 'property' | 'tax' | 'electricity' | 'water'): string {
    const serviceMap = {
      certificate: ICONS.CERTIFICATE,
      property: ICONS.PROPERTY,
      tax: ICONS.TAX_PAYMENT,
      electricity: ICONS.ELECTRICITY,
      water: ICONS.WATER
    };
    return serviceMap[service];
  }

  /**
   * Create formatted text with icon
   */
  withIcon(iconKey: IconKey, text: string, separator: string = ' '): string {
    return `${this.getIcon(iconKey)}${separator}${text}`;
  }

  /**
   * Search icons by name (useful for development)
   */
  searchIcons(searchTerm: string): Array<{key: string, icon: string}> {
    const results: Array<{key: string, icon: string}> = [];
    
    Object.entries(ICONS).forEach(([key, icon]) => {
      if (key.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push({ key, icon });
      }
    });
    
    return results;
  }
}