import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeConnectionType,
} from 'n8n-workflow';

import { VariablesStorage } from '../shared/VariablesStorage';

export class VariablesGet implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Variables Get',
    name: 'variablesGet',
    icon: 'file:variables-get.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["variableName"]}}',
    description: 'Get global variables (alternative to paid Variables feature)',
    defaults: {
      name: 'Variables Get',
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
            name: 'Get Variable',
            value: 'get',
            description: 'Get a single variable value',
            action: 'Get a variable',
          },
          {
            name: 'Get All Variables',
            value: 'getAll',
            description: 'Get all variables as an object',
            action: 'Get all variables',
          },
          {
            name: 'List Variable Names',
            value: 'list',
            description: 'Get list of all variable names',
            action: 'List variable names',
          },
        ],
        default: 'get',
      },
      {
        displayName: 'Variable Name',
        name: 'variableName',
        type: 'string',
        default: '',
        placeholder: 'myVariable',
        description: 'Name of the variable to retrieve',
        displayOptions: {
          show: {
            operation: ['get'],
          },
        },
        required: true,
      },
      {
        displayName: 'Default Value',
        name: 'defaultValue',
        type: 'string',
        default: '',
        description: 'Default value to return if variable does not exist',
        displayOptions: {
          show: {
            operation: ['get'],
          },
        },
      },
      {
        displayName: 'Fail on Missing',
        name: 'failOnMissing',
        type: 'boolean',
        default: false,
        description: 'Whether to fail execution if variable does not exist',
        displayOptions: {
          show: {
            operation: ['get'],
          },
        },
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
        let result: any;

        switch (operation) {
          case 'get':
            const variableName = this.getNodeParameter('variableName', i) as string;
            const defaultValue = this.getNodeParameter('defaultValue', i) as string;
            const failOnMissing = this.getNodeParameter('failOnMissing', i) as boolean;

            if (!variableName) {
              throw new NodeOperationError(this.getNode(), 'Variable name is required');
            }

            result = await storage.getVariable(variableName);

            if (result === undefined) {
              if (failOnMissing) {
                throw new NodeOperationError(
                  this.getNode(),
                  `Variable '${variableName}' does not exist`
                );
              }
              result = defaultValue;
            }

            returnData.push({
              json: {
                variableName,
                value: result,
              },
              pairedItem: { item: i },
            });
            break;

          case 'getAll':
            const allVariables = await storage.getAllVariables();
            returnData.push({
              json: allVariables,
              pairedItem: { item: i },
            });
            break;

          case 'list':
            const variableNames = await storage.getVariableNames();
            returnData.push({
              json: {
                variables: variableNames,
                count: variableNames.length,
              },
              pairedItem: { item: i },
            });
            break;

          default:
            throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: error instanceof Error ? error.message : String(error) },
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
