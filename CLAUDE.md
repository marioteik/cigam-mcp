# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

CIGAM MCP Server - A Model Context Protocol (MCP) server for integrating with CIGAM ERP REST API. Built with Node.js and the official @modelcontextprotocol/sdk, providing tools to interact with CIGAM's inventory, purchasing, invoicing, and financial modules.

## Common Development Commands

```bash
# Install dependencies
npm install

# Start server (production)
npm start

# Start server (development with auto-reload)
npm run dev

# Create environment configuration
cp .env.example .env
```

## Architecture

### Core Components

1. **MCP Server** (`src/index.js`): Main entry point using @modelcontextprotocol/sdk to expose CIGAM tools
2. **CIGAM Client** (`src/cigam-client.js`): Axios-based HTTP client handling:
   - PIN-based authentication via request interceptor
   - Error handling and response transformation
   - Query parameter building with camelCase to snake_case conversion

### Authentication Flow

- Uses PIN-based authentication (configured via `CIGAM_PIN` env var)
- PIN automatically added to all requests via axios interceptor
- No user session management - stateless PIN auth

### Available MCP Tools

- `cigam_list_services`: List available CIGAM services
- `cigam_get_materials`: Retrieve products/materials
- `cigam_get_stock`: Get stock levels
- `cigam_get_purchase_orders`: Fetch purchase orders
- `cigam_get_invoices`: Retrieve invoices
- `cigam_create_requisition`: Create purchase requisitions
- `cigam_get_accounts`: Get customer/supplier accounts
- `cigam_custom_query`: Execute custom API queries

## Environment Configuration

Required environment variables in `.env`:
- `CIGAM_BASE_URL`: CIGAM API endpoint (e.g., https://instance.com.br/integrador)
- `CIGAM_PIN`: Authentication PIN from CIGAM
- `LOG_LEVEL`: Optional logging level (debug, info, warn, error)