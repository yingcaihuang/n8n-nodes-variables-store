import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeConnectionType,
} from 'n8n-workflow';

import { VariablesStorage } from '../shared/VariablesStorage';

export class VariablesSet implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Variables Set',
    name: 'variablesSet',
    icon: 'file:variables-set.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["variableName"]}}',
    description: 'Set global variables (alternative to paid Variables feature)',
    defaults: {
      name: 'Variables Set',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Set Variable',
            value: 'set',
            description: 'Set a single variable',
            action: 'Set a variable',
          },
          {
            name: 'Set Multiple Variables',
            value: 'setMultiple',
            description: 'Set multiple variables from an object',
            action: 'Set multiple variables',
          },
          {
            name: 'Delete Variable',
            value: 'delete',
            description: 'Delete a variable',
            action: 'Delete a variable',
          },
          {
            name: 'Clear All Variables',
            value: 'clear',
            description: 'Delete all variables',
            action: 'Clear all variables',
          },
        ],
        default: 'set',
      },
      {
        displayName: 'Variable Name',
        name: 'variableName',
        type: 'string',
        default: '',
        placeholder: 'myVariable',
        description: 'Name of the variable to set',
        displayOptions: {
          show: {
            operation: ['set', 'delete'],
          },
        },
        required: true,
      },
      {
        displayName: 'Variable Value',
        name: 'variableValue',
        type: 'string',
        default: '',
        description: 'Value to store in the variable',
        displayOptions: {
          show: {
            operation: ['set'],
          },
        },
        required: true,
      },
      {
        displayName: 'Value Type',
        name: 'valueType',
        type: 'options',
        options: [
          {
            name: 'String',
            value: 'string',
          },
          {
            name: 'Number',
            value: 'number',
          },
          {
            name: 'Boolean',
            value: 'boolean',
          },
          {
            name: 'JSON',
            value: 'json',
          },
        ],
        default: 'string',
        description: 'Type of the variable value',
        displayOptions: {
          show: {
            operation: ['set'],
          },
        },
      },
      {
        displayName: 'Variables Object',
        name: 'variablesObject',
        type: 'json',
        default: '{}',
        description: 'Object containing multiple variables to set',
        displayOptions: {
          show: {
            operation: ['setMultiple'],
          },
        },
        required: true,
      },
      {
        displayName: 'Confirm Clear All',
        name: 'confirmClear',
        type: 'boolean',
        default: false,
        description: 'Confirm that you want to delete all variables',
        displayOptions: {
          show: {
            operation: ['clear'],
          },
        },
        required: true,
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const operation = this.getNodeParameter('operation', 0) as string;

    const storage = new VariablesStorage(this);

    for (let i = 0; i < items.length; i++) {
      try {
        let result: any = {};

        switch (operation) {
          case 'set':
            const variableName = this.getNodeParameter('variableName', i) as string;
            const variableValue = this.getNodeParameter('variableValue', i) as string;
            const valueType = this.getNodeParameter('valueType', i) as string;

            if (!variableName) {
              throw new NodeOperationError(this.getNode(), 'Variable name is required');
            }

            let processedValue: any = variableValue;

            // Process value based on type
            switch (valueType) {
              case 'number':
                processedValue = Number(variableValue);
                if (isNaN(processedValue)) {
                  throw new NodeOperationError(this.getNode(), 'Invalid number value');
                }
                break;
              case 'boolean':
                processedValue = variableValue.toLowerCase() === 'true';
                break;
              case 'json':
                try {
                  processedValue = JSON.parse(variableValue);
                } catch (error) {
                  throw new NodeOperationError(this.getNode(), 'Invalid JSON value');
                }
                break;
              case 'string':
              default:
                processedValue = String(variableValue);
                break;
            }

            await storage.setVariable(variableName, processedValue);

            result = {
              operation: 'set',
              variableName,
              value: processedValue,
              type: valueType,
              success: true,
            };
            break;

          case 'setMultiple':
            const variablesObject = this.getNodeParameter('variablesObject', i) as string;
            let variables: Record<string, any>;

            try {
              variables = JSON.parse(variablesObject);
            } catch (error) {
              throw new NodeOperationError(this.getNode(), 'Invalid JSON in variables object');
            }

            const setResults: Array<{ name: string; value: any; success: boolean }> = [];

            for (const [name, value] of Object.entries(variables)) {
              try {
                await storage.setVariable(name, value);
                setResults.push({ name, value, success: true });
              } catch (error) {
                setResults.push({ name, value, success: false });
              }
            }

            result = {
              operation: 'setMultiple',
              results: setResults,
              totalCount: setResults.length,
              successCount: setResults.filter(r => r.success).length,
            };
            break;

          case 'delete':
            const deleteVariableName = this.getNodeParameter('variableName', i) as string;

            if (!deleteVariableName) {
              throw new NodeOperationError(this.getNode(), 'Variable name is required');
            }

            const deleted = await storage.deleteVariable(deleteVariableName);

            result = {
              operation: 'delete',
              variableName: deleteVariableName,
              deleted,
              success: true,
            };
            break;

          case 'clear':
            const confirmClear = this.getNodeParameter('confirmClear', i) as boolean;

            if (!confirmClear) {
              throw new NodeOperationError(
                this.getNode(),
                'You must confirm clearing all variables'
              );
            }

            const clearedCount = await storage.clearAllVariables();

            result = {
              operation: 'clear',
              clearedCount,
              success: true,
            };
            break;

          default:
            throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
        }

        returnData.push({
          json: result,
          pairedItem: { item: i },
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: error instanceof Error ? error.message : String(error), success: false },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
