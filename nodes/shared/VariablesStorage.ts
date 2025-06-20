import { IExecuteFunctions } from 'n8n-workflow';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class VariablesStorage {
  private executeFunctions: IExecuteFunctions;
  private storageFile: string;

  constructor(executeFunctions: IExecuteFunctions) {
    this.executeFunctions = executeFunctions;
    
    // Use n8n's user directory or fallback to system temp
    const n8nUserDir = process.env.N8N_USER_FOLDER || path.join(os.homedir(), '.n8n');
    const storageDir = path.join(n8nUserDir, 'variables');
    
    // Ensure directory exists
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    
    this.storageFile = path.join(storageDir, 'variables.json');
  }

  /**
   * Load variables from storage file
   */
  private async loadVariables(): Promise<Record<string, any>> {
    try {
      if (!fs.existsSync(this.storageFile)) {
        return {};
      }
      
      const data = fs.readFileSync(this.storageFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // If file is corrupted or doesn't exist, return empty object
      return {};
    }
  }

  /**
   * Save variables to storage file
   */
  private async saveVariables(variables: Record<string, any>): Promise<void> {
    try {
      const data = JSON.stringify(variables, null, 2);
      fs.writeFileSync(this.storageFile, data, 'utf8');
    } catch (error) {
      throw new Error(`Failed to save variables: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get a single variable value
   */
  async getVariable(name: string): Promise<any> {
    const variables = await this.loadVariables();
    return variables[name];
  }

  /**
   * Set a single variable
   */
  async setVariable(name: string, value: any): Promise<void> {
    const variables = await this.loadVariables();
    variables[name] = value;
    await this.saveVariables(variables);
  }

  /**
   * Delete a single variable
   */
  async deleteVariable(name: string): Promise<boolean> {
    const variables = await this.loadVariables();
    
    if (name in variables) {
      delete variables[name];
      await this.saveVariables(variables);
      return true;
    }
    
    return false;
  }

  /**
   * Get all variables
   */
  async getAllVariables(): Promise<Record<string, any>> {
    return await this.loadVariables();
  }

  /**
   * Get all variable names
   */
  async getVariableNames(): Promise<string[]> {
    const variables = await this.loadVariables();
    return Object.keys(variables);
  }

  /**
   * Clear all variables
   */
  async clearAllVariables(): Promise<number> {
    const variables = await this.loadVariables();
    const count = Object.keys(variables).length;
    
    await this.saveVariables({});
    
    return count;
  }

  /**
   * Check if a variable exists
   */
  async hasVariable(name: string): Promise<boolean> {
    const variables = await this.loadVariables();
    return name in variables;
  }

  /**
   * Set multiple variables at once
   */
  async setMultipleVariables(variablesObj: Record<string, any>): Promise<void> {
    const variables = await this.loadVariables();
    
    // Merge new variables with existing ones
    Object.assign(variables, variablesObj);
    
    await this.saveVariables(variables);
  }

  /**
   * Get variables count
   */
  async getVariablesCount(): Promise<number> {
    const variables = await this.loadVariables();
    return Object.keys(variables).length;
  }

  /**
   * Export variables as JSON string
   */
  async exportVariables(): Promise<string> {
    const variables = await this.loadVariables();
    return JSON.stringify(variables, null, 2);
  }

  /**
   * Import variables from JSON string
   */
  async importVariables(jsonString: string, merge: boolean = false): Promise<void> {
    try {
      const importedVariables = JSON.parse(jsonString);
      
      if (merge) {
        const existingVariables = await this.loadVariables();
        Object.assign(existingVariables, importedVariables);
        await this.saveVariables(existingVariables);
      } else {
        await this.saveVariables(importedVariables);
      }
    } catch (error) {
      throw new Error(`Failed to import variables: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get storage file path (for debugging)
   */
  getStorageFilePath(): string {
    return this.storageFile;
  }
}
