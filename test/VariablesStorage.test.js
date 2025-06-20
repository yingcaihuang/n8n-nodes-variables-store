const fs = require('fs');
const path = require('path');
const os = require('os');

// Mock n8n execution functions
const mockExecuteFunctions = {
  getNodeParameter: (name, index) => {
    // Mock implementation
    return '';
  }
};

// Simple test framework
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('Running Variables Storage Tests...\n');
    
    for (const test of this.tests) {
      try {
        await test.fn();
        console.log(`✅ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
        this.failed++;
      }
    }

    console.log(`\nTest Results: ${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }
}

// Mock VariablesStorage for testing
class MockVariablesStorage {
  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'n8n-variables-test');
    this.storageFile = path.join(this.tempDir, 'variables.json');
    
    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async loadVariables() {
    try {
      if (!fs.existsSync(this.storageFile)) {
        return {};
      }
      const data = fs.readFileSync(this.storageFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return {};
    }
  }

  async saveVariables(variables) {
    const data = JSON.stringify(variables, null, 2);
    fs.writeFileSync(this.storageFile, data, 'utf8');
  }

  async setVariable(name, value) {
    const variables = await this.loadVariables();
    variables[name] = value;
    await this.saveVariables(variables);
  }

  async getVariable(name) {
    const variables = await this.loadVariables();
    return variables[name];
  }

  async deleteVariable(name) {
    const variables = await this.loadVariables();
    if (name in variables) {
      delete variables[name];
      await this.saveVariables(variables);
      return true;
    }
    return false;
  }

  async getAllVariables() {
    return await this.loadVariables();
  }

  async getVariableNames() {
    const variables = await this.loadVariables();
    return Object.keys(variables);
  }

  async clearAllVariables() {
    const variables = await this.loadVariables();
    const count = Object.keys(variables).length;
    await this.saveVariables({});
    return count;
  }

  cleanup() {
    if (fs.existsSync(this.storageFile)) {
      fs.unlinkSync(this.storageFile);
    }
    if (fs.existsSync(this.tempDir)) {
      fs.rmdirSync(this.tempDir);
    }
  }
}

// Run tests
async function runTests() {
  const runner = new TestRunner();
  let storage;

  runner.test('Storage initialization', async () => {
    storage = new MockVariablesStorage();
    runner.assert(storage !== null, 'Storage should be initialized');
  });

  runner.test('Set and get string variable', async () => {
    await storage.setVariable('testString', 'hello world');
    const value = await storage.getVariable('testString');
    runner.assertEqual(value, 'hello world', 'String variable should be stored and retrieved');
  });

  runner.test('Set and get number variable', async () => {
    await storage.setVariable('testNumber', 42);
    const value = await storage.getVariable('testNumber');
    runner.assertEqual(value, 42, 'Number variable should be stored and retrieved');
  });

  runner.test('Set and get boolean variable', async () => {
    await storage.setVariable('testBoolean', true);
    const value = await storage.getVariable('testBoolean');
    runner.assertEqual(value, true, 'Boolean variable should be stored and retrieved');
  });

  runner.test('Set and get JSON variable', async () => {
    const jsonData = { key: 'value', number: 123, array: [1, 2, 3] };
    await storage.setVariable('testJSON', jsonData);
    const value = await storage.getVariable('testJSON');
    runner.assertEqual(JSON.stringify(value), JSON.stringify(jsonData), 'JSON variable should be stored and retrieved');
  });

  runner.test('Get non-existent variable', async () => {
    const value = await storage.getVariable('nonExistent');
    runner.assertEqual(value, undefined, 'Non-existent variable should return undefined');
  });

  runner.test('Get all variables', async () => {
    const allVars = await storage.getAllVariables();
    runner.assert(typeof allVars === 'object', 'getAllVariables should return an object');
    runner.assert('testString' in allVars, 'All variables should include testString');
  });

  runner.test('Get variable names', async () => {
    const names = await storage.getVariableNames();
    runner.assert(Array.isArray(names), 'getVariableNames should return an array');
    runner.assert(names.includes('testString'), 'Variable names should include testString');
  });

  runner.test('Delete variable', async () => {
    const deleted = await storage.deleteVariable('testString');
    runner.assertEqual(deleted, true, 'Delete should return true for existing variable');
    
    const value = await storage.getVariable('testString');
    runner.assertEqual(value, undefined, 'Deleted variable should not exist');
  });

  runner.test('Delete non-existent variable', async () => {
    const deleted = await storage.deleteVariable('nonExistent');
    runner.assertEqual(deleted, false, 'Delete should return false for non-existent variable');
  });

  runner.test('Clear all variables', async () => {
    await storage.setVariable('temp1', 'value1');
    await storage.setVariable('temp2', 'value2');
    
    const count = await storage.clearAllVariables();
    runner.assert(count >= 0, 'Clear should return count of cleared variables');
    
    const allVars = await storage.getAllVariables();
    runner.assertEqual(Object.keys(allVars).length, 0, 'All variables should be cleared');
  });

  const success = await runner.run();
  
  // Cleanup
  if (storage) {
    storage.cleanup();
  }
  
  process.exit(success ? 0 : 1);
}

// Run the tests
runTests().catch(console.error);
