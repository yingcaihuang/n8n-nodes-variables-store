# Installation Guide

## Prerequisites

- n8n instance (self-hosted or cloud)
- Node.js 16+ (for development)
- npm or yarn package manager

## Installation Methods

### Method 1: Community Nodes (Recommended)

This is the easiest way to install the package:

1. **Open n8n Settings**
   - Go to your n8n instance
   - Click on **Settings** in the left sidebar
   - Navigate to **Community Nodes**

2. **Install the Package**
   - Click **Install a community node**
   - Enter: `n8n-nodes-variables`
   - Click **Install**
   - Wait for installation to complete

3. **Restart n8n** (if required)
   - Some installations may require a restart
   - Check the installation status in Community Nodes

### Method 2: Manual Installation (Self-hosted)

For self-hosted n8n instances:

```bash
# Navigate to your n8n installation directory
cd /path/to/your/n8n

# Install the package
npm install n8n-nodes-variables

# Restart n8n
npm start
```

### Method 3: Docker Installation

If you're using n8n with Docker:

```bash
# Stop your n8n container
docker stop n8n

# Install the package in your n8n volume
docker run --rm -v n8n_data:/data -w /data node:16 npm install n8n-nodes-variables

# Start n8n again
docker start n8n
```

### Method 4: Docker Compose

Add to your docker-compose.yml:

```yaml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    environment:
      - N8N_COMMUNITY_PACKAGES_ENABLED=true
    volumes:
      - n8n_data:/home/node/.n8n
    # ... other configuration
```

Then install via the UI or by executing:

```bash
docker-compose exec n8n npm install n8n-nodes-variables
```

## Verification

After installation, verify the nodes are available:

1. **Create a New Workflow**
2. **Add a Node**
3. **Search for "Variables"**
4. **You should see:**
   - Variables Get
   - Variables Set
   - Variables Manager

## Configuration

### Storage Location

Variables are stored in:
- **Default**: `~/.n8n/variables/variables.json`
- **Custom**: Set `N8N_USER_FOLDER` environment variable

### Permissions

Ensure n8n has write permissions to the storage directory:

```bash
# Check permissions
ls -la ~/.n8n/

# Fix permissions if needed
chmod 755 ~/.n8n/
mkdir -p ~/.n8n/variables
chmod 755 ~/.n8n/variables
```

## First Usage

### Quick Test

1. **Add Variables Set Node**
   - Operation: Set Variable
   - Variable Name: `test`
   - Variable Value: `Hello World`
   - Value Type: String

2. **Add Variables Get Node**
   - Operation: Get Variable
   - Variable Name: `test`

3. **Execute the Workflow**
4. **Check the Output**

### Example Workflow

Import this basic workflow to test:

```json
{
  "name": "Variables Test",
  "nodes": [
    {
      "parameters": {},
      "name": "Start",
      "type": "n8n-nodes-base.start",
      "position": [240, 300]
    },
    {
      "parameters": {
        "operation": "set",
        "variableName": "greeting",
        "variableValue": "Hello from Variables!",
        "valueType": "string"
      },
      "name": "Set Greeting",
      "type": "n8n-nodes-variables.variablesSet",
      "position": [460, 300]
    },
    {
      "parameters": {
        "operation": "get",
        "variableName": "greeting"
      },
      "name": "Get Greeting",
      "type": "n8n-nodes-variables.variablesGet",
      "position": [680, 300]
    }
  ],
  "connections": {
    "Start": {
      "main": [
        [
          {
            "node": "Set Greeting",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Set Greeting": {
      "main": [
        [
          {
            "node": "Get Greeting",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## Troubleshooting

### Installation Issues

**Problem**: Package not found
```bash
# Solution: Check npm registry
npm search n8n-nodes-variables
```

**Problem**: Permission denied
```bash
# Solution: Fix permissions
sudo chown -R $(whoami) ~/.n8n/
```

**Problem**: Node not appearing in UI
```bash
# Solution: Clear n8n cache and restart
rm -rf ~/.n8n/cache/
# Restart n8n
```

### Runtime Issues

**Problem**: Variables not persisting
- Check storage directory permissions
- Verify JSON file is not corrupted
- Check disk space

**Problem**: Cannot read variables
- Ensure variables were set first
- Check variable names (case-sensitive)
- Verify storage file exists

### Docker Issues

**Problem**: Volume mounting
```yaml
# Ensure proper volume mounting
volumes:
  - n8n_data:/home/node/.n8n
  - ./custom-nodes:/home/node/.n8n/custom
```

**Problem**: Package installation in container
```bash
# Install inside container
docker exec -it n8n npm install n8n-nodes-variables
```

## Uninstallation

### Community Nodes Method
1. Go to Settings > Community Nodes
2. Find n8n-nodes-variables
3. Click Remove
4. Restart n8n

### Manual Method
```bash
npm uninstall n8n-nodes-variables
```

### Clean Up Data
```bash
# Remove variable storage (optional)
rm -rf ~/.n8n/variables/
```

## Support

- **GitHub Issues**: Report installation problems
- **n8n Community**: Get help from other users
- **Documentation**: Check README.md for usage details

## Next Steps

After successful installation:
1. Read the main README.md
2. Try the example workflows
3. Explore advanced features
4. Integrate with your existing workflows
