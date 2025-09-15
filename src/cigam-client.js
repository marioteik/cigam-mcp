import axios from 'axios';

export class CigamClient {
  constructor({ baseUrl, pin }) {
    if (!baseUrl || !pin) {
      throw new Error('CIGAM_BASE_URL and CIGAM_PIN environment variables are required');
    }
    
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.pin = pin;
    
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000, // 30 seconds timeout
    });
    
    // Add request interceptor for authentication
    this.client.interceptors.request.use((config) => {
      // Add PIN to all requests
      if (config.params) {
        config.params.pin = this.pin;
      } else {
        config.params = { pin: this.pin };
      }
      return config;
    });
    
    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response) {
          // Server responded with error
          throw new Error(`CIGAM API Error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
        } else if (error.request) {
          // Request made but no response
          throw new Error('No response from CIGAM server');
        } else {
          // Request setup error
          throw new Error(`Request error: ${error.message}`);
        }
      }
    );
  }
  
  // Helper method to build query parameters
  buildQueryParams(filters = {}) {
    const params = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Convert camelCase to snake_case for API compatibility
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        params[snakeKey] = value;
      }
    });
    
    return params;
  }
  
  // Get materials/products
  async getMaterials(filters = {}, limit = 100) {
    const params = {
      ...this.buildQueryParams(filters),
      limit,
    };
    
    return await this.client.get('/api/v1/materials', { params });
  }
  
  // Get stock information
  async getStock(materialCode, warehouse = null) {
    const params = {
      material_code: materialCode,
    };
    
    if (warehouse) {
      params.warehouse = warehouse;
    }
    
    return await this.client.get('/api/v1/stock', { params });
  }
  
  // Get purchase orders
  async getPurchaseOrders(filters = {}, limit = 100) {
    const params = {
      ...this.buildQueryParams(filters),
      limit,
    };
    
    return await this.client.get('/api/v1/purchase_orders', { params });
  }
  
  // Get invoices
  async getInvoices(filters = {}, limit = 100) {
    const params = {
      ...this.buildQueryParams(filters),
      limit,
    };
    
    return await this.client.get('/api/v1/invoices', { params });
  }
  
  // Create purchase requisition
  async createRequisition(requisitionData) {
    const payload = {
      items: requisitionData.items.map(item => ({
        material_code: item.materialCode,
        quantity: item.quantity,
        unit: item.unit || 'UN',
        required_date: item.requiredDate,
        cost_center: item.costCenter,
        notes: item.notes,
      })),
      requestor: requisitionData.requestor,
      priority: requisitionData.priority || 'medium',
      request_date: new Date().toISOString(),
    };
    
    return await this.client.post('/api/v1/requisitions', payload);
  }
  
  // Get accounts/customers
  async getAccounts(filters = {}, limit = 100) {
    const params = {
      ...this.buildQueryParams(filters),
      limit,
    };
    
    return await this.client.get('/api/v1/accounts', { params });
  }
  
  // Execute custom query
  async customQuery(service, method = 'GET', params = {}) {
    const config = {
      method: method.toUpperCase(),
      url: service.startsWith('/') ? service : `/api/v1/${service}`,
    };
    
    if (['GET', 'DELETE'].includes(config.method)) {
      config.params = this.buildQueryParams(params);
    } else {
      config.data = params;
    }
    
    return await this.client.request(config);
  }
  
  // Helper method to validate date format
  static isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }
  
  // Helper method to format date for CIGAM API
  static formatDate(date) {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
}