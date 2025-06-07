import axios from 'axios';

// Base mock API functionality
const api = {
  get: async <T>(url: string): Promise<T> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if this is a request for an individual item
    const urlParts = url.split('/');
    const id = urlParts[urlParts.length - 1];
    const isItemRequest = !isNaN(Number(id));
    
    if (isItemRequest) {
      // Get the collection URL by removing the ID
      const collectionUrl = urlParts.slice(0, -1).join('/');
      
      // Get the collection data
      const collectionData = localStorage.getItem(collectionUrl);
      if (!collectionData) {
        throw new Error('Not found');
      }
      
      // Find the specific item
      const items = JSON.parse(collectionData);
      const item = items.find((item: any) => item.id === id);
      
      if (!item) {
        throw new Error('Not found');
      }
      
      return item as T;
    }
    
    // Handle collection requests
    const storedData = localStorage.getItem(url);
    if (storedData) {
      return JSON.parse(storedData) as T;
    }
    
    // Return empty array as default for collection endpoints
    if (url.includes('stocks') || url.includes('customers') || url.includes('bills')) {
      return [] as unknown as T;
    }
    
    throw new Error('Not found');
  },
  
  post: async <T>(url: string, data: any): Promise<T> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Add ID and timestamps
    const newItem = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Get existing data
    const existingDataStr = localStorage.getItem(url);
    const existingData = existingDataStr ? JSON.parse(existingDataStr) : [];
    
    // Add new item
    const updatedData = [...existingData, newItem];
    
    // Save to localStorage
    localStorage.setItem(url, JSON.stringify(updatedData));
    
    return newItem as T;
  },
  
  put: async <T>(url: string, data: any): Promise<T> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Extract ID from URL
    const urlParts = url.split('/');
    const id = urlParts[urlParts.length - 1];
    const collectionUrl = urlParts.slice(0, -1).join('/');
    
    // Update timestamp
    const updatedItem = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    // Get existing data
    const existingDataStr = localStorage.getItem(collectionUrl);
    if (!existingDataStr) {
      throw new Error('Collection not found');
    }
    
    const existingData = JSON.parse(existingDataStr);
    
    // Update item
    const updatedData = existingData.map((item: any) => 
      item.id === id ? updatedItem : item
    );
    
    // Save to localStorage
    localStorage.setItem(collectionUrl, JSON.stringify(updatedData));
    
    return updatedItem as T;
  },
  
  delete: async (url: string): Promise<void> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Extract ID from URL
    const urlParts = url.split('/');
    const id = urlParts[urlParts.length - 1];
    const collectionUrl = urlParts.slice(0, -1).join('/');
    
    // Get existing data
    const existingDataStr = localStorage.getItem(collectionUrl);
    if (!existingDataStr) {
      throw new Error('Collection not found');
    }
    
    const existingData = JSON.parse(existingDataStr);
    
    // Remove item
    const updatedData = existingData.filter((item: any) => item.id !== id);
    
    // Save to localStorage
    localStorage.setItem(collectionUrl, JSON.stringify(updatedData));
  }
};

export default api;