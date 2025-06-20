# Publishing Guide

## Pre-publish Checklist

- [x] All tests pass (`npm test`)
- [x] Code builds successfully (`npm run build`)
- [x] Linting passes (`npm run lint`)
- [x] Documentation is complete
- [x] Examples are provided
- [x] Version number is correct in package.json

## Publishing Steps

### 1. Final Verification

```bash
# Run all checks
npm run prepublishOnly

# Verify package contents
npm pack --dry-run
```

### 2. Publish to npm

```bash
# Login to npm (if not already logged in)
npm login

# Publish the package
npm publish

# Or for scoped packages
npm publish --access public
```

### 3. Verify Publication

```bash
# Check if package is available
npm view n8n-nodes-variables

# Test installation
npm install n8n-nodes-variables
```

## Post-publish Tasks

1. **Create GitHub Release**
   - Tag the version
   - Add release notes
   - Include installation instructions

2. **Update Documentation**
   - Update README if needed
   - Add to n8n community resources

3. **Announce**
   - n8n Community Forum
   - Social media
   - Documentation sites

## Version Management

Follow semantic versioning:
- **Patch** (1.0.1): Bug fixes
- **Minor** (1.1.0): New features, backward compatible
- **Major** (2.0.0): Breaking changes

```bash
# Update version
npm version patch|minor|major

# This will:
# 1. Update package.json
# 2. Create git tag
# 3. Commit changes
```

## Package Contents

The published package includes:
- `dist/` - Compiled JavaScript and type definitions
- `package.json` - Package metadata
- `README.md` - Documentation
- `LICENSE` - MIT license

## Troubleshooting

### Common Issues

**Problem**: Package name already exists
```bash
# Solution: Choose a different name or use scoped package
npm publish --access public @yourname/n8n-nodes-variables
```

**Problem**: Authentication failed
```bash
# Solution: Login again
npm logout
npm login
```

**Problem**: Build fails
```bash
# Solution: Clean and rebuild
rm -rf dist/ node_modules/
npm install
npm run build
```

### Testing Before Publish

```bash
# Create a test package
npm pack

# This creates n8n-nodes-variables-1.0.0.tgz
# Test install from local file
npm install ./n8n-nodes-variables-1.0.0.tgz
```

## Maintenance

### Regular Updates

1. **Dependencies**: Keep n8n-workflow updated
2. **Security**: Monitor for vulnerabilities
3. **Compatibility**: Test with new n8n versions
4. **Features**: Add requested functionality

### Support

- Monitor GitHub issues
- Respond to community questions
- Update documentation as needed
- Fix bugs promptly

## Success Metrics

Track these metrics post-publish:
- Download count
- GitHub stars/forks
- Community feedback
- Issue reports
- Feature requests

## Next Steps

After successful publication:
1. Monitor initial adoption
2. Gather user feedback
3. Plan future improvements
4. Consider additional nodes
5. Build community around the project
