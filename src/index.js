#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { CigamClient } from './cigam-client.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize CIGAM client
const cigamClient = new CigamClient({
  baseUrl: process.env.CIGAM_BASE_URL,
  pin: process.env.CIGAM_PIN,
});

// Create MCP server
const server = new Server(
  {
    name: 'cigam-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
const TOOLS = [
  {
    name: 'cigam_list_services',
    description: 'List all available CIGAM integration services',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'cigam_get_materials',
    description: 'Get materials/products from CIGAM ERP',
    inputSchema: {
      type: 'object',
      properties: {
        filters: {
          type: 'object',
          description: 'Optional filters for the query',
          properties: {
            code: { type: 'string', description: 'Material code' },
            description: { type: 'string', description: 'Material description' },
            modifiedAfter: { type: 'string', description: 'ISO date string for modified after filter' },
          },
        },
        limit: {
          type: 'number',
          description: 'Maximum number of records to return',
          default: 100,
        },
      },
    },
  },
  {
    name: 'cigam_get_stock',
    description: 'Get stock information from CIGAM ERP',
    inputSchema: {
      type: 'object',
      properties: {
        materialCode: {
          type: 'string',
          description: 'Material code to get stock for',
        },
        warehouse: {
          type: 'string',
          description: 'Optional warehouse code',
        },
      },
      required: ['materialCode'],
    },
  },
  {
    name: 'cigam_get_purchase_orders',
    description: 'Get purchase orders from CIGAM ERP',
    inputSchema: {
      type: 'object',
      properties: {
        filters: {
          type: 'object',
          description: 'Optional filters for the query',
          properties: {
            orderNumber: { type: 'string', description: 'Purchase order number' },
            supplier: { type: 'string', description: 'Supplier code or name' },
            status: { type: 'string', description: 'Order status' },
            dateFrom: { type: 'string', description: 'ISO date string for date from filter' },
            dateTo: { type: 'string', description: 'ISO date string for date to filter' },
          },
        },
        limit: {
          type: 'number',
          description: 'Maximum number of records to return',
          default: 100,
        },
      },
    },
  },
  {
    name: 'cigam_get_invoices',
    description: 'Get invoices from CIGAM ERP',
    inputSchema: {
      type: 'object',
      properties: {
        filters: {
          type: 'object',
          description: 'Optional filters for the query',
          properties: {
            invoiceNumber: { type: 'string', description: 'Invoice number' },
            customer: { type: 'string', description: 'Customer code or name' },
            status: { type: 'string', description: 'Invoice status' },
            dateFrom: { type: 'string', description: 'ISO date string for date from filter' },
            dateTo: { type: 'string', description: 'ISO date string for date to filter' },
          },
        },
        limit: {
          type: 'number',
          description: 'Maximum number of records to return',
          default: 100,
        },
      },
    },
  },
  {
    name: 'cigam_create_requisition',
    description: 'Create a purchase requisition in CIGAM ERP',
    inputSchema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          description: 'List of items to requisition',
          items: {
            type: 'object',
            properties: {
              materialCode: { type: 'string', description: 'Material code' },
              quantity: { type: 'number', description: 'Quantity to requisition' },
              unit: { type: 'string', description: 'Unit of measure' },
              requiredDate: { type: 'string', description: 'ISO date string for required date' },
              costCenter: { type: 'string', description: 'Cost center code' },
              notes: { type: 'string', description: 'Optional notes' },
            },
            required: ['materialCode', 'quantity'],
          },
        },
        requestor: {
          type: 'string',
          description: 'Requestor name or code',
        },
        priority: {
          type: 'string',
          description: 'Priority level (low, medium, high)',
          default: 'medium',
        },
      },
      required: ['items'],
    },
  },
  {
    name: 'cigam_get_accounts',
    description: 'Get customer accounts from CIGAM ERP',
    inputSchema: {
      type: 'object',
      properties: {
        filters: {
          type: 'object',
          description: 'Optional filters for the query',
          properties: {
            accountCode: { type: 'string', description: 'Account code' },
            name: { type: 'string', description: 'Account name' },
            taxId: { type: 'string', description: 'Tax ID (CNPJ/CPF)' },
            type: { type: 'string', description: 'Account type (customer, supplier, both)' },
          },
        },
        limit: {
          type: 'number',
          description: 'Maximum number of records to return',
          default: 100,
        },
      },
    },
  },
  {
    name: 'cigam_custom_query',
    description: 'Execute a custom query to CIGAM API',
    inputSchema: {
      type: 'object',
      properties: {
        service: {
          type: 'string',
          description: 'Service name/endpoint',
        },
        method: {
          type: 'string',
          description: 'HTTP method (GET, POST, PUT, DELETE)',
          default: 'GET',
        },
        params: {
          type: 'object',
          description: 'Query parameters or request body',
        },
      },
      required: ['service'],
    },
  },
];

// Handler for listing tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

// Handler for tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'cigam_list_services':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                services: [
                  { domain: 'Compras', services: ['Material Requisition', 'Purchase Orders'] },
                  { domain: 'Estoque', services: ['Material Registration', 'Stock Movements'] },
                  { domain: 'Faturamento', services: ['Invoice Registration', 'Order Registration'] },
                  { domain: 'Financeiro', services: ['Account Registration', 'Contracts'] },
                  { domain: 'Fiscal', services: ['Tax Documents', 'Fiscal Notes'] },
                ],
              }, null, 2),
            },
          ],
        };

      case 'cigam_get_materials': {
        const materials = await cigamClient.getMaterials(args.filters || {}, args.limit || 100);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ materials }, null, 2),
            },
          ],
        };
      }

      case 'cigam_get_stock': {
        const stock = await cigamClient.getStock(args.materialCode, args.warehouse);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ stock }, null, 2),
            },
          ],
        };
      }

      case 'cigam_get_purchase_orders': {
        const orders = await cigamClient.getPurchaseOrders(args.filters || {}, args.limit || 100);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ orders }, null, 2),
            },
          ],
        };
      }

      case 'cigam_get_invoices': {
        const invoices = await cigamClient.getInvoices(args.filters || {}, args.limit || 100);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ invoices }, null, 2),
            },
          ],
        };
      }

      case 'cigam_create_requisition': {
        const requisition = await cigamClient.createRequisition({
          items: args.items,
          requestor: args.requestor,
          priority: args.priority || 'medium',
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ requisition }, null, 2),
            },
          ],
        };
      }

      case 'cigam_get_accounts': {
        const accounts = await cigamClient.getAccounts(args.filters || {}, args.limit || 100);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ accounts }, null, 2),
            },
          ],
        };
      }

      case 'cigam_custom_query': {
        const result = await cigamClient.customQuery(
          args.service,
          args.method || 'GET',
          args.params || {}
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ result }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: error.message }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('CIGAM MCP server running...');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});