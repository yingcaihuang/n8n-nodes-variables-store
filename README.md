# n8n-nodes-variables

![n8n.io - Workflow Automation](https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png)

A community node package for n8n that provides global variables functionality - an alternative to the paid Variables feature.

## Features

- **Variables Get**: Retrieve global variables across workflows
- **Variables Set**: Store and manage global variables
- **Variables Manager**: Import/export and manage variable collections
- **Persistent Storage**: Variables are stored persistently in JSON files
- **Type Support**: String, Number, Boolean, and JSON data types
- **Cross-workflow Access**: Variables accessible across all workflows

## Installation

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes** in your n8n instance
2. Click **Install a community node**
3. Enter `n8n-nodes-variables`
4. Click **Install**

### Manual Installation

```bash
# In your n8n root directory
npm install n8n-nodes-variables
```

## Usage

### Variables Set Node

Use this node to create and update global variables:

**Operations:**
- **Set Variable**: Store a single variable with specified type
- **Set Multiple Variables**: Store multiple variables from a JSON object
- **Delete Variable**: Remove a specific variable
- **Clear All Variables**: Remove all stored variables

**Example - Set a Variable:**
```json
{
  "operation": "set",
  "variableName": "apiUrl",
  "variableValue": "https://api.example.com",
  "valueType": "string"
}
```

### Variables Get Node

Use this node to retrieve stored variables:

**Operations:**
- **Get Variable**: Retrieve a single variable value
- **Get All Variables**: Get all variables as an object
- **List Variable Names**: Get array of all variable names

**Example - Get a Variable:**
```json
{
  "operation": "get",
  "variableName": "apiUrl",
  "defaultValue": "https://default.api.com",
  "failOnMissing": false
}
```

### Variables Manager Node

Use this node for advanced variable management:

**Operations:**
- **Export Variables**: Export all variables as JSON
- **Import Variables**: Import variables from JSON data
- **Get Info**: Get storage information and statistics
- **Backup Variables**: Create a backup of current variables

## Variable Access

Unlike n8n's paid Variables feature that uses `$vars.variableName`, this community solution requires using the nodes to access variables. However, you can create a workflow pattern to simulate the `$vars` behavior:

1. Use **Variables Get** node at the start of workflows
2. Reference the output in subsequent nodes
3. Use expressions like `{{$node["Variables Get"].json["value"]}}`

## Storage

Variables are stored in JSON files in your n8n user directory:
- Location: `~/.n8n/variables/variables.json`
- Format: JSON key-value pairs
- Persistent across n8n restarts

## Data Types

Supported variable types:
- **String**: Text values
- **Number**: Numeric values (integers and floats)
- **Boolean**: true/false values
- **JSON**: Complex objects and arrays

## Examples

### Basic Variable Management

```javascript
// Set a configuration variable
{
  "operation": "set",
  "variableName": "environment",
  "variableValue": "production",
  "valueType": "string"
}

// Get the variable in another workflow
{
  "operation": "get",
  "variableName": "environment",
  "defaultValue": "development"
}
```

### Bulk Variable Operations

```javascript
// Set multiple variables at once
{
  "operation": "setMultiple",
  "variablesObject": {
    "apiUrl": "https://api.example.com",
    "timeout": 5000,
    "retryCount": 3,
    "debugMode": true
  }
}

// Export all variables for backup
{
  "operation": "export"
}
```

## Error Handling

- **Missing Variables**: Use `defaultValue` or `failOnMissing` options
- **Type Conversion**: Automatic type conversion based on `valueType`
- **Storage Errors**: Graceful error handling with detailed messages
- **Continue on Fail**: Supported for all operations

## Comparison with n8n Variables

| Feature | n8n Variables (Paid) | n8n-nodes-variables (Free) |
|---------|---------------------|---------------------------|
| Global Access | `$vars.name` | Node-based access |
| Persistence | ✅ | ✅ |
| Type Support | ✅ | ✅ |
| Cross-workflow | ✅ | ✅ |
| Import/Export | ❌ | ✅ |
| Backup/Restore | ❌ | ✅ |
| Cost | Paid feature | Free |

## Troubleshooting

### Variables Not Persisting
- Check n8n user directory permissions
- Ensure `~/.n8n/variables/` directory exists
- Verify JSON file is not corrupted

### Performance Considerations
- Variables are loaded from disk on each access
- Consider caching for high-frequency access
- Large JSON objects may impact performance

### Migration from n8n Variables
1. Export existing variables (if possible)
2. Use Variables Manager to import
3. Update workflows to use new nodes
4. Test thoroughly before production use

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- GitHub Issues: Report bugs and feature requests
- n8n Community: Discuss usage and get help
- Documentation: Check this README and inline help

## Changelog

### v1.0.0
- Initial release
- Variables Get, Set, and Manager nodes
- Persistent JSON storage
- Type support for string, number, boolean, JSON
- Import/export functionality
- Comprehensive error handling
