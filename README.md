# CIGAM MCP Server

A Model Context Protocol (MCP) server for integrating with CIGAM ERP REST API. Built with the official MCP SDK, this server provides tools to interact with various CIGAM modules including inventory, purchasing, invoicing, and financial management.

## Features

- 🔐 PIN-based authentication for secure API access
- 📦 Inventory management (materials, stock levels)
- 🛒 Purchase order management
- 📄 Invoice and billing operations
- 👥 Customer/supplier account management
- 🔧 Custom query support for advanced operations

## Installation

1. Clone the repository:
```bash
git clone https://github.com/marioteik/cigam-mcp.git
cd cigam-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` file with your CIGAM credentials:
```env
CIGAM_BASE_URL=https://your-cigam-instance.com.br/integrador
CIGAM_PIN=your-pin-here
```

## Usage

### Starting the Server

```bash
# Production mode
npm start

# Development mode with auto-reload
npm run dev
```

### Available Tools

The MCP server provides the following tools:

#### 1. **cigam_list_services**
Lists all available CIGAM integration services and domains.

#### 2. **cigam_get_materials**
Retrieves materials/products from CIGAM ERP.
- Parameters:
  - `filters`: Optional filters (code, description, modifiedAfter)
  - `limit`: Maximum records to return (default: 100)

#### 3. **cigam_get_stock**
Gets stock information for specific materials.
- Parameters:
  - `materialCode`: Material code (required)
  - `warehouse`: Optional warehouse code

#### 4. **cigam_get_purchase_orders**
Retrieves purchase orders with optional filtering.
- Parameters:
  - `filters`: Optional filters (orderNumber, supplier, status, dateFrom, dateTo)
  - `limit`: Maximum records (default: 100)

#### 5. **cigam_get_invoices**
Gets invoices from the system.
- Parameters:
  - `filters`: Optional filters (invoiceNumber, customer, status, dateFrom, dateTo)
  - `limit`: Maximum records (default: 100)

#### 6. **cigam_create_requisition**
Creates a new purchase requisition.
- Parameters:
  - `items`: Array of items to requisition
  - `requestor`: Requestor name/code
  - `priority`: Priority level (low, medium, high)

#### 7. **cigam_get_accounts**
Retrieves customer/supplier accounts.
- Parameters:
  - `filters`: Optional filters (accountCode, name, taxId, type)
  - `limit`: Maximum records (default: 100)

#### 8. **cigam_custom_query**
Executes custom queries to CIGAM API for advanced operations.
- Parameters:
  - `service`: Service endpoint
  - `method`: HTTP method (GET, POST, PUT, DELETE)
  - `params`: Query parameters or request body

## Integration with Claude Desktop

To use this MCP server with Claude Desktop:

1. Add the server configuration to your Claude Desktop settings:

```json
{
  "mcpServers": {
    "cigam": {
      "command": "node",
      "args": ["/path/to/cigam-mcp/src/index.js"],
      "env": {
        "CIGAM_BASE_URL": "https://your-cigam-instance.com.br/integrador",
        "CIGAM_PIN": "your-pin-here"
      }
    }
  }
}
```

2. Restart Claude Desktop to load the MCP server.

## API Documentation

The CIGAM API documentation is available at:
https://www.cigam.com.br/wiki/index.php?title=IN_CIGAM_Integrador

## Security Considerations

- **PIN Management**: Store your CIGAM PIN securely in environment variables
- **HTTPS Only**: Always use HTTPS connections to CIGAM servers
- **Access Control**: Configure appropriate PIN permissions in CIGAM
- **Audit Logging**: Monitor API usage through CIGAM's audit features

## Development

### Project Structure

```
cigam-mcp/
├── src/
│   ├── index.js        # MCP server entry point
│   └── cigam-client.js # CIGAM API client implementation
├── .env.example        # Environment variables template
├── .gitignore         # Git ignore configuration
├── package.json       # Node.js dependencies
└── README.md         # This file
```

### Testing

You can test the MCP server locally using the MCP inspector or by integrating with Claude Desktop in development mode.

## Troubleshooting

### Connection Issues
- Verify your CIGAM_BASE_URL is correct and accessible
- Check if your PIN has the necessary permissions
- Ensure your network allows HTTPS connections to CIGAM servers

### Authentication Errors
- Verify your PIN is correctly configured in `.env`
- Check PIN permissions in CIGAM administration panel
- Ensure the PIN hasn't expired

### Data Issues
- Check date format (ISO 8601: YYYY-MM-DD)
- Verify material codes and account codes exist in CIGAM
- Review CIGAM API logs for detailed error messages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC License - See LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: https://github.com/marioteik/cigam-mcp/issues
- CIGAM Documentation: https://www.cigam.com.br/wiki