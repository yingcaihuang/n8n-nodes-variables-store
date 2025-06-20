import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeConnectionType,
} from 'n8n-workflow';

import { VariablesStorage } from '../shared/VariablesStorage';

export class VariablesManager implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Variables Manager',
    name: 'variablesManager',
    icon: 'file:variables-manager.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Manage global variables (import/export/backup)',
    defaults: {
      name: 'Variables Manager',
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
            name: 'Export Variables',
            value: 'export',
            description: 'Export all variables as JSON',
            action: 'Export variables',
          },
          {
            name: 'Import Variables',
            value: 'import',
            description: 'Import variables from JSON',
            action: 'Import variables',
          },
          {
            name: 'Get Info',
            value: 'info',
            description: 'Get information about variables storage',
            action: 'Get storage info',
          },
          {
            name: 'Backup Variables',
            value: 'backup',
            description: 'Create a backup of current variables',
            action: 'Backup variables',
          },
        ],
        default: 'export',
      },
      {
        displayName: 'JSON Data',
        name: 'jsonData',
        type: 'json',
        default: '{}',
        description: 'JSON data to import',
        displayOptions: {
          show: {
            operation: ['import'],
          },
        },
        required: true,
      },
      {
        displayName: 'Merge with Existing',
        name: 'mergeExisting',
        type: 'boolean',
        default: true,
        description: 'Whether to merge with existing variables or replace them',
        displayOptions: {
          show: {
            operation: ['import'],
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
        let result: any = {};

        switch (operation) {
          case 'export':
            const exportedJson = await storage.exportVariables();
            const variablesCount = await storage.getVariablesCount();

            result = {
              operation: 'export',
              variablesJson: exportedJson,
              variablesCount,
              exportedAt: new Date().toISOString(),
              success: true,
            };
            break;

          case 'import':
            const jsonData = this.getNodeParameter('jsonData', i) as string;
            const mergeExisting = this.getNodeParameter('mergeExisting', i) as boolean;

            await storage.importVariables(jsonData, mergeExisting);
            const newCount = await storage.getVariablesCount();

            result = {
              operation: 'import',
              merged: mergeExisting,
              variablesCount: newCount,
              importedAt: new Date().toISOString(),
              success: true,
            };
            break;

          case 'info':
            const count = await storage.getVariablesCount();
            const variableNames = await storage.getVariableNames();
            const storagePath = storage.getStorageFilePath();

            result = {
              operation: 'info',
              variablesCount: count,
              variableNames,
              storagePath,
              success: true,
            };
            break;

          case 'backup':
            const backupJson = await storage.exportVariables();
            const backupCount = await storage.getVariablesCount();

            result = {
              operation: 'backup',
              backup: JSON.parse(backupJson),
              variablesCount: backupCount,
              backupCreatedAt: new Date().toISOString(),
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
