const API_BASE = 'http://localhost:5131/api';

export interface TestCase {
  id: string;
  title: string;
  type: string;
  priority: string;
  preconditions: string[];
  steps: string[];
  testData: Record<string, string>;
  expectedResult: string;
}

export interface TestCaseResponse {
  feature: string;
  summary: string;
  testCases: TestCase[];
}

export interface EdgeCase {
  id: string;
  scenario: string;
  description: string;
  impact: string;
  priority: string;
}

export interface ApiTestScenario {
  category: string;
  scenario: string;
  requestVerification: string;
  responseVerification: string;
  expectedStatusCode: number;
}

export interface AutomationSkeleton {
  testClass: string;
  pageObjectClass: string;
  selectorsFile: string;
  testDataFile: string;
  explanation: string;
}

export interface BugReport {
  title: string;
  environment: string;
  preconditions: string[];
  stepsToReproduce: string[];
  actualResult: string;
  expectedResult: string;
  severity: string;
  priority: string;
  possibleRootCause: string;
  suggestedAdditionalTests: string[];
}

export interface HistoryRecord {
  id: string;
  type: 'TestCase' | 'EdgeCase' | 'ApiTest' | 'Automation' | 'BugReport';
  inputData: string;
  outputResult: string;
  createdAt: string;
}

export const api = {
  generateTestCases: async (requirement: string): Promise<TestCaseResponse> => {
    const res = await fetch(`${API_BASE}/testcases/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirement })
    });
    if (!res.ok) throw new Error(await getErrorMessage(res));
    return res.json();
  },

  generateEdgeCases: async (requirement: string): Promise<EdgeCase[]> => {
    const res = await fetch(`${API_BASE}/edgecases/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirement })
    });
    if (!res.ok) throw new Error(await getErrorMessage(res));
    return res.json();
  },

  generateApiTests: async (endpoint: string, payload: string): Promise<ApiTestScenario[]> => {
    const res = await fetch(`${API_BASE}/api-tests/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint, payload })
    });
    if (!res.ok) throw new Error(await getErrorMessage(res));
    return res.json();
  },

  generateAutomation: async (requirement: string): Promise<AutomationSkeleton> => {
    const res = await fetch(`${API_BASE}/automation/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirement })
    });
    if (!res.ok) throw new Error(await getErrorMessage(res));
    return res.json();
  },

  generateBugReport: async (description: string): Promise<BugReport> => {
    const res = await fetch(`${API_BASE}/bug-report/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description })
    });
    if (!res.ok) throw new Error(await getErrorMessage(res));
    return res.json();
  },

  getHistory: async (): Promise<HistoryRecord[]> => {
    const res = await fetch(`${API_BASE}/history`);
    if (!res.ok) throw new Error(await getErrorMessage(res));
    return res.json();
  },

  getHistoryById: async (id: string): Promise<HistoryRecord> => {
    const res = await fetch(`${API_BASE}/history/${id}`);
    if (!res.ok) throw new Error(await getErrorMessage(res));
    return res.json();
  },

  deleteHistory: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/history/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(await getErrorMessage(res));
  },

  exportHistory: async (id: string, format: string, typeName: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/export/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format })
    });
    if (!res.ok) throw new Error(await getErrorMessage(res));

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const extension = format.toLowerCase() === 'markdown' ? 'md' : format.toLowerCase();
    a.download = `export_${typeName}_${id}.${extension}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
};

async function getErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.message || `HTTP error ${res.status}`;
  } catch {
    return `HTTP error ${res.status}`;
  }
}
