import React, { useState, useCallback } from 'react';
import { Copy, Download, CheckCircle } from 'lucide-react';

interface JsonOutputProps {
  data: any;
  filename?: string;
}

const JsonOutput: React.FC<JsonOutputProps> = ({ data, filename = 'converted-data.json' }) => {
  const [copied, setCopied] = useState(false);
  
  const formattedJson = JSON.stringify(data, null, 2);
  
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(formattedJson).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [formattedJson]);
  
  const handleDownload = useCallback(() => {
    const blob = new Blob([formattedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, [formattedJson, filename]);
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <h3 className="text-white font-medium">JSON Output</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleCopy}
            className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition"
            title="Copy to clipboard"
          >
            {copied ? <CheckCircle className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition"
            title="Download JSON"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="overflow-auto max-h-[400px] p-4 bg-gray-900">
        <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">{formattedJson}</pre>
      </div>
    </div>
  );
};

export default JsonOutput;